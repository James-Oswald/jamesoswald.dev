+++ 
authors = ["James Oswald"]
title = "A Simple Typeclass for Logic Formulae in Lean4" 
date = "2025-04-21"
description = ""
math = true
draft = true
tags = ["Logic", "Lean4"]
+++

Last year, I made an attempt to formalize a wide class of logics ranging from propositional logic, first order logic, basic modal logics (K, KD45), Description Logics (ALC, fALC), relevance logic (B), and even situation calculus in Lean4. While the project itself made some progress, I inevitably got stuck on two issues: 
1) Proving metatheorems related to the languages of logics requires a more general notion of language than what a single inductive type can provide. In particular, certain objects like consequence relations and properties of consequence relations like being Tarskian are language agnostic, we want to parameterize out the notion of language.  
2) Lean does not seem to have a nice natural way to extend inductive types.

## A Typeclass for Formulae in Lean4 

While working on another project, an attempt at a Lean formalization of [Suszko's reduction](https://plato.stanford.edu/entries/truth-values/suszko-thesis.html), I came across a structure for languages which I quickly realized could be turned into a typeclass for inductive languages. Lets take a look at the final version:

```lean
/-
Kadlecikova 2025 page 11:
"A language L ... is the set of formulae built on the
non-empty set of atoms (Atom) and the propositional
connectives (C), with the set of sentences of L the
smallest set including Atom and closed under the
connectives from C."
-/
class Language (α : Type) where
  -- Equality of formulae is decidable
  α_deq : DecidableEq α
  -- The set of atoms and connectives in the language, indexed by arity
  -- Note: Atoms are treated as 0-place connectives
  connectives (n : Nat) : Set ((Fin n -> α) -> α)
  -- Condition: The set of atoms is non-empty
  atoms_ne : (cons 0).Nonempty
  -- The language is closed under the connectives
  -- IE, every element of the language has parse tree
  cons_parsable : ∀ (a : α), Nonempty (ParseTree cons a)
```

This class `Language α` says that a logic language type `α` can provide the following:
1) An algorithm to compare formulae (which we need if we want to have lean automatically derive operations on finite sets of formulae)
2) An indexed family of connectives, indexed by arity, where each connective is represented by a `(Fin n -> α) -> α`, this is essentially equivalent to the more intuitive `Vector α n -> α`, which constructs a formula out of a finite list of subformula, we merely use `(Fin n -> α) -> α` as the more type-theoretic way of doing things.   
 * Note that the 0-arity connective plays the special role of storing "atoms" the base formulae which are not built of other formulae.
4) A condition that: the set of atoms is non-empty, otherwise the language empty, no formulae can be constructed.
5) A condition that: α is closed under the set of connectives, which we take to be a weak condition that every formula has at least one parse tree under the connectives.
{{< notice warning >}}
Really this condition should probably be strengthened to say that every formulae has a *unique* parse tree under the connectives, but the current condition will serve our purpose.
{{< /notice >}}

To represent the type of parse trees of a formula `a` under an indexed family of connectives `c`, we use the following inductive type:
```lean
inductive ParseTree
  {α : Type}
  (c : (n : Nat) -> (Set ((Fin n -> α) → α))) :
  (a : α) -> Type
where
| node {a} {n : Nat} (f : (Fin n -> α) → α) (args : (Fin n -> α)) :
  c n f -> (∀ (i : Fin n), ParseTree c (args i)) ->
  f args = a -> ParseTree c a
```

The only constructor, `node`, takes:
1) a connective `f` representing the type of the node, 
2) `args` a map from positions to subformulae (child nodes)
3) `c n f` a proof that `f` is actually an n-ary connective. 
4) `(∀ (i : Fin n), ParseTree c (args i)) ` A parse tree for each subformulae (i.e, a proof that each subformula has a parse tree)
5) `f args = a ` a proof that the connective when given the subformulae actually produces the formulae we are constructing. 


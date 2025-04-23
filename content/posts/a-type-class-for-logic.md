+++ 
authors = ["James Oswald"]
title = "A Simple Typeclass for Logic Formulae in Lean4" 
date = "2025-04-23"
description = ""
math = true
draft = false
tags = ["Logic", "Lean4"]
+++

{{< notice note >}}
This post presents a basic (and most likely naive) typeclass for logic formulae. If you want more serious formulae typeclasses with a proven track record of being used to prove big results, I suggest looking at the recent incredible logic formalization work going on in the [Foundation project](https://github.com/FormalizedFormalLogic/Foundation) which aims to formalize core mathematical logic results in lean, and has already completed formalizations of Gödel's First and Second Incompleteness Theorems. 
{{< /notice >}}

Last year, I made an attempt to formalize a wide class of logics ranging from propositional logic, first order logic, basic modal logics (K, KD45), Description Logics (ALC, fALC), relevance logic (B), and even situation calculus in Lean4. While the project itself made some progress, I inevitably got stuck on two issues: 
1) Lean does not seem to have a nice natural way to extend inductive types. See [this post of mine](/posts/meditation-extending-inductive-types/) for a discussion on this issue.
1) Proving metatheorems related to the languages of logics requires a more general notion of language than what a single inductive type can provide. In particular, certain objects like consequence relations and properties of consequence relations like being Tarskian are language agnostic, we want to parameterize out the notion of language.  

While working on another project, an attempt at a Lean formalization of [Suszko's reduction](https://plato.stanford.edu/entries/truth-values/suszko-thesis.html), I came across a structure for languages which I quickly realized could be turned into a typeclass for inductive languages. Lets take a look at the final version:


## A Typeclass for Formulae in Lean4 


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

Thats it! Lets give an example by showing that a basic inductive propositional formula type is a language:
```lean
inductive PropFormula : Type
| atom : String -> PropFormula
| not : PropFormula -> PropFormula
| and : PropFormula -> PropFormula -> PropFormula
deriving Inhabited, DecidableEq, Repr
```
To keep things simple we only have negation and conjunction, perfectly suitable for a propositional language due to functional extensionally
(and with the added benefit of keeping the upcoming proofs shorter...).

To start we'll use some helpers that bundle our n-ary inductive constructors `a -> a -> ... -> a` into `(Fin n -> a) -> a` constructors. 

```lean
def Language.bundleZero {α} (f : α) : (Fin 0 → α) -> α :=
  λ _ => f

instance {α}: Coe α ((Fin 0 → α) -> α) where
  coe := Language.bundleZero

def Language.bundleOne {α} (f : α -> α) : (Fin 1 → α) -> α :=
  λ f1 => f (f1 0)

instance {α}: Coe (α -> α) ((Fin 1 → α) -> α) where
  coe := Language.bundleOne

def Language.bundleTwo {α} (f : α -> α -> α) : (Fin 2 → α) -> α :=
  λ f2 => f (f2 0) (f2 1)

instance {α}: Coe (α -> α -> α) ((Fin 2 → α) -> α) where
  coe := Language.bundleTwo
```

Now lets start with the things we need to construct our language instance, first the indexed family of connectives:

```lean
def PropFormula.connectives (n : Nat) : Set ((Fin n -> PropFormula) -> PropFormula) :=
  match n with
    | 0 => {↑(PropFormula.atom s) | s : String}
    | 1 => {↑PropFormula.not}
    | 2 => {↑PropFormula.and}
    | _ => ∅
```

Note that the ↑ is just calling the respective bundling conversion to a `(Fin n -> a) -> a` defined above.

Now a proof that the set of atoms is not empty, which we prove by just saying "a" is an atom. 

```lean
lemma PropFormula.atoms_ne : (PropFormula.connectives 0).Nonempty := by
  simp only [Set.Nonempty, Set.mem_setOf_eq];
  exists (λ _ => PropFormula.atom "a")
  exists "a"
```

And now finally the hardest part, proving that every formula has a parse tree under the connectives. While this is *hard* in the sense the proof is long, its actually a quite straightforward induction proof.

```lean
lemma PropFormula.cons_parsable : ∀ (a : PropFormula), Nonempty (ParseTree PropFormula.connectives a) := 
by
    intro f
    induction f
    . case atom s =>
      apply Nonempty.intro
      apply ParseTree.node (Language.bundleZero (PropFormula.atom s)) (λ _ => PropFormula.atom s)
      . simp only [PropFormula.connectives, setOf, exists_apply_eq_apply]
      . apply Fin.elim0
      . rfl
    . case not f ih =>
      apply Nonempty.intro
      have ih := Classical.choice ih
      apply ParseTree.node (Language.bundleOne PropFormula.not) (λa => f)
      . rfl
      . intro i
        exact ih
      . simp only [Language.bundleOne]
    . case and f1 f2 ih1 ih2 =>
      apply Nonempty.intro
      have ih1 := Classical.choice ih1
      have ih2 := Classical.choice ih2
      apply ParseTree.node (Language.bundleTwo PropFormula.and) (λa => match a with | 0 => f1| 1 => f2)
      . rfl
      . intro i
        match i with
        | 0 => exact ih1
        | 1 => exact ih2
      . simp only [Language.bundleTwo]
```

This is now everything we need to show that PropFormula is indeed a Language instance and we have:

```
instance : Language PropFormula where
  α_deq := inferInstance
  cons := PropFormula.connectives
  atoms_ne := PropFormula.atoms_ne
  cons_parsable := PropFormula.cons_parsable
```

You can run this code live on Lean 4 Web [here](https://live.lean-lang.org/#codez=JYWwDg9gTgLgBAWQIYwBYBtgCMB0ARFJHAZQFMYcAhJAZ2AGMAoUSWRFDbfQnAMWAB2NclVoNm4aPGRpMuAjCL8hIgDIoYDUqLpMWU9rK4KiZCgEkQSAOakJraRzndFfQcBja8pAGY17BjKc8jzKMACeYNoAwkhQACaMjML0mhACcOoC1gCuNnaMAPQAtIwACnHCcAAqUKSkNHA5AvGkUHBIcMLwED5w9OkCpKnAAG4NAFyM5ghlqgCiCPMActUAgtXmAPLLcMtb1fPEE3BlOTCa2XBopHAAFJ0ngI3AAJQdPp7tN3AnwI11AEccsA6vEAIRwMikKaoC5gGgTQqFMBQCC9Wh0GiKAQwGg4LFIegAa1IAA96KgkNltAMQIUgQ00kJCgAWADMACYAGyFVo+dzZYpIYpgOJIEDkNrAABepHiItRUVg4WKgmK6FIVOKLMYxUKzBaORG41OlVItXqjDgcAA3k8fjVIqQAL5W+70B13DInZYoN7FAB89zM9zuyjgGUDcFecEASYTRl6Jn5uh4OmNR6pOxgAd1QbTsAB8IxBWrbHtHnbbvXsUJW7n0TmHBBG4FGY/GYw8oNZGo3w5Gg683lNrR6Mn0o3dAABE92ADv7LwANKaoMILbcPV2e3BgEnA26+nFtwBeDqtoMVVfmuobjpJEqMADSSHiGvowCJEFGnQ5AAYOQArHAoq2HAACMYFTAARGscDoFSuT5JkcA4KhO6NN83RwL0cA+NAIA5PBtxYMC6A9BkNyMAI6TFKQ4ARF05DYYeMAQCAjR3GsrEgG8VLxNcebAYqEB0EySDoIwAwCEMxoNPc0RLnA2YeKgAm3FhOHCDipACPQck4aoanJFY6AalijHwII9DoDk8SCNYcBcWxHQtP06AiXKTQtG0RlSTJmjjI0PioiAcDRDgUG6vq1kYpkCF5KBdz2icmZRG8ub5m6xTFHA8xAuJHjhMxuH4YRSC3H8cCtO+8RIFgGpuk8AD6rQAg63g1XVGp5dGWU5SYKWCRpLFsY0fH9IMwwBXJzbfPB2QJXY1rZY53FjXU1x1Cgnm0HAv4ivBekTdJU1jA0bpSRx1a+jAw6QkxdxNhkA4JnGCZ9WF6R2Uyg3qUxOEoKN6HFgItH0eEbqA+xTVDJ6l17S8ODLOkdFgBEH3VIJ82IaBlXWR5/HNK0XyCX5p2BR95jzMupDjFARWkBqEo4sVc3xUhlKNKKV6bZay05UTPnfGTsn+PzpwAEpbFsvBwAAEuYqwnOYGSqJqAjLtmtwRGADDiegRV8oItzY4tY2NII8RGtN1xOjQi4fWgOSNFrQlftrkR66ZRUou7AmVaMwCdJb1vAOk2EUXmH1YlA1s5BtOHfILUAG/ZttRB90RbAgSxKzUqCVWAh1ydRcB1DHDBMgJKBqcBZqOzewPNMADKawXFJu1gXVFYHEDwZ4GFDbrUAeMxjuCUbAgeGHGQA3B7O2Bd6Q0E13M0F1twnDOqbPIpyNDOD9yXmujfw0gLxJCtmO3HhpkQMpVxxLceboEqGEQHAJEtBqZeaugx3+TOv4FavRPAZFmoJPCUBQo4XtFGVCOAXr2kEKxXUOUfDNBGMvVmTp7j9jeumQcjA+RxQWvkHAX9XykAAFptA/naOsDZXp9mbL+Ah/pBw/GPG6QA3cBwCanAY8QYfBJEEASXStwGEnGiBAW49pHrhjYR2Dhr0Mp1CXpvU8WQcbaEoRqWhqIkgkO0YtChRMNRbFhgw+4TC4GDjuk9cC7DzzRi4bw3CYFBHCJsZ438F8DTiKOlIz6twkouM7I4zxyjwnpTzOo0csiuGkJ0WY7+pBLEFBWpQcxtxOgwGzB/IuhINyTVkjuHEH9Ojhg5LhTBTJiG+GSaYvR5oCm2ieIwtM4SYmemqc4tsbjrR8J8DUoRuEbE1L8RM8C/ixHYiCR06RiSwkDLbG8BRzYanRLWUpOJS0JqaKaeQlp1QCmXxytfI5oEcK+0gKJGe4k4IQGsOIEOZSyiKl4KVeCDpUqFg6NxB0xAYAjyuFGD5EAwBfOgWVRgRZqLwBOBCqF3zOjgs+aiuFLl+JIoxTCn56LIXQoIgSi8eKSVIAaSPQOVwVaUiwB4OUy4OrAFqvVUgeVlwS1ICiIxjTkXErKjgEW00roOhundEMGznouIFailRcr8Xn0GXAKwMAO4ZGUmgN01oixsLGTaQAiYR3EVRSnAUMuhvCLL2SEIL7KumtLqpxBrDWmqFQih1jqiyjKDEat18FzUtE9U6gRYzACgREkJmVhTjkqFVDFesNGz+qICKoBCMkYo0PhMU8WAIbWjoOACOBs4AAG0zAZoPmjcIy5y0ShAE1boWwfBNVIACAAugAbjdGSP4uJ7h8NDWSolqLzWAqgkgKCF9rQ9qxI0cdkVGBRs6Mm4Vy9V6VA3g6be5Zk170zVWo+Zp1wxuHUq1dJ1RYdGHNw3NOrykgo/iIx15SrZYPHHenA/RaC5MBY0IRd7rRIDAEXIq+9UYRBwCgwxz7APAeLcfa89REEllCSY45OSDEfxNbGgNFqaBJjuAOrxJ6UVnrw1OmDn6C1gCLUVEtK7U2BWXI2nwNNSS9pXkBkDLaARNS4wbNtAGUIdDg0VZQOBGagF/EJz9UAfASWfZ++g37izwD6MAVS/6YMiZA3sfdEGoMQCE5SE0GmknRHgjQXQ4lhWoAgFoHcqAhP8aKgh9cyHSx3DQ7YVJVCMkkcFQGhF6yeGdDGT4Cjimy7yZk/e1EO4hPTtJISSyTntNUZYLR0t3ndE5IyYJqLymqjjR8J4kZjnPEaZ9c50TenK0GZxNBmDJmKqoE8dmsKlnrPoFs/Zo6GmwLGaQKZ1ANSOsWYxF7XrDmqs1d025m8HnUML1y2k05H8V18RC2FoMaqO6dC1apPVxHStFk8eFjkkXHWyZi+luLH9gCJdVSgDuc5DtPeO2MskKWKsfedUGb7qRHMcli9RrLJacu+Y1OtwTAT5mbyubcZNuzMrWmaq1JJggfBtBVoE/Z8MOsMdKaKyGa0YaHM22ToYS8hDrtXJuwnOGU1rrXhvRgQA)!


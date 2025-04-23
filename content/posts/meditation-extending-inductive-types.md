+++ 
authors = ["James Oswald"]
title = "A Meditation on Extending Inductive Types in Lean4" 
date = "2025-04-23"
description = ""
math = true
draft = false
tags = ["Logic", "Lean4"]
+++

As of writing Lean does not seem to have a natural way in the language to *extend* inductive types. In this post I contextualize the issue with a simple example of formulae, discuss what I would like out of inductive extension, and discuss some approaches to mimicking the desired behavior.

Lets begin with an example to demonstrate what we mean by extending inductive types. For this example we look at how we would typically define a formula type for modal logic. If we have an inductive type representing propositional formulae:
```lean
inductive PropFormula where
| atom : String -> PropFormula
| not : PropFormula -> PropFormula
| and : PropFormula -> PropFormula -> PropFormula
```
We can't just represent modal formulae with something along the lines of
```lean
inductive ModalFormula extends PropFormula where
| box : ModalFormula -> ModalFormula
```
We instead need to actually define out the language in full:
```lean
inductive ModalFormula where
| atom : String -> ModalFormula
| not : ModalFormula -> ModalFormula
| and : ModalFormula -> ModalFormula -> ModalFormula
| box : ModalFormula -> ModalFormula
```
Tragically it feels like we're losing something here, `PropFormula` and `ModalFormula` are not explicitly related, and we can't easily extend metatheorems we prove via structural induction on `PropFormula` to `ModalFormula` by only adding a case for the box. First, lets discuss why there is probably no way to extend inductive types like this in a way that makes everyone happy. 

The above example is clearly biased to make it look like this is a natural and easy extension, but there are non-trivial questions on the semantics of how extension would behave on inductive types. For structures `extends` behaves as the product operator: if we have `structure A where (a: Nat) (b: Nat)` and `structure B extends A where (c : Nat)`.`B` behaves identically to `Nat × Nat × Nat` modulo member names. 

We might expect extension of inductive types to behave the same way where extends behaves as a sum operator on members of an inductive type. This would work fine if inductive types were merely sum types. For example, a single color channel selection enum `inductive RGB_channel where | R | G | B` and its extension to an RGBA channel selection enum `inductive RGBA_channel where | A` would be expected to be equivalent to `Unit ⊕ Unit ⊕ Unit` and `Unit ⊕ Unit ⊕ Unit ⊕ Unit` respectively modulo aliases for the constructors (i.e. `def R = Sum.inl ()` etc). 

The existence of specifically inductive constructors throws a wrench in this: in the above example, unless ALL `PropFormula` in the `PropFormula` constructors become `ModalFormula` under the extension, we do not get the behavior we want. If only the codomain (`domain1 -> domain2 -> ... -> codomain`) of the constructors for `PropFormula` become `ModalFormula` then our modal formulae type would exclusively be those with boxes at the top level. This is clearly not what we want in this specific case, but we might want this behavior other under other circumstances, hence there are decisions that need to be made with what extension would look like. 

It is possible that we could use some [Metaprogramming in Lean4](https://github.com/leanprover-community/lean4-metaprogramming-book) here to add a the type of inductive extension we want to the language, by generating redundant inductive constructors from an extended type according to the informal semantics given above. This however does not solve the original problem, our `PropFormula` and `ModalFormula` are still not explicitly related. 

One approach to solving this relation issue may be automatic generation of custom `recOn` and `casesOn` functions for our extended inductive types using metaprogramming, by automatically showing that there is an isomorphism between a the propositional subtype of `ModalFormula` and `PropFormula`. This would hopefully allow us to use proof of a `PropFormula` property to prove the same property holds for `ModalFormula` property holds merely by proving the box case. This seems possible but non-trivial, and requires more research.
  
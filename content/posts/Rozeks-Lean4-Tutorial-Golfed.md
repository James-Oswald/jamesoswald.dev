+++ 
authors = ["James Oswald"]
title = "Golfing Rozek's Lean4 Tutorial" 
date = "2024-03-18"
description = ""
math = true
tags = ["Lean4", "Formal Methods"]
series = []
+++

## Background

Today my colleague Brandon Rozek released [a new Lean4 tutorial](https://brandonrozek.com/blog/lean4-tutorial/) on his blog.
Brandon really likes for people to be able to read his proofs (for some unknown reason). I decided to write this companion piece
where I showcase what Lean4 looks like when you don't care if people can read it. Towards this end I will be [golfing](https://en.wikipedia.org/wiki/Code_golf) Brandon's tutorial, that is, going for the shortest proofs I can come up with for each provided theorem. Due to this, almost all of my proofs will be done constructively rather than using [tactics](https://lean-lang.org/theorem_proving_in_lean4/tactics.html), as you can often get much shorter proofs outside of tactic mode. 

Reading and understanding these is great practice if you ever want to try understanding [mathlib](https://leanprover-community.github.io/mathlib4_docs/Mathlib.html), as the developers frequently write completely unreadable non-tactic based proofs. 

All examples can be run live on Lean4 Web [here](https://live.lean-lang.org/#code=import%20Mathlib%0D%0A%0D%0Aexample%20(H_p%20%3A%20p)%20(H_q%20%3A%20q)%20%3A%20p%20%E2%88%A7%20q%20%3A%3D%20%0D%0A%20%20And.intro%20H_p%20H_q%0D%0A%0D%0Aexample%20(H_pq%20%3A%20p%20%E2%88%A7%20q)%20%3A%20p%20%3A%3D%20%0D%0A%20%20And.left%20H_pq%0D%0A%0D%0Aexample%20(H_p%20%3A%20p)%20%3A%20p%20%E2%88%A8%20q%20%3A%3D%0D%0A%20%20Or.intro_left%20q%20H_p%0D%0A%0D%0Aexample%20(H_pr%20%3A%20p%20%E2%86%92%20r)%20(H_qr%20%3A%20q%20%E2%86%92%20r)%20(H_pq%20%3A%20p%20%E2%88%A8%20q)%20%3A%20r%20%3A%3D%0D%0A%20%20Or.elim%20H_pq%20H_pr%20H_qr%0D%0A%0D%0Aexample%20(H_pq%20%3A%20p%20%E2%86%92%20q)%20(H_pnq%20%3A%20p%20%E2%86%92%20%C2%ACq)%20%3A%20%C2%ACp%20%3A%3D%20%0D%0A%20%20%CE%BBH%20%3D%3E%20Not.elim%20(H_pnq%20H)%20(H_pq%20H)%0D%0A%20%20%0D%0Aexample%20%7Bp%3A%20Prop%7D%20(H_nnp%20%3A%20%C2%AC%C2%ACp)%20%3A%20p%20%3A%3D%20%0D%0A%20%20Classical.not_not.mp%20H_nnp%0D%0A%0D%0Aexample%20(P%20%3A%20%CE%B1%20%E2%86%92%20Prop)%20(H%20%3A%20%E2%88%80%20x%2C%20P%20x)%20%3A%20P%20y%20%3A%3D%20%0D%0A%20%20H%20y%0D%0A%0D%0Aexample%20(P%20Q%20R%20%3A%20%CE%B1%20%E2%86%92%20Prop)%20(H_pq%20%3A%20%E2%88%80%20x%20%3A%20%CE%B1%2C%20P%20x%20%E2%86%92%20Q%20x)%0D%0A(H_qr%20%3A%20%E2%88%80%20x%20%3A%20%CE%B1%2C%20Q%20x%20%E2%86%92%20R%20x)%20%3A%20%E2%88%80%20x%20%3A%20%CE%B1%2C%20P%20x%20%E2%86%92%20R%20x%20%3A%3D%20%0D%0A%20%20%CE%BBx%20Px%20%3D%3E%20H_qr%20x%20(H_pq%20x%20Px)%0D%0A%0D%0Aexample%20(P%20%3A%20%CE%B1%20%E2%86%92%20Prop)%20(H%3A%20P%20y)%20%3A%20%E2%88%83%20x%3A%20%CE%B1%2C%20P%20x%20%3A%3D%20%0D%0A%20%20Exists.intro%20y%20H%0D%0A%0D%0Aexample%20%7Bp%20%3A%20%CE%B1%20%E2%86%92%20Prop%7D%20(H_epx%20%3A%20%E2%88%83%20x%2C%20p%20x)%0D%0A(H_pab%20%3A%20%E2%88%80%20(a%20%3A%20%CE%B1)%2C%20p%20a%20%E2%86%92%20b)%20%3A%20b%20%3A%3D%0D%0A%20%20Exists.elim%20H_epx%20H_pab%0D%0A%0D%0Aexample%20(as%20%3A%20List%20%CE%B1)%20%3A%20as%20%2B%2B%20%5B%5D%20%3D%20as%20%3A%3D%0D%0A%20%20List.recOn%20as%20rfl%20(%CE%BBh%20t%20ih%20%3D%3E%20by%20simp%20%5Bih%5D)%0D%0A%0D%0Aexample%20(as%20bs%20%3A%20List%20%CE%B1)%20%3A%20(as%20%2B%2B%20bs).length%20%3D%20as.length%20%2B%20bs.length%20%3A%3D%0D%0A%20%20List.recOn%20as%20(by%20simp)%20(%CE%BBh%20t%20ih%20%3D%3E%20by%20simp%20%5Bih%5D%3B%20linarith))

# Disjunction and Conjunction 
None of these rules are particularly interesting or deviate substantially from the proofs presented in Rozek's tutorial.
### Conjunctive Introduction
```lean
example (H_p : p) (H_q : q) : p ∧ q := 
  And.intro H_p H_q
```
### Conjunctive Elimination
```lean
example (H_pq : p ∧ q) : p := 
  And.left H_pq
```
### Disjunctive Introduction
```lean
example (H_p : p) : p ∨ q :=
  Or.intro_left q H_p
```
### Disjunctive Elimination
```lean
example (H_pr : p → r) (H_qr : q → r) (H_pq : p ∨ q) : r :=
  Or.elim H_pq H_pr H_qr
```
# Negation
A bit more interesting, we can use `Not.elim` for a particularly elegant proof of negation introduction.
For double negation elimination we just use `Classical.not_not`. 
### Negation Introduction
```lean
example (H_pq : p → q) (H_pnq : p → ¬q) : ¬p := 
  λH => Not.elim (H_pnq H) (H_pq H)
```
### Double Negation Elimination 
```lean
example {p: Prop} (H_nnp : ¬¬p) : p := 
  Classical.not_not.mp H_nnp
```
# First Order Logic 
Universal introduction is the only slightly elegant one of these. 
The rest are already quite simple, even in Rozek's tutorial.
### Universal Elimination
```lean
example (P : α → Prop) (H : ∀ x, P x) : P y := 
  H y
```
### Universal Introduction
```lean
example (P Q R : α → Prop) (H_pq : ∀ x : α, P x → Q x)
(H_qr : ∀ x : α, Q x → R x) : ∀ x : α, P x → R x := 
  λx Px => H_qr x (H_pq x Px)
```
### Existential Introduction
```lean
example (P : α → Prop) (H: P y) : ∃ x: α, P x := 
  Exists.intro y H
```
### Existential Elimination
```lean
example {p : α → Prop} (H_epx : ∃ x, p x)
(H_pab : ∀ (a : α), p a → b) : b :=
  Exists.elim H_epx H_pab
```
# Induction
I use the real list class instead of Rozek's custom list class.
### Append Nil
The goal is to prove the [`List.append_nil`](https://leanprover-community.github.io/mathlib4_docs/Init/Data/List/Basic.html#List.append_nil) theorem that an empty list appended to any list returns the original list.
This is a clear usecase for structural induction. In tactic mode we would use the `induction`
tactic, but we can get a much shorter proof using `List.recOn`. 
```lean
example (as : List α) : as ++ [] = as :=
  List.recOn as rfl (λh t ih => by simp [ih])
```
### Length Append
The goal is to prove the [`List.length_append`](https://leanprover-community.github.io/mathlib4_docs/Init/Data/List/Basic.html#List.length_append) theorem, which states that the length of a list formed from appending two lists is the sum of the originals lengths. While Rozek's tutorial  gives this as an example of something you can use double induction to solve, you actually only need single induction to solve it. My proof is just a
`List.recOn` version of the proof given for `List.length_append` in the source that uses `linarith` to save characters over `Nat.succ_add`. 
```lean
example (as bs : List α) : (as ++ bs).length = as.length + bs.length :=
  List.recOn as (by simp) (λh t ih => by simp [ih]; linarith)
```

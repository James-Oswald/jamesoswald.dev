+++ 
authors = ["James Oswald"]
title = "Extracting Terms from Big Operators on Sequences in Mathlib" 
date = "2025-08-29"
math = true
tags = ["Lean4","Mathlib"]
series = []
draft=false
+++

{{< notice note >}}
This post is about `Set.iUnion` and `tsum`, almost exclusively over infinite sequences. We will make use of `Finset.sum` and by proxy but not focus on it. Examples tested in Lean version 4.23.0.
{{< /notice >}}

Recently I've started using Lean4 and Mathlib for formalizing things like countable additivity and variants, for probability measures and semimeasures. i.e $P$ has countable additivity iff for all $A$:

$$
P(\bigcup^\infty_{i=0} A_i) = \sum^\infty_{i=0} P(A_i)
$$

(Where given some event space $F$, we have a pairwise disjoint sequence of events $A : \mathbb{N} \to F $ and probability measure $P : F \to [0, 1]$ )

To formalize something like this, we need ways of representing infinite sums and unions in Lean4. Thankfully Mathlib has the tools we need, [`Set.iUnion`](https://leanprover-community.github.io/mathlib4_docs/Mathlib/Order/SetNotation.html#Set.iUnion) for infinite unions and [`tsum`](https://leanprover-community.github.io/mathlib4_docs/Mathlib/Topology/Algebra/InfiniteSum/Defs.html#tsum) (topological sum) for infinite sums. 
In this post I catalog some basic extraction theorems from mathlib I've found for these. 

Almost all of these properties have `Set.iInter` and `tprod` variants. In the case of `tprod`, mathlib actually has special macros that generate all the `tsum` theorems directly from the `tprod` ones, pretty cool! 

### Signatures and notation of `Set.iUnion` and `tsum`  

```lean
def Set.iUnion {α : Type u} {ι : Sort v} (s : ι → Set α) : Set α := ...
``` 
Takes an indexed family of sets `s` and returns their union. The special Mathlib notation for this is `⋃ i, s i`. In our case, for infinititary unions we index our sets by natural numbers `Nat`/`ℕ`. In other words given a countably infinite sequence of sets `s : Nat -> Set α` we have that `⋃ (i : Nat), s i` is equivalent to our familiar
$\bigcup^\infty_{i=0} s_i$. 

If we instead have a finite sequence of sets `s : Fin n -> Set α` indexed by `Fin n` (the type of numbers less than the `n`) we then have  `⋃ (i : Fin n), s i` is equivalent to $\bigcup^n_{i=0} s_i$.

If `s` not indexed / unordered (i.e. `s : Set (Set α)`) you should instead use `Set.sUnion` notated `⋃₀ s` which is equivalent to $\bigcup_{e \in s} e$ (but we do not cover this here).

```lean
noncomputable def tsum {α : Type u_4} [AddCommMonoid α] [TopologicalSpace α] {β : Type u_5} (f : β → α) : α := ...
``` 

`tsum` takes a function `f` mapping indexes `β` to some type `α` that has properties (`AddCommMonoid` and `TopologicalSpace`) allowing it to support infinite sums. For this post we will always sum over reals `Real`/`ℝ` which has instances for these. The special Mathlib notation for this is `∑' i, f i` which when using `Nat` as our index type is equivalent to $\sum_{i=0}^\infty f(i)$. As with unions, if we instead use `Fin n` as our index type we get $\sum^n_{i=0} f(i)$. Note that this tsum over a finite type is equivalent `Finset.sum` denoted `∑ i, f i` by the theorem `tsum_fintype`. We will see `finsum` in a few theorems with `tsum` regarding the extraction of finite parts of the sum.

Many theorems about `tsum` will require us to prove 
[`Summable f`](https://leanprover-community.github.io/mathlib4_docs/Mathlib/Topology/Algebra/InfiniteSum/Defs.html#Summable), that the infinite sequence `f : Nat -> Real` has an existent `Real` sum, there are many theorems that help with the construction `Summable` predicates, which we may use when necessary. 

### Extracting Single Sets and Summands 

$$
\bigcup^\infty_{i=0} s_i = s_0 \cup \bigcup^\infty_{i=0} s_{i+1}
$$

In Mathlib, we can get this this directly by `Set.sup_iSup_nat_succ` (this is by definition [`Set.iUnion s = iSup s`](https://leanprover-community.github.io/mathlib4_docs/Mathlib/Order/SetNotation.html#Set.iUnion) or as the theorem [Set.iSup_eq_iUnion](https://leanprover-community.github.io/mathlib4_docs/Mathlib/Order/SetNotation.html#Set.iSup_eq_iUnion))

```lean
example {α} (s : ℕ → Set α) :
(⋃ n, s n) = s 0 ∪ (⋃ n, s (n + 1)) := 
  Eq.symm (sup_iSup_nat_succ s)
```

For sums we have:

$$
\sum^\infty_{i=0} s_i = s_0 + \sum^\infty_{i=0} s_{i + 1}
$$

Assuming we have `Summable s`, then we this is exactly [Summable.tsum_eq_zero_add](https://leanprover-community.github.io/mathlib4_docs/Mathlib/Topology/Algebra/InfiniteSum/NatInt.html#Summable.tsum_eq_zero_add).

```lean
example (f : ℕ -> ℝ) (H : Summable f):
(∑' i, f i) = f 0 + (∑' n, f (n + 1)) :=
  Summable.tsum_eq_zero_add H
```

### Extracting Subsequences 

$$
\sum^\infty_{i=0} s_i = \sum^n_{i=0}s_i + \sum^\infty_{i=0} s_{n+i}
$$

This is analogous to [`Summable.sum_add_tsum_nat_add`](https://leanprover-community.github.io/mathlib4_docs/Mathlib/Topology/Algebra/InfiniteSum/NatInt.html#Summable.sum_add_tsum_nat_add)
```lean
theorem Summable.sum_add_tsum_nat_add {G : Type u_2} [AddCommGroup G] [TopologicalSpace G] [IsTopologicalAddGroup G] [T2Space G] {f : ℕ → G} (k : ℕ) (h : Summable f) :
∑ i ∈ Finset.range k, f i + ∑' (i : ℕ), f (i + k) = ∑' (i : ℕ), f i
```
Note that this uses `Finset.sum` for the first sum, but we can get rid of this to get a more natural tsum split theorem as: 
```lean
example {f : ℕ -> Real} {H : Summable f} (n : ℕ) :
  (∑' i, f i) = (∑' (i : Fin n), f i) + (∑' i, f (i + n)) := by
  symm
  rw [tsum_fintype, Fin.sum_univ_eq_sum_range]
  apply Summable.sum_add_tsum_nat_add n H
```

Finally to extract a union sub-sequence:

$$
\bigcup^\infty_{i=0} s_i = \\bigcup^n_{i=0}s_i \cup \bigcup^\infty_{i=0} s_{n+i}
$$

I was not able to find a nice mathlib theorem, but wrote my own using extensionally. 

```lean
example {α} {s : ℕ -> Set α} (n : ℕ) :
  (⋃ i, s i) = (⋃ (i : Fin n), s i) ∪ (⋃ i, s (i + n)) := by
  ext x
  simp only [Set.mem_iUnion, Set.mem_union]
  constructor
  . case h.mp =>
    intro ⟨i, hi⟩
    by_cases h : i < n
    . case pos =>
      left
      use ⟨i, h⟩
    . case neg =>
      right
      exists i - n
      have : i = (i - n) + n := by omega
      rw [<-this]
      exact hi
  . case h.mpr =>
    intro H
    cases H
    . case inl h =>
      have ⟨i, hi⟩ := h
      exists i
    . case inr h =>
      have ⟨i, hi⟩ := h
      exists i + n
```

All code on can be run [here](https://live.lean-lang.org/#project=mathlib-stable&codez=JYWwDg9gTgLgBAWQIYwBYBtgCMBQOCmAHkuOvnAN6CNwAL5wAUAznAFxyCohHIEmEcAyvvCoBKVjnqBhojgA7ADRxmUkQF55cAAxxAVEQNJs1fSlwA1HACMQkSxU44cAKIBHAHSMAniBANGAVzAB9YF5fPykUPx8AYwj5ITwiEjAyBgAzVg44AFoAPjhAXEIRegAJNKCPJCwk5KEWMUBEIgByOGA5VOBlOFSNE3oG6RaGQxNzSyUbPm8yivwnGB8QP3wHPwAvfCgIPyQAEy24QrjiUnIKVLZObLgAJXwkdDoKYrZSkHLKugM09ksxnsbmjqa7V+DGAaQAYsBDIp+m1jAxev9UvRQSZFCM4FhXGM3B4xlAAO5wADaswmfmSkJgrjA+DkEKkLjJ3ikwAAbgslnM/FAkFIAOb4AC6YyQYESrnGkzIjPm2y2flJ81CME2O2kezGBEOiWOtEozDOmRy/EE70MZ2+tgkTTkzFhKmtyPBkOkQltgK0Oht+hRrvRmLGRHghGxoDAcAgUnQEqJJqcIHw82AAFUWZG5HGE/NmcBI8LbBFI4wYFBvBEYNAxk44BEkIxyKh4+GlFkxrZKes4IAL8n+qGAgEvyNsY1x+Wv15ioNKggA80iH1bH5EgzBbQ9sZGSMDXcG89e7vcHtlsC7r5Ck+D5cFXR6PUGAfNQW5vtiIwGLdsyc+fcFQSFZ5DYUEHVBDJXThc0VExCMEz5JBtwJYlpwyNA33zZ94nLH9gCrGtTx/JsoCvVsbw7CANRvRdmH2G8Tz3SF0B/Ijt1/f99zkPt+1YFRUG3V93yaedcLoqRCMna9nxY8ge3YgcuJ/XjCDfWYmnAoA) on Lean4 web (subject to breaking changes if anything updates). 
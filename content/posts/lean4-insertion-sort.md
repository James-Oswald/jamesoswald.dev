+++ 
authors = ["James Oswald"]
title = "Proving the Correctness of Insertion Sort in Lean4" 
date = "2024-02-18"
description = ""
math = true
tags = ["Lean4", "Formal Methods", "Algorithms"]
series = []
+++

# Background

When I first started learning Lean almost a year ago now, in the first week after proving the correctness of simple list operations such as insertion and appending, I decided it would be a fun challenge to try and prove the correctness of a sorting algorithm in Lean3. I failed spectacularly. I asked my colleague [Brandon Rozek](https://brandonrozek.com/) about this, and he pointed me to the [Software Foundations](https://softwarefoundations.cis.upenn.edu/) book series on formalizing and proving properties about algorithms in Coq. He also told me that for a beginner sorting is quite a challenge, they do not cover it until the third book in the series! (For those interested their chapter with the proof of correctness for insertion sort in Coq [is available online here](https://softwarefoundations.cis.upenn.edu/vfa-current/Sort.html)). 

Now a year later and much more familiar with Lean (specifically Lean4), I've decided to take another crack at the problem. 

# Insertion Sort

[Insertion Sort](https://en.wikipedia.org/wiki/Insertion_sort) is a well known quadratic time sorting algorithm. We will describe a variant that is not done in in-place. It operates by taking an element from an unsorted list and inserting the element into a new list at the appropriate location such that after the insertion the new list is sorted. This is repeated for all elements in the unsorted list. To determine the location at which to insert each element in the new list, we iterate through elements in the new list and compare them with the element to insert until we find the correct location. It should be clear that this process of inserting is an $O(n)$ time operation, in the worst case scenario we must compare the element to insert with all elements in the new list. The need to do this for each element in the old list introduces another $n$ factor into the complexity hence the final quadratic complexity. 

The following is an implementation of insertion sort in Lean4. We separate out insertion of an element into a sorted list as its own method. Sorting then is just the process of repeatedly inserting each element in the unsorted list into the new list.     

```lean
--Inserts a number n into a sorted list such 
--that the list remains sorted.
def sInsert (n : Nat) : List Nat -> List Nat
| [] => [n]
| h::t =>
  if n ≤ h then
    n :: h :: t
  else
    h :: sInsert n t

--The insertion sort algo 
def sort : List Nat -> List Nat
| [] => []
| h::t => sInsert h (sort t)
```

# Specification

### Sorted

What does it mean for a list of numbers to be sorted? 
An empty list is sorted. A list with a single number is sorted. But anything with more than two
elements requires the first element to be less than the 2nd element, and so on. We encapsulate
this with the following predicate. 

```lean
--sorted is a predicate that takes a list and returns iff it is sorted
def sorted : List Nat -> Prop
--An empty list is sorted
| [] => True
--A list containing a single element is sorted
| [_] => True 
--A list with 2 or more elements is only sorted if all
--elements are ordered.
| h1 :: h2 :: t => h1 ≤ h2 ∧ sorted (h2 :: t)
```
### Permuted

Beyond just ensuring that our algorithm sorts the list, we also need to ensure it returns
a list with all the same elements as the original list and thus has not discarded from the
original or added anything in the new sorted list.

For proving this we will use the predicate [`List.Perm`](https://leanprover-community.github.io/mathlib4_docs/Std/Data/List/Basic.html#List.Perm) from the standard library.

### Termination?

Lean4 automatically proves termination for us. If Lean4 fails to prove termination it will not let us define the function (without a special keyword such as `noncomputable` or `partial`). Since it allowed us to define `sort` and `sInsert` without issue, we can be certain of a formal guarantee of termination. 

# Proof Of Correctness

### Sort Returns a Sorted List

To prove that `sort` returns a sorted output we will use an auxiliary lemma that if $l$ is sorted, then after inserting $n$ into $l$
will keep the list sorted. We prove this by induction on $l$. The majority of the work is dealing with all the 
individual cases of $n \leq h$ on the multiple branches of the proof, but each individual case is quite simple.
Note the need to expand the first tail so we have two elements `h1` and `h2` to work with due to our definition of `sorted`.

```lean
/-
If a sorted list is passed to sInsert,
it will return a sorted list after inserting a new elm.
-/
lemma sInsert_sorted (l : List Nat) (n : Nat) :
sorted l -> sorted (sInsert n l) := by
  induction l
  . case nil => simp [sorted]
  . case cons h1 t1 ih =>
    cases t1
    . case nil =>
      by_cases H2 : n ≤ h1
      . case pos => simp [sInsert, H2, sorted]
      . case neg =>
        simp [sInsert, H2, sorted]
        exact Nat.le_of_lt (Nat.lt_of_not_le H2)
    . case cons h2 t =>
      by_cases H2 : n ≤ h1
      . case pos => simp [sInsert, H2, sorted]
      . case neg =>
        by_cases H3 : n ≤ h2
        . case pos =>
          simp [sInsert, H2, sorted, H3]
          intro _
          apply And.intro
          . case left =>
            exact (Nat.le_of_lt (Nat.lt_of_not_le H2))
        . case neg =>
          simp [sInsert, H2, sorted, H3]
          intros H4 H5
          apply And.intro
          . case left => exact H4
          . case right =>
            have ih2 := ih H5
            simp [sInsert, H3] at ih2
            exact ih2
```

Using this lemma, proving that sort always returns a sorted list is straightforward, another induction proof on $l$. 

```lean
theorem sort_sorted (l : List Nat) :
sorted (sort l) := by
  induction l
  . case nil => simp [sort, sorted]
  . case cons h t ih =>
    simp [sort, sorted]
    exact (sInsert_sorted (sort t) h) ih
```

### Sort Returns a Permutation of its Input

Finally we need to prove that `sort` returns a permutation of its input. To do this we begin with a lemma 
that sInsert returns a permutation of its input concatenated with the element being inserted. This 
ensures that `sInsert` is not changing the existing elements in the list and just shuffling them around.

The proof is done via induction on the list, the majority of the complexity
is in needing to apply the `List.Perm` constructors with the induction hypothesis.

```lean
/-
A list l with n is a permutation of a list
the list with n inserted into it.
-/
lemma sInsert_perm (l : List Nat) (n : Nat) :
List.Perm (n::l) (sInsert n l) := by
  induction l
  . case nil => simp [sInsert]
  . case _ h t ih =>
    simp [sInsert]
    by_cases H : n ≤ h
    . case pos => simp [H]
    . case neg =>
      simp [H];
      apply (List.Perm.trans _ (List.Perm.cons h ih))
      exact List.Perm.swap h n t
```

Finally we use our lemma to prove that sort is indeed a permutation of the input.
The structure is identical to how we proved our lemma, induction on $l$ followed
by a series of `List.Perm` constructor manipulations, but now make use of our `sInsert_perm`
lemma as well as the induction hypothesis.   

```lean
/-
Sort returns a permutation of the input list.
-/
theorem sort_perm (l : List Nat) :
List.Perm l (sort l) := by
  induction l
  . case nil => simp [sort]
  . case cons h t ih =>
    simp [sort]
    have H := sInsert_perm (sort t) h
    have H2 := List.Perm.cons h ih
    exact List.Perm.trans H2 H
```

# Code

All the code can be found [here](https://github.com/James-Oswald/insertion-sort) on my Github

+++ 
authors = ["James Oswald"]
title = "Heterogenous Lists in Lean4" 
date = "2024-09-23"
description = ""
math = false
tags = ["Lean4", "Data Structures"]
series = []
draft=true
+++

# Options for Heterogenous Lists in Lean4

Heterogenous Lists, arrays where each element can be of a different type, see wide spread use in languages like Python and Javascript (both being the default type of dynamic lists / arrays in their respective languages) but see relatively little use in languages like with stricter type systems, often in languages like C/C++ being implemented as rather unsafe looking `void*` monstrosities with custom type tagging. In this post we will look at some options for implementing heterogenous lists in Lean4.

### The First Attempt
Upon first glance, it may appear that heterogenous lists are lists of dependent pairs.
```lean
abbrev HList₀ := List ((α : Type) × α)
```
Trying to construct such a list will however immediately run into issues.
```lean

```
### A slightly more robust attempt
At first glance it may appear we can define a heterogenous list much like a normal list, except having cons take the type of the respective element.
```lean
inductive HList₁ where
| nil : HList₁
| cons : (α : Type) × α -> HList₁ -> HList₁

-- Add some nice notation 
infixr:70 "::ₕ" => HList₁.cons
notation "[]ₕ" => HList₁.nil
```
There is actually nothing explicitly wrong with this, and we can construct lists like this
```lean
#check ⟨String, "Hello"⟩ ::ₕ ⟨Int, 5⟩ ::ₕ []ₕ
#check ⟨Bool, true⟩ ::ₕ ⟨Nat, 10⟩ ::ₕ ⟨String, "World"⟩ ::ₕ []ₕ
```
However, issues start to arise when we want to do anything with the elements of the list. While getting the length of the list is easy enough, we cannot really do anything with the elements. Imagine a .get method that takes an index and returns the element at that index. What would the return type be? It would fully depend on the element at that index
```lean
def HList₁.length : HList₁ -> Nat
| HList₁.nil => 0
| HList₁.cons _ t => 1 + length t
```

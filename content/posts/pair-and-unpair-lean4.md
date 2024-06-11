+++ 
authors = ["James Oswald"]
title = "Nat.pair and Nat.unpair in Lean4" 
date = "2024-06-18"
description = ""
math = true
tags = ["Lean4"]
series = []
draft= true
+++

## Background

For anyone trying to get into Mathlib's computability library or reading the theory behind it in Carneiro's 2019 paper, [*Formalizing computability theory via partial recursive functions*](https://doi.org/10.48550/arXiv.1810.08380), you will quickly come upon the `pair` and `unpair` functions, which provide us a bijection of two natural numbers to a single natural number and its (also bijective) inverse. This post will cover the definitions and some important theorems in [`Mathlib.Data.Nat.Pairing`](https://leanprover-community.github.io/mathlib4_docs/Mathlib/Data/Nat/Pairing.html#Nat.pair). 

## Why Pair and Unpair?

`Nat.pair` and `Nat.unpair` are responsible for allowing us to transform any function $f : \mathbb{N}^m \rightarrow \mathbb{N}^n$ which takes $m$ parameters and returns $n$ values into a new function $f' : \mathbb{N} \rightarrow \mathbb{N}$ which takes a single parameter and returns a single value. We can use `pair` before invoking $f'$ to combine all $k$ of our arguments into a single argument and then running `unpair` inside $f'$ to extract the individual arguments. Similarly for multiple return values we can run `pair` inside $f'$ to combine them and `unpair` outside to extract individual return values. 

## Definition

`Nat.pair`$: \mathbb{N} \times \mathbb{N} \rightarrow \mathbb{N}$ is defined as:

$$
pair(a,b) = \begin{cases} b^2+a & a < b \\ a^2+a+b & a \geq b \end{cases}
$$

pair(4,2)

`Nat.unpair`$: \mathbb{N} \rightarrow \mathbb{N} \times \mathbb{N}$ is defined as:

$$
unpair(n) = \begin{cases}  \end{cases}
$$


### Why this definition?

Coming up with a 

## Theorems

For any $a, b$ we have that $unpair(pair(a,b)) = (a, b)$ 

Proof.

Two cases, $a < b$ and $a \geq b$.
* When $a < b$ we have 
$$\begin{align*} 
unpair(pair(a,b)) =& (a, b) \\
unpair(b^2+a) =& (a, b) \\

\end{align*}$$




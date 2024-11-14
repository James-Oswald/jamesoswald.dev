+++ 
authors = ["James Oswald"]
title = "Some Value Iteration in Lean4" 
date = "2024-11-12"
description = "We provide value iteration implementations in Lean4"
draft = true
math= true
tags = ["Programming", "Lean", "Reinforcement Learning"]
series = []
+++

# Background 
Recently I've started looking more seriously at [Markov decision process](https://en.wikipedia.org/wiki/Markov_decision_process) 
due to research I'm doing related to [AIXI](https://en.wikipedia.org/wiki/AIXI) and [temporal logic](https://en.wikipedia.org/wiki/Temporal_logic). I figured it would be interesting to implement some of the basic MDP algorithms in Lean4 both as practice for MDPs and Lean. In this post, I look at some implementations of the [Value Iteration](https://gibberblot.github.io/rl-notes/single-agent/value-iteration.html) algorithm and discuss tradeoffs.

# Representing Markov Decision Processes
[Markov decision processes](https://en.wikipedia.org/wiki/Markov_decision_process) are mathematical structures that model
decision making in probabilistic environments. They are modeled as a set of states $S$, a set of actions $A$, An initial state $s_0$, a map $P$ to the probability you will end up in a state $s'$ if you take an action $a$ from a state $s$, and a map $r$ to the reward you receive if you end up in $s'$ after performing a in $s$. 

We will use the following naive MDP structure in Lean
```lean
structure MDP where
  S : List Nat
  s₀ : Nat
  A : List Nat
  P : Std.HashMap (Nat × Nat × Nat) Float
  r : Std.HashMap (Nat × Nat × Nat) Float
```
This structure is very practical (and we will use it for our real implementations) but does not follow the principal of making invalid states unrepresentable.
I.E. we can quite easily have invalid probabilities stored in $P$ or have $P$ or $r$ have keys not in $S$ and $A$. Due to Lean's powerful type system, we can define a much stricter MDP representation that makes it impossible to construct illegal MDPs.
```lean
structure MDP_Strict where
  S : Type
  A : Type
  s0 : S
  P : S -> A -> S -> Real
  r : S -> A -> S -> Real
  -- Finite states (with an underlying finite set of states)
  Sf : Fintype S
  -- Finite actions (with an underlying finite set of states)
  Af : Fintype A
  --A state exists
  Sn : Nonempty S
  --An action exists
  An : Nonempty A
  --The real number returned by P is a valid probability between 0 and 1
  Pr : ∀s a s', 0 ≤ P s a s' ∧ P s a s' ≤ 1
  --for any start state and action, the probabilities of transitioning to a state s' sum to 1 
  --(We must transition to something)
  Ps : ∀s a, (∑ s' ∈ Sf.elems, P s a s') = 1
```
Constructing a `MDP_Strict` requires we prove a bunch of properties about our selection of $S$ $P$ $r$ etc. As is, proving these properties by hand for every MDP we want to use is annoying but typeclass inference and implementing [`Decidable`](https://leanprover-community.github.io/mathlib4_docs/Init/Prelude.html#Decidable) instances for some of these properties would make this less painful.

# Value Iteration

[Value iteration](https://gibberblot.github.io/rl-notes/single-agent/value-iteration.html) is an algorithm that takes a MDP and returns a state value map. The state value map $V$ assigns each state a number that represents 
how valuable being in that state is in terms of expected reward, weighted by some discount factor $\gamma$ (representing how important we think the future reward is). Value iteration is an iterative approximation algorithm in which a true solution by iteratively updating our state value map. 
For our initial algorithms, we will provide a natural number $k$ specifying the number of iterations. 

Our first implementation uses Lean's [Monadic do]() notation to be essentially identical to an implementation in an imperative language



In practice, rather than specifying how many iterations to run for. 
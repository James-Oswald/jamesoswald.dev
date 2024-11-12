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

# MDPs
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
This structure is very practical (and we will use it for most of our implementations) but does not follow the principal of making illegal states unpresentable.
Due to Lean's powerful ability to force people to prove properties, we can define a much stricter MDP representation that makes it impossible to construct illegal MDPs.
```lean
structure MDP where
structure MDP where
  S : Type
  A : Type
  s0 : S
  P : S -> A -> S -> Real
  R : S -> A -> S -> Real
  Sf : Fintype S
  Af : Fintype A
  --A state exists
  Sn : Nonempty S
  --An action exists
  An : Nonempty A
  --The real number returned by P is a valid probablity between 0 and 1
  Pr : ∀s a s', 0 ≤ P s a s' ∧ P s a s' ≤ 1
  --for any start state and action, the probablies of transitioning to a state s' sum to 1 
  --(We must transition to something)
  Ps : ∀s a, (∑ s' ∈ Sf.elems, P s a s') = 1
```

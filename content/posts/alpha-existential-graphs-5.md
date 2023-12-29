+++ 
authors = ["James Oswald"]
title = "Inference Rules in Peirce's Alpha Existential Graphs (Part 2)" 
date = "2023-11-9"
description = "A brief guide to inference rules in Peirce's Alpha Existential Graph system"
math = true
tags = ["Logic", "Existential Graphs"]
series = ["An Introduction to Peirce's Existential Graphs"]
draft = true
+++

In this post we continue looking at the inference rules of alpha existential graphs, in particular we look at the final two rules of inference, Iteration and Deiteration, and define the distinction between equivalence rules and non-equivalence rules.  

Iteration corresponds to 

#### Iteration

This inference rule states we can introduce a copy of a subgraph $\phi$ at any nested level in relation to $\phi$.
Recall that we say a subgraph $\psi$ is at a nested level with respect to $\phi$ iff $\psi$ and $\phi$ are on the same level or $\psi$ can be reached from $\phi$ by only going inside of cuts, for a refresher see [the post where I define nested levels](https://jamesoswald.dev/posts/alpha-existential-graphs-2/#nested-levels) in more detail. If we take the tree based view of AEGs, the Iteration rule says we can insert a subtree (or set of subtrees) as its own sibling, or as a descendant of any of its siblings.

What does iteration correspond to in propositional calculus? Formally it corresponds to the forward direction of [absorption](https://en.wikipedia.org/wiki/Absorption_(logic)) which we state as the meta-logical propositional theorem:
$$
(A \rightarrow B) \Leftrightarrow (A \rightarrow (A \land B)) 
$$
The forward direction of which is read as: 
$$
(A \rightarrow B) \Rightarrow (A \rightarrow (A \land B)) 
$$
This rule says that if $A$ implies $B$ than we know $A$ implies both $A$ and $B$. In essence absorption 



#### Deiteration

This inference rule states we can remove a copy of a subgraph $\phi$ at any nested level in relation to $\phi$. 

### Inference Rule Types
There are two types of inference rules, *equivalence rules* and *non-equivalence rules*. Equivalence rules will transform an existential graph $G_1$ into a logically equivalent graph $G_2$, the underlying propositional formulae for $G_1$ and $G_2$ will be logically equivalent (they would have the same truth tables). This is guaranteed because equivalence rules will never create new or remove any atomic statements from the EG. The equivalence rules are double-cut insertion, double-cut deletion, iteration, and deiteration.

Non-equivalence rules are any inference rule which may transform the existential graph $G_1$ into an new EG $G_2$
such that $G_2$ follows from $G_1$, but the new EG won't necessarily have the same underlying truth table, as we 
may have deleted or added new atomic statements. For example, on propositional side we may have gone from a formulae with
two distinct atomic variables $A \land B$ to a formulae with one $A$ or three $(A \land B) \lor C$. Both 
$A$ and $(A \land B) \lor C$ are valid conclusions from $A \land B$ via and-elimination and or-introduction respectively,
but are not equivalent. The non-equivalence rules are insertion and erasure. 

## References

\[1\] Van Heuveln, B. (2002, June 6). Formalizing Alpha: Soundness and Completeness [web slides]. Retrieved July 31, 2023, from  
https://homepages.hass.rpi.edu/heuveb/Research/EG/details.html.
+++ 
authors = ["James Oswald"]
title = "Iteration in Peirce's Alpha Existential Graphs" 
date = ""
description = "A brief guide to inference rules in Peirce's Alpha Existential Graph system"
math = true
tags = ["Logic", "Existential Graphs"]
series = ["An Introduction to Peirce's Existential Graphs"]
draft = true
+++

#### Iteration

This inference rule states we can introduce a copy of a subgraph at any nested level in relation to 

#### Deiteration

This inference rule states we can introduce a copy of a subgraph at any nested level in relation to 

### Inference Rule Types
There are two types of inference rules, *equivalence rules* and *non-equivalence rules*. Equivalence rules will
transform an existential graph $G_1$ into a logically equivalent graph $G_2$, the underlying propositional formulae for $G_1$ and $G_2$ will be logically equivalent (they would have the same truth tables). This is guaranteed because equivalence 
rules will never create new or remove any atomic statements from the EG. The 
equivalence rules are double-cut insertion, double-cut deletion, iteration, and deiteration.

Non-equivalence rules are any inference rule which may transform the existential graph $G_1$ into an new EG $G_2$
such that $G_2$ follows from $G_1$, but the new EG won't necessarily have the same underlying truth table, as we 
may have deleted or added new atomic statements. For example, on propositional side we may have gone from a formulae with
two distinct atomic variables $A \land B$ to a formulae with one $A$ or three $(A \land B) \lor C$. Both 
$A$ and $(A \land B) \lor C$ are valid conclusions from $A \land B$ via and-elimination and or-introduction respectively,
but are not equivalent. The Non-equivalence rules are insertion and erasure. 

+++ 
authors = ["James Oswald"]
title = "Rules of Inference in Peirce's Alpha Existential Graphs" 
date = "2023-08-20"
description = "A brief guide to inference rules in Peirce's Alpha Existential Graph system"
math = true
tags = ["Logic", "Existential Graphs"]
series = ["An Introduction to Peirce's Existential Graphs"]
draft = true
+++

## Reasoning over Alpha Existential Graphs
In the [previous post](/posts/alpha-existential-graphs/), we have seen how to represent propositional logic statements as existential graphs (EGs) and vice versa,
but merely representing logical statements in an alternative format isn't all that interesting on its own. 
In order for existential graphs to be useful, they should provide us some means of reasoning over 
logical statements, allowing us to derive meaningful conclusions from hypothesis and prove logical equivalences.

In order to perform reasoning within a logical system we need a set of *inference rules* that specify
how we may legally take one formulae (in our case an Existential Graph) and derive another from it. These inference rules should
be sound with respect to the semantics of the logical system and hence not allow us to derive any false statements.
A further discussion of inferences can be found in \[2\],
we will be using the inference rules presented by
\[[1](https://homepages.hass.rpi.edu/heuveb/Teaching/Logic/CompLogic/Web/Presentations/EG.pdf)\]
and taking for granted their soundness which has been proved in
\[[3](https://homepages.hass.rpi.edu/heuveb/Research/EG/details.html)\].

### Subgraphs, Levels, and Nested Levels 
Before we discuss inference rules for existential graphs, we need to discuss two
important syntactic concepts in existential graphs which are referenced in the definition of
most of our rules of inference. These concepts are *Subgraphs* and *Nested Levels*. 

#### Subgraphs
The notion of subgraphs is best understood via an example, the following EG representing $A \rightarrow B$ has five
subgraphs, including the graph itself.

![The subgraph example](/blog/AEGIntro/Subgraphs.png)

How can we formalize this better? One way is to map an existential graph to an n-ary tree structure where nodes
are ANDs and NOTs and leafs are atomic statements. Any subtree in this tree is a subgraph of the EG.
Each of the subtrees in this example can be seen to directly map to one of the five subgraphs.

![The subgraph tree isomorphism](/blog/AEGIntro/TreeIso.png)

#### An Aside Regarding Some Problems with the Subgraph-Tree Isomorphism
*This section contains rambling and unproven claims, it is best to circle back once you have read the rest.
maybe someday this will be turned into a full blog post with pictures.*  

The presented tree representation is not optimal in terms of space, but is helpful for exposition as it reveals
the underlying propositional operators and subgraphs exactly map to subtrees.
One obvious spacial optimization is removing conjunct nodes and 
treating cut nodes as both cuts and conjuncts. Implementing this requires modifying the subgraph subtree
isomorphism to have each cut node map to two subgraphs, the cut (1) and conjuncts (2). We will later discuss
how to make this even better. 

Further issues arise when thinking about subsets of conjuncts and their status as subgraphs.
In the above example we look at a simple problem where both the cut (1) the conjunction of
all children (2) and the conjuncts themselves (3 and 4) are all considered subgraphs of the top level
existential graph. But what of the case with three conjuncts (A, B, C) rather than two? Obviously
the cut ($\lnot(A \land B \land C)$), full conjunction ($A \land B \land C$), and the individual 
conjuncts ($A$, $B$, and $C$) are all subgraphs, but what of subsets of the conjuncts ($A \and B$, 
$A \and B$, and $A \and C$)? If these are considered to be subgraphs, the tree isomorphism
needs to be revised such that each conjunct rooted tree maps to the subgraphs of all subsets of its conjuncts.

The status of subsets of conjuncts as subgraphs is not covered in my source \[1\], but they do claim that
full conjuncts are subgraphs. I however make the (unproven and not fully thought out) claim that the
status of subsets of the conjuncts as subgraphs and even full conjuncts inside of cuts is irrelevant as long as
individual conjuncts are counted as subgraphs. My proof sketch for this claim is that since if we limit subgraphs 
to individual conjuncts, Iteration, Deiteration, Erasure, and Insertion can be applied on a conjunct-by-conjunct basis rather than 
in a way that groups of conjuncts are transformed together. Double-cut introduction on multiple items can be applied 
via introducing an empty double cut, iterating conjuncts inside of it one by one 
 While this increases proof length since rules
need to be applied repeatably it greatly simplifies representation, making subtrees map perfectly to subgraphs
for the case where conjunct nodes are merged into cut nodes.

#### Levels and Nested Levels
*Level* is a property of subgraphs. The intuitive explanation is that the level of a subgraph is the number of cuts
you need to pass through from the sheet of assertion to reach that subgraph.
We can formalize this using the tree representation from the last example;
The level of a subgraph is how many NOT nodes were passed through from the root to reach that subgraph.

![Level image and tree example]()

A subgraph is at a nested level with respect to another subgraph if it 

### Inference Rules 

With these definitions out of the way we can now enumerate the rules of inference of existential graphs.

#### Double Cut Introduction and Elimination 

Double Cut Introduction states we can introduce a double cut around any subgraph and the resulting EG will
be logically equivalent to the original EG. Double Cut Elimination says we can do the same thing in reverse,
remove a double cut around any subgraph and it will be equivalent 

  This rule corresponds with the fact that double negation
cancels out everywhere. We can prepend or remove $\lnot\lnot$ to any formula or formulae in propositional
logic and it will not change its meaning (truth-value).

![Double Cut Examples]()

#### Insertion

The Insertion rule states that you can insert any graph as a subgraph at any odd level in an EG.

![Insertion Examples]()

Formally this rule corresponds to the rule in propositional logic known as 
"Strengthening the Antecedent" for conditional statements. \[4\]

#### Erasure

The Erasure rule states that you can erase any sub graph at an even level.

![Insertion Examples]()

Formally this rule corresponds to the rule in propositional logic known as 
"Weakening the Consequent" for conditional statements. \[4\]

#### Iteration

This inference rule states we can introduce a copy of a subgraph at any nested level in relation to 


### Inference Rule Types
There are two types of inference rules, *equivalence rules* and *non-equivalence rules*. Equivalence rules will
transform an existential graph $G_1$ into a logically equivalent graph $G_2$, the underlying propositional formulae for $G_1$
and $G_2$ will be logically equivalent (they would have the same truth tables). This is guaranteed because equivalence 
rules will never create new or remove any atomic statements from the EG. The 
equivalence rules are double-cut insertion, double-cut deletion, iteration, and deiteration. Equivelence rules 


Non-equivalence rules are any inference rule which may transform the existential graph $G_1$ into an new EG $G_2$
such that $G_2$ follows from $G_1$, but the new EG won't necessarily have the same underlying truth table, as we 
may have deleted or added new atomic statements. For example, on propositional side we may have gone from a formulae with
two distinct atomic variables $A \land B$ to a formulae with one $A$ or three $(A \land B) \lor C$. Both 
$A$ and $(A \land B) \lor C$ are valid conclusions from $A \land B$ via and-elimination and or-introduction respectively,
but are not equivalent.

## References

\[1\] Van Heuveln, B. (2023, March 29). Existential Graphs [public talk]. New York Capital Region Logic Reading Group, NY, USA. Retrieved July 28, 2023, from  
https://homepages.hass.rpi.edu/heuveb/Teaching/Logic/CompLogic/Web/Presentations/EG.pdf. 

\[2\] Roberts, D. D. (1973). The Existential Graphs of Charles S. Peirce. (T. A. Sebeok, Ed.) (Vol. 27, Ser. Approaches to Semiotics). Mouton. 

\[3\] Van Heuveln, B. (2002, June 6). Formalizing Alpha: Soundness and Completeness [web slides]. Retrieved July 31, 2023, from  
https://homepages.hass.rpi.edu/heuveb/Research/EG/details.html.
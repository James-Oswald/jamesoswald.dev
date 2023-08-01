+++ 
authors = ["James Oswald"]
title = "Rules of Inference in Peirce's Alpha Existential Graphs" 
date = "2023-07-31"
description = "A brief guide to inference rules in Peirce's Alpha Existential Graph system"
math = true
tags = ["Logic", "Existential Graphs"]
series = ["An Introduction to Peirce's Existential Graphs"]
draft = true
+++

## Reasoning over Alpha Existential Graphs
In the [previous post](/posts/alpha-existential-graphs/), we have seen how to represent propositional logic statements as Existential Graphs and vice versa,
but merely representing logical statements in an alternative format isn't all that interesting on its own. 
In order for existential graphs to be useful, they should provide us some means of reasoning over 
logical statements, allowing us to derive meaningful conclusions from hypothesis and prove logical equivalences.

In order to perform reasoning within a logical system we need a set of *inference rules* that specify
how we may legally take one formulae and derive a conclusion from it. These inference rules should
be sound with respect to the semantics of the logical system and hence not allow us to derive any false statements,
but a discussion of this is beyond the scope of this post. A further discussion of inferences can be found in \[2\];
we will be using the inference rules presented by \[1\] and taking for granted their soundness which 
has been proved in \[4\].

### Subgraphs and Nested Levels 
Before we discuss inference rules for existential graphs, we need to discuss two
important syntactic concepts in existential graphs which are referenced in the definition of
most of our rules of inference: *Subgraphs* and *Levels*. 

#### Subgraphs
The notion of subgraphs is best understood via an example, the following EG representing $A \rightarrow B$ has five
subgraphs, including the graph itself.

![The subgraph example](/blog/AEGIntro/Subgraphs.png)

How can we formalize this better? One way is to map an existential graph to a tree structure where nodes
are ANDs and NOTs and leafs are atomic statements. Any subtree in this tree is a subgraph of the EG.
Each of the Subtrees in this example can be seen to directly map to one of the five subgraphs.

![The subgraph tree isomorphism]()

#### Levels and Nested Levels
*Level* is a property of subgraphs. The intuitive explanation is that the level of a subgraph is the number of cuts
you need to pass through from the sheet of assertion to reach that subgraph.
We can formalize this using the tree representation from the last example;
The level of a subgraph is how many NOT nodes were passed through from the root to reach that subgraph.

![Level image and tree example]()

A subgraph is at a nested level with respect to another subgraph

### Inference Rules 

With these definitions out of the way we can now enumerate the rules of inference of existential graphs.

#### Double Cut

This rule states we can delete or introduce a double cut around any subgraph and the resulting EG will
be logically equivalent to the original EG. This rule corresponds with the fact that double negation
cancels out everywhere. We can prepend or remove $\lnot\lnot$ to any formula or subformula in propositional
logic and it will not change its meaning.

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


## References

\[1\] Van Heuveln, B. (2023, March 29). Existential Graphs [public talk]. New York Capital Region Logic Reading Group, NY, USA. Retrieved July 28, 2023, from  
https://homepages.hass.rpi.edu/heuveb/Teaching/Logic/CompLogic/Web/Presentations/EG.pdf. 

\[2\] Roberts, D. D. (1973). The Existential Graphs of Charles S. Peirce. (T. A. Sebeok, Ed.) (Vol. 27, Ser. Approaches to Semiotics). Mouton. 

\[3\] Van Heuveln, B. (2002, June 6). Formalizing Alpha: Soundness and Completeness [web slides]. Retrieved July 31, 2023, from  
https://homepages.hass.rpi.edu/heuveb/Research/EG/details.html.
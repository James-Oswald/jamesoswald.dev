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
The notion of subgraphs is best understood via an example, the following EG representing $A \rightarrow B$ has five obvious subgraphs, including the graph itself. (Note: We may also consider the empty EG representing the logical constant True to be a subgraph of every level, but do not depict this)

![The subgraph example](/blog/AEGIntro/Subgraphs.png)

How can we formalize this better? One way is to map an existential graph to an n-ary tree structure. The sheet of assertion is the root, atoms are leafs, and cuts may either be leaves or have children. 
In this representation a subgraph corresponds a subset of children on a given level of the tree. (Note: The empty set $\empty$ is a subset of children on any level, corresponding to the idea that the the empty EG representing the logical constant True is a subgraph on any level) 

![The subgraph tree isomorphism](/blog/AEGIntro/TreeIso.png)

In $G$ we observe that each subset on each level corresponds directly with one of the subgraphs from the previous figure. The first cut containing $\\{A, \lnot B\\}$ has the following subsets $ \\{A, \lnot B\\}, \\{A\\}, \\{\lnot B\\}, \empty $
(Note $\empty$ not pictured)

In $G2$ we need to account for every subset of the children on the first cut as a subgraph. Symbolically we would say the subgraphs of $ \\{A, \lnot B, C\\}$ are $\\{A, \lnot B, C\\}$, $\\{A, \lnot B\\}$, $\\{A, C\\}$, $\\{\lnot B, C\\}$, $\\{A\\}$, $\\{\lnot B\\}$, $\\{C\\}$, $\empty$.

Using this setup we can recursively define the set of subgraphs of an AEG in this tree representation. Given a function $C(G)$ returns the children of G, and $\mathcal{P}(s)$ is the powerset of $s$ (the set of all subsets of $s$), we can define set of subgraphs of an an existential graph $G$ as $S(G)$

$$
S(G) = \begin{cases}
\\{\\{G\\}\\} & G \text{ is an atom} \\\\
\\{\\{G\\}\\} \cup \mathcal{P}(C(G)) \cup \bigcup\limits_{c \in C(G)} S(c) & G \text{ is a cut} \\\\
\end{cases}
$$
Lets use a tree based notation and walk through an example, let $(A (B))$ be $G$ and $(A (B) C)$ be $G2$ from our examples.
$$
\begin{align*}
S((A (B))) &= \\{\\{(A (B))\\}\\} \cup \mathcal{P}(\\{A, (B)\\}) \cup \bigcup\limits_{c \in \\{A, (B)\\}} S(c) \\\\
 &= \\{\\{(A (B))\\}\\} \cup \\{\\{A, (B)\\}, \\{A\\}, \\{(B)\\},\empty \\} \cup S(A) \cup S((B)) \\\\
 &= \\{\\{(A (B))\\}\\} \cup \\{\\{A, (B)\\}, \\{A\\}, \\{(B)\\},\empty \\} \cup \\{\\{A\\}\\} \cup \left(\\{\\{(B)\\}\\} \cup \mathcal{P}(\\{B\\}) \cup \bigcup\limits_{c \in \\{B\\}} S(c)\right) \\\\
 &= \\{\\{(A (B))\\}\\} \cup \\{\\{A, (B)\\}, \\{A\\}, \\{(B)\\},\empty \\} \cup \\{\\{A\\}\\} \cup \left(\\{\\{(B)\\}\\}\cup \\{\\{B\\}, \empty\\} \cup \\{\\{B\\}\\} \right) \\\\
\end{align*}
$$

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

## Acknowledgements  

Thank you Brandon Rozek for teaching me hugo katex (or mathjax maybe, we are still unsure).
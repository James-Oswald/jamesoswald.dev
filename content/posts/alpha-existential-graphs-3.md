+++ 
authors = ["James Oswald"]
title = "A First Look at a Formal Notion for AEG Subgraphs" 
date = "2023-10-03"
description = "A brief guide to inference rules in Peirce's Alpha Existential Graph system"
math = true
tags = ["Logic", "Existential Graphs"]
series = ["An Introduction to Peirce's Existential Graphs"]
draft = false
+++

In [my last AEG post](/posts/alpha-existential-graphs-2/), we looked at an informal definitions of subgraphs for Alpha Existential Graphs (EGs). 
In this post we look at a simple (and inefficient) potential recursive definition for the set of subgraphs of an AEG in the tree representation from the last post. Given a function $C(G)$ that returns the children of $G$, and $\mathcal{P}(s)$ is the [powerset](https://en.wikipedia.org/wiki/Power_set) of $s$ (the set of all subsets of $s$), we can define set of subgraphs of an an existential graph $G$ as $S(G)$:

$$
S(G) = \begin{cases}
\\{\\{G\\}\\} & G \text{ is an atom} \\\\
\\{\\{G\\}\\} \cup \mathcal{P}(C(G)) \cup \bigcup\limits_{c \in C(G)} S(c) & G \text{ is a cut} \\\\
\end{cases}
$$
In essence this states that for an existential graph $G$, the subgraphs of $G$ are the graph itself, all possible subsets of $G$'s children, and the subgraphs of G's children. 

The following is an example of computing the subgraphs of the AEG corresponding to $\lnot(A \land \lnot B)$, We use a simple textual representation of AEGs for this example where parenthesis represent cuts and letters represent atoms hence we write $\lnot(A \land \lnot B)$ as $(A (B))$. 
$$
\begin{align*}
S((A (B))) &= \\{\\{(A (B))\\}\\} \cup \mathcal{P}(\\{A, (B)\\}) \cup \bigcup\limits_{c \in \\{A, (B)\\}} S(c) \\\\
 &= \\{\\{(A (B))\\}\\} \cup \\{\\{A, (B)\\}, \\{A\\}, \\{(B)\\},\empty \\} \cup S(A) \cup S((B)) \\\\
 &= \\{\\{(A (B))\\}\\} \cup \\{\\{A, (B)\\}, \\{A\\}, \\{(B)\\},\empty \\} \cup \\{\\{A\\}\\} \cup \\\\ & \quad \left(\\{\\{(B)\\}\\} \cup \mathcal{P}(\\{B\\}) \cup \bigcup\limits_{c \in \\{B\\}} S(c)\right) \\\\
 &= \\{\\{(A (B))\\}\\} \cup \\{\\{A, (B)\\}, \\{A\\}, \\{(B)\\},\empty \\} \cup \\{\\{A\\}\\} \cup \left(\\{\\{(B)\\}\\}\cup \\{\\{B\\}, \empty\\} \cup \\{\\{B\\}\\} \right) \\\\
 &= \\{\\{(A (B))\\}, \\{A, (B)\\}, \\{A\\}, \\{(B)\\}, \\{B\\}, \empty \\} \\\\
\end{align*}
$$

We can see here the subgraphs of $(A (B))$ are itself $\\{(A (B))\\}$, all subsets of its children $\\{A, (B)\\}, \\{A\\}, \\{(B)\\}, \empty$ and the subgraphs of its children $\\{B\\}$.  

## Acknowledgements  

Thank you Brandon Rozek for teaching me hugo katex (or mathjax maybe, we are still unsure).
+++ authors = ["James Oswald"] title = "An Introduction to Peirce's Alpha Existential Graphs" date = "2023-07-28" description = "A brief guide to the Alpha Existential Graph System" math = true tags = [ "Logic", "Existential Graphs", ] +++

## Preamble

Ever since learning about Existential Graphs from [a talk](blog/AEGIntro/EG.pdf)
given by Bram Van Heuveln at the [New York Capital Region Logic Reading Group]
(https://rairlab.github.io/logic-group/) at RPI; I've had Existential Graphs on
my mind a lot. Not only due to their very real ability as a tool for helping students
learn logic, but also due to how magical they feel. Complex Existential Graphs in the
Beta and Gama systems such as those found in \[1\] can start looking like magic circles
strait out of a grimoire. Unfortunately there do not seem to be many concise resources
for learning existential graphs on the internet. In this post I will outline the
simplest Existential Graph system, Alpha, assuming the reader has some basic
familiarity with propositional logic. 

## Representing Propositional Formulae as Existential Graphs

Existential Graphs can be though of as a diagrammatic/visual means of representing logical statements
and reasoning over them. Logical statements as we think of them are typically 1 dimensional formulae of characters that
assert truth of a statement with respect to some atomic propositions. We can use propositional logical
connectives to build up compound logical formulae. In propositional logic there are five types of compound
formulae that people typically care about (at least enough that they make it into the most popular inference
systems):

| Name               | Symbolically        | Meaning                            | Important Logical Equivalence                                                     |
|--------------------|---------------------|------------------------------------|-----------------------------------------------------------------------------------|
| Atomic Statement   | A                   | A is true                          |                                                                                   |
| Logical Not        | \lnot A             | A is not true                      |                                                                                   |
| Logical And        | A \land B           | Both A and B are true              |                                                                                   |
| Logical Or         | A \lor B            | Either A or B is true              | \lnot (\lnot A \land \lnot B)                                                     |
| Conditional        | A \rightarrow B     | If A is true then B is true        | \lnot A \lor B                                                                    |
| Biconditional      | A \leftrightarrow B | A is true if and only if B is True | (A \rightarrow B) \land (B \rightarrow A)                                         |


### Atomic Propositions and the Sheet of Assertion

To represent an atomic statement $A$ in propositional logic, one merely represents it as "1d" propositional formula $"A"$.
Existential graphs however are represented in 2d space on what is known as the "Sheet of Assertion", which we draw as a square.
To represent an atomic proposition $A$ as an existential graph, we may place it anywhere on the sheet of assertion.

![Image of A on the sheet of assertion]()

Note that the location of the statement on the sheet of assertion is irrelevant, the two existential
graphs are regarded as identical.

![Image of sheets of assertion with A in different places]()

### Logical And

If we want to represent a conjunction of multiple statements $A$, $B$, $C$ in propositional
logic we may use the logical and operator between them like so, "$A \land B \and C$".
Semantically we read this that A and B and C are all true. To represent this in an existential
graph, we can individually assert each on the sheet of assertion. 

![Image of A, B, C on the sheet of assertion]()

We can generalize this notion to any number of statements.

![Image of A, B, C, D, E, F on the sheet of assertion]()

### Logical Not and Cuts

To represent the negation of some statement $A$ in propositional logic, we can prefix it with a 
$\lnot$. We can interpret this as introducing some form of inner context in the 1d formulae 
in which everything inside a $\lnot(\cdots)$ is asserted to be false. Since existential graphs
are 2d, we need some way of representing what a negated context two dimensionally. This is done
using a "Cut" which is represented by drawing a connected boundary on the sheet of assertion,
often written represented by a circle or oval. Everything inside the circle is taken to be
negated. 

![Some basic cuts]()

Note that just as we can have negated formulae inside of negated formulae in propositional logic,
we can have cuts inside of cuts inside in existential graphs. 

![Cuts inside of cuts]()


### Logical Or
So far we have introduced ways to represent conjuntion 

## References
\[1\] Roberts, D. D. (1973). The existential graphs of Charles S. Peirce. (T. A. Sebeok, Ed.) (Vol. 27, Ser. Approaches to Semiotics). Mouton. 
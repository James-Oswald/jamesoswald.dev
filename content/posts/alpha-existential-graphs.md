+++ authors = ["James Oswald"] title = "An Introduction to Peirce's Alpha Existential Graphs" date = "2023-07-28" description = "A brief guide to the Alpha Existential Graph System" math = true tags = [ "Logic", "Existential Graphs", ] +++

## Preamble

Ever since learning about Existential Graphs from [a talk given by Bram Van Heuveln]
(blog/AEGIntro/EG.pdf)\[1\] at the [New York Capital Region Logic Reading Group]
(https://rairlab.github.io/logic-group/) at RPI; I've had Existential Graphs on
my mind a lot. Not only due to their very real ability as a tool for helping students
learn logic, but also due to how magical they feel. Complex Existential Graphs in the
Beta and Gama systems such as those found in \[2\] can start looking like magic circles
strait out of a grimoire. Unfortunately there do not seem to be many concise resources
for learning existential graphs on the internet. In this post I will outline the
simplest Existential Graph system, Alpha, assuming the reader has only a basic
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
| Logical Not (NOT)  | \lnot A             | A is not true                      |                                                                                   |
| Logical And (AND)  | A \land B           | Both A and B are true              |                                                                                   |
| Logical Or (OR)    | A \lor B            | Either A or B is true              | \lnot (\lnot A \land \lnot B)                                                     |
| Conditional (IF)   | A \rightarrow B     | If A is true then B is true        | \lnot A \lor B                                                                    |
| Biconditional (IFF)| A \leftrightarrow B | A is true if and only if B is True | (A \rightarrow B) \land (B \rightarrow A)                                         |

The first step to getting a handle on existential graphs is to understand how to build 
and interpret them

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
Semantically we read this as "A and B and C are all true". To represent this in an existential
graph, we can individually assert each statement on the sheet of assertion. 

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
So far we have introduced ways to represent conjunction via multiple assertion and negation as cuts in existential graphs.
These are actually the only two representational features provided by the alpha system. So how can we represent
other compound operators such as OR in existential graphs? This is where the property of functional completeness
of AND and NOT comes into play. In short, AND and NOT are the only operators you need to
represent all possible truth tables \[2\]. That is, any other logical operator can be defined
solely in terms of ANDs and NOTs. To represent OR in terms of AND and NOT we use $\lnot (\lnot A \land \lnot B)$.
The equivalence of this formulae to OR can be proven easily using De Morgan's laws or a truth table.
With this equivalence in place, we can now use the tools of existential graphs we have seen so far to represent OR.

![Logical Or]()

### Conditionals
Just like OR, IF can be represented solely in terms of ANDs and NOTs. Perhaps the most famous equivalence of IF
is the Or-and-if relation which states that $A \rightarrow B$ is logically equivalent to $\lnot A \lor B$.
This gives us IF in terms of NOT and OR, to put it in terms of NOT and AND we can apply the definition
of OR from the previous section to obtain $\lnot(\lnot\lnot A \land \lnot B)$. Finally we can cancel the
double negation to obtain just $\lnot(A \land \lnot B)$. Using this we can represent IF in an existential
graph as follows.

![Logical If]()

This definition imbues previously looked at EGs with new PL interpretations, let us explore some alternative
interpretations of the graphs seen in the NOT section.

![New Interprets of compound NOTs]()

### Biconditionals 
IFF is often expressed as $(A \rightarrow B) \land (B \rightarrow A)$. Using our existential graph for IF, we
can write IFF as.

The command alternative representation for IFF, $(A \land B) \lor (\lnot A \land \lnot B)$ can also be used.
Using our definition of OR we can rewrite this as in terms of AND and NOT as
$\lnot (\lnot (A \land B) \land \lnot(\lnot A \land \lnot B)$. We will later see this definition
is equivalent to the first and prove it using the rules of inference of Alpha. 

## Reasoning over Alpha Existential Graphs
We have seen how to represent propositional statements as Existential Graphs and vice versa,
but merely representing logical statements in an alternative format isn't all that interesting on its own. 
In order for existential graphs to be useful, they should provide us some means of reasoning over 
logical statements, allowing us to derive meaningful conclusions from hypothesis and prove logical equivalences.

In order to perform reasoning within a logical system we need a set of *inference rules* that specify
how we may legally take one formulae and derive a conclusion formulae from it. These inference rules should
be sound with respect to the semantics of the logical system and hence not allow us to derive any false statements,
but a discussion of this is beyond the scope of this post, a further discussion of inferences can be found in \[2\]
we will be using those presented by \[1\] and taking for granted their soundness. 

## Levels and Subgraphs
Before we discuss inference rules, we need to discuss two important concepts in existential graphs which are
referenced in the definition of most of our rules of inference

## References
\[1\] Van Heuveln, B. (2023, March 29). Existential Graphs [public talk]. New York Capital Region Logic Reading Group, NY, USA. Retrieved July 28, 2023, from https://homepages.hass.rpi.edu/heuveb/Teaching/Logic/CompLogic/Web/Presentations/EG.pdf. 
\[2\] Roberts, D. D. (1973). The existential graphs of Charles S. Peirce. (T. A. Sebeok, Ed.) (Vol. 27, Ser. Approaches to Semiotics). Mouton. 
\[3\] Rozek, B. (2023, May 30). Functional Completeness [web blog]. Retrieved July 28, 2023, from https://brandonrozek.com/blog/functional-completeness/. 
+++ 
authors = ["James Oswald"]
title = "The Law of Excluded Middle Does Not Imply the Axiom of Choice" 
date = "2024-03-29"
math = true
tags = ["Logic", "Math"]
series = []
+++

[Diaconescu's Theorem](https://en.wikipedia.org/wiki/Diaconescu%27s_theorem) says that the [Axiom of Choice](https://en.wikipedia.org/wiki/Axiom_of_choice) (AOC) implies the [Law of Excluded Middle](https://en.wikipedia.org/wiki/Law_of_excluded_middle) (LEM), but what of the converse? Does the Law of Excluded Middle imply the Axiom of Choice? The answer is no.

# Background
I recently ran into a situation where I wanted to prove something was [equivalent to the axiom of choice](https://en.wikipedia.org/wiki/Axiom_of_choice#Equivalents) (Specifically the [Law of Trichotomy](https://en.wikipedia.org/wiki/Law_of_trichotomy)). Remembering Diaconescu's Theorem, I mistakenly thought for a moment that perhaps the converse holds, hence my proof would be as simple as proving that Law of Trichotomy implies the Law of Excluded Middle. Unfortunately for me however, upon remembering some basic independence results, it became obvious that this is not the case.

# Why?
Recall that the Axiom of Choice has been proven to be logically independent of [Zermelo–Fraenkel set theory](https://en.wikipedia.org/wiki/Zermelo%E2%80%93Fraenkel_set_theory)(ZF) by Godel and Cohen. This means there does not exist a proof of the AOC in ZF. Recall then, that ZF is typically taken to be a theory of (Classical) First Order Logic (FOL), which includes the LEM. Hence all theorems in FOL are theorems in ZF. Hence if we can not prove the AOC in ZF, who's theorems are a superset of those in FOL (including the LEM), then it is impossible to use the law of excluded middle to imply the axiom of choice.  





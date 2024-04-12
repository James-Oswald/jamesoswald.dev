
+++
authors = ["James Oswald"]
title = "Formalizing The Singularizing Properties Problem" 
date = "2024-04-11"
description = ""
math = true
tags = ["Logic", "Lean4"]
series = []
draft=false
+++

## Background
This fun second order logic problem is given as an extra credit problem in RPI's intro to logic class that I TA for. 
It is sometimes given as a required problem in the intermediate logic class. In these classes, students must use
the [HyperSlate graphical interactive theorem prover](http://www.logicamodernapproach.com/). Here, I take a look at a proof in Lean4 as well. 

## The Problem

Given that:
1) For any property $X$ of an object $a$, all objects that are not $a$ do not have the property $X$.
$$
\forall X: X(a) \rightarrow (\forall y: y \neq a \rightarrow \lnot X(y)) 
$$

2) $a$ has a property $Q$.
$$
Q(a)
$$

Prove that there exists a property $Z$ such that there do not exist any distinct objects that share that property. 
$$
\exists Z: \lnot \exists x, y: x \neq y \land Z(x) \land Z(y)
$$

### An Informal proof
$Q$ is the property we are looking for. By hypothesis 2 we have $a$ has property $Q$. By hypothesis 1 then, we 
have that all objects that are not $a$ do not have $Q$, thus there do not exist any distinct objects that
share the property $Q$ (as only $a$ has property $Q$). $\square$

### A Formal Proof
Take $Q$ as the property and prove by contradiction, hence we assume $\exists x, y: x \neq y \land Q(x) \land Q(y)$ and try to derive $\bot$.
For existential elimination we take $w_1$ and $w_2$ as our witnesses for $x$ and $y$ and will use 
$w_1 \neq w_2 \land Q(w_1) \land Q(w_2)$ along with our hypotheses to prove the contradiction.
By the law of excluded middle we have that either $ a = w_2 $ or  $ a \neq w_2 $.
In the $ a = w_2 $ case, we can use $ a = w_2 $ with hypothesis 1 to obtain 
$w_1 \neq w_2 \rightarrow \lnot Q(w_1)$, a contradiction follows trivially form this with $w_1 \neq w_2 \land Q(w_1) \land Q(w_2)$.
In the $ a \neq w_2 $ case, we use hypothesis 1 to obtain $w_2 \neq a → \lnot Q(w_2)$, use modes ponens to obtain $\lnot Q(w_2)$
and see that this trivially contradicts with $w_1 \neq w_2 \land Q(w_1) \land Q(w_2)$.
$\square$

# Lean4 Proof
We use the above formal proof as the basis for a Lean4 proof of this.

```lean
import Mathlib.Tactic.Basic

example (a : α) (Q : α -> Prop)
(H1 : ∀(X : α -> Prop), (X a) -> (∀ (y : α ), y ≠ a -> ¬X y))
(H2 : Q a) : ∃ (Z : α -> Prop), ¬ ∃(x y : α), x ≠ y ∧ Z x ∧ Z y := by
have T1 := H1 Q H2 
exists Q
intro ⟨w1, w2, T2⟩
by_cases C : (a = w2)
. case pos =>
  have T3 := T1 w1
  rw [C] at T3
  apply Not.elim (T3 T2.left) T2.right.left  
. case neg => 
  have T3 := T1 w2
  simp [C, Ne.symm] at T3
  apply Not.elim T3 T2.right.right
```
[Run it on the live lean website](https://live.lean-lang.org/#code=import%20Mathlib.Tactic.Basic%0D%0A%0D%0Aexample%20(a%20%3A%20%CE%B1)%20(Q%20%3A%20%CE%B1%20-%3E%20Prop)%0D%0A(H1%20%3A%20%E2%88%80(X%20%3A%20%CE%B1%20-%3E%20Prop)%2C%20(X%20a)%20-%3E%20(%E2%88%80%20(y%20%3A%20%CE%B1%20)%2C%20y%20%E2%89%A0%20a%20-%3E%20%C2%ACX%20y))%0D%0A(H2%20%3A%20Q%20a)%20%3A%20%E2%88%83%20(Z%20%3A%20%CE%B1%20-%3E%20Prop)%2C%20%C2%AC%20%E2%88%83(x%20y%20%3A%20%CE%B1)%2C%20x%20%E2%89%A0%20y%20%E2%88%A7%20Z%20x%20%E2%88%A7%20Z%20y%20%3A%3D%20by%0D%0Ahave%20T1%20%3A%3D%20H1%20Q%20H2%20%0D%0Aexists%20Q%0D%0Aintro%20%E2%9F%A8w1%2C%20w2%2C%20T2%E2%9F%A9%0D%0Aby_cases%20C%20%3A%20(a%20%3D%20w2)%0D%0A.%20case%20pos%20%3D%3E%0D%0A%20%20have%20T3%20%3A%3D%20T1%20w1%0D%0A%20%20rw%20%5BC%5D%20at%20T3%0D%0A%20%20apply%20Not.elim%20(T3%20T2.left)%20T2.right.left%20%20%0D%0A.%20case%20neg%20%3D%3E%20%0D%0A%20%20have%20T3%20%3A%3D%20T1%20w2%0D%0A%20%20simp%20%5BC%2C%20Ne.symm%5D%20at%20T3%0D%0A%20%20apply%20Not.elim%20T3%20T2.right.right)
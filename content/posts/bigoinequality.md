+++ 
authors = ["James Oswald"]
title = "What is f(x) ≤ g(x) + O(1)? Inequalities With Asymptotics" 
date = "2026-02-20"
description = ""
math = true
tags = ["Computer Science", "Mathematics"]
series = []
+++

Recently I came across asympotic inequalities of the form $f(x) \le g(x) + O(1)$ in Li and Vitanyi's [An Introduction to Kolmogorov Complexity and Its Applications](https://link.springer.com/book/10.1007/978-3-030-11298-1), where this notion is used to discuss bounds on the complexity of strings. In this post I give a brief definition of what this notation means and how it relates to standard asymptotic notation. Particulary, I'm only going to talk about the case of $O(1)$, but the same ideas can be extended to $O(h(x))$ for any function $h(x)$.

### Standard Big O Asymptotics

Undergraduate computer science students should be familiar with the standard $f(x) = O(g(x))$ notation, meaning:

$$
\exists C > 0, \exists x_0, \forall x > x_0, |f(x)| \le C |g(x)|
$$

when we have $f(x) = g(x) + O(1)$, we interpret this as $f(x) - g(x) = O(1)$, which means that the difference between $f(x)$ and $g(x)$ is bounded by a constant. Formally, this can be written as:

$$
\exists C > 0, \exists x_0, \forall x > x_0, |f(x) - g(x)| \le C
$$

Note that the absolute value is important here, this means we have both an upper and lower bound on $f(x)$ in terms of $g(x)$, specifically:
$$
g(x) - C \le f(x) \le g(x) + C
$$

### Asymptotic Inequality Notation

So what about $f(x) \le g(x) + O(1)$? This conveys a similar idea with a focus on only the upper bound of $f(x)$ in terms of $g(x)$. It means that there exists some constant $C$ such that for sufficiently large $x$, $f(x) \le g(x) + C$. Formally:

$$
\exists C > 0, \exists x_0, \forall x > x_0, f(x) \le g(x) + C
$$

In short the bounding condition is the one sided version of the standard big O notation, where we only care about the upper bound of $f(x)$ in terms of $g(x)$, rather than both an upper and lower bound. Due to this, we have that $f(x) = g(x) + O(1)$ implies that $f(x) \le g(x) + O(1)$, but the converse is not necessarily true.




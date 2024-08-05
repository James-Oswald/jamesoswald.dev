+++ 
authors = ["James Oswald"]
title = "Rust First Impressions & Complaints List" 
date = "2024-08-05"
description = ""
draft = true
tags = ["Rust", "Programming"]
series = []
+++

# Background

Recently, I've started programming in a language I thought I would never need to touch, Rust. 
As a former C++ evangelist, I always thought Rust was either a fad or rust users were just deluded by 
some nebulous concept of "safety". Personally, I've always enjoyed (the freedom of) shooting myself
in the foot with C++, so safety at the cost of freedom and simplicity seemed like an awful tradeoff.
I wasn't afraid to express this either, I had a lot of fun making jokes about how hard it is to code
rust approved linked lists. 

{{ < tweet 1819716789124681948 >}}

Recently [my friend Brandon](https://brandonrozek.com) started working at AWS Research and has been singing Rust's praises, 
so I figured that for the first time in my life I would give it a serious look. I've been looking to
rewrite some automated theorem proving software for a while, which while possible to do in a language
like Python or C++ (Ignoring E, Vampire, etc...), is far better suited to a language with proper sum type support (Hence why OCaml,
[which has great support for this](https://ocamlbook.org/algebraic-types/) is probably so popular in
the automated reasoning space). I've known Rust offers good sum type support via their enums for a while,
but I had yet to actually check it out in a meaningful way. Hence around the start of August I began
exploring Rust seriously. The following are my preliminary likes and dislikes of Rust, from the short
time I've been working with it, with some comparisons to Lean4, C, and C++.

## Things I like about Rust

### 1) Enums as Proper Sum Types and Pattern Matching
I love sum types, ever since being exposed to sum types in Coq and Lean, my brain now works in Sum Types.
It was really depressing to go from Lean to C/C++ and realize my best option for a basic sum type was a tagged union
with a bunch of custom machinery to ensure I don't forget to set the tag. It was even more depressing to see
how the best option for matching a sum type in C is just a switch statement, but even that is better than the 
abomination that is C++'s `std::variant` and its abysmal attempt at matching with `std::visit` (See why 
[`std::visit` is everything wrong with modern C++](https://bitbashing.io/std-visit.html), one of my favorite
blog posts of all time). Lets turn to an example of why I like Rust's enums, with a proper comparison to a language
with first class sum type support like Lean4. 

Lean provides proper sum types via the inductive keyword. For the sake of showing off the full power of sum types,
we'll look at a recursive sum type (a simple recursive formula), and for a matching example we'll implement a formula depth function. 
```lean
inductive Formula where
| atom : String -> Formula
| not : Formula -> Formula
| and : Formula -> Formula -> Formula

def Formula.depth : Formula -> Nat
| atom _ => 1
| not f => depth f + 1
| and l r => max (depth l) (depth r) + 1   

open Formula
#eval depth (and (atom "A") (not (atom "B")))
```
Lets now turn to a C Tagged Union abomination of this exact same code.
```c
#include <stdio.h>

struct Formula{
    enum Type {ATOM, NOT, AND} type;
    union{
        char atom;
        struct Formula* not;
        struct {
            struct Formula* l;
            struct Formula* r;
        } and;
    };
};

int max(int a, int b){
    return a > b ? a : b;
}

int depth(struct Formula* formula){
    switch(formula->type){
        case ATOM: return 1;
        case NOT: return depth(formula->not) + 1;
        case AND: return max(depth(formula->and.l), depth(formula->and.r)) + 1;
    }
}

int main() {
    struct Formula a = {ATOM, atom: 'A'};
    struct Formula b = {ATOM, atom: 'B'};
    struct Formula notB = {NOT, not: &b};
    struct Formula AandNotB = {AND, and:{&a, &notB}};
    printf("%d", depth(&AandNotB));
    return 0;
}
```
We could do something similar in C++, but I would like to show off how awful std::visit really is.


### 2) Derive attribute
The ability to derive basic commonly used functions like copying and equality for a structure or enum
is something I got used in Lean (see Lean's `deriving`). While not as powerful as Lean's `deriving`,
Rust's `derive` is a huge step up from C++'s half-baked `= default;`.


## Things I dislike about Rust

### 1) Ignoring a named argument in a match is more verbose than using it.
In the event that you don't want to used a named 

### 2) Unit tests in source files




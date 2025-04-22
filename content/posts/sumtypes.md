+++ 
authors = ["James Oswald"]
title = "A Basic Inductive Type Comparison: Rust, Lean, C, C++" 
date = "2024-08-06"
description = "We talk about sum types, inductive types, and give examples"
draft = false
tags = ["Programming", "Rust", "C", "C++", "Lean4"]
series = []
+++

## Background
I'm currently in the process of writing a post about things I like and things I dislike about [Rust](https://www.rust-lang.org/).
One of the major things I like about Rust is their implementation of [sum types](https://en.wikipedia.org/wiki/Tagged_union) and [Inductive types](https://en.wikipedia.org/wiki/Inductive_type). I like Rust's sum types so much infact, that the section talking about them in that future post became large enough to become its own post (this post).

## What are Sum Types and Inductive Types
Simply, a sum type is a type that takes on one of many possible values. A simple example is an enum, such as `DayOfTheWeek`.
A variable of type `DayOfTheWeek` may take on the value of `Monday`, `Tuesday`, `Thursday`, `Friday`, etc. This simple
concept is easily extended to the notion of an inductive type where the type may have an object of the same type as itself as one of the 
possible members of the structure. Simple recursive grammars are
a good example of this, we will demonsteate a simple propositional formula as an inductive type in our examples.

{{< notice note >}}
This post does not pretend to be giving a good beginer overview of sum types nor inductive types, you can get the basic idea from the later examples,
but check out some of the links for a more concreate and well written introduction to these concepts. 
{{< /notice >}}

## Rant
It was really depressing to go from Lean to C/C++ and realize my best option for a basic sum type was a tagged union
with a bunch of custom machinery to ensure I don't forget to set the tag. It was even more depressing to see
how the best option for matching a sum type in C is just a switch statement, but even that is better than the 
abomination that is C++'s `std::variant` and its abysmal attempt at matching with `std::visit` (See why 
[`std::visit` is everything wrong with modern C++](https://bitbashing.io/std-visit.html)). 

Lets now turn to a hands on example of why I like Rust's enums, with a proper comparison to a language
with first class sum type support like Lean4, and to languages with bad to no sum type implementation like C and modern C++20.
For the sake of showing off the full power of sum types, we'll look at an inductuve sum type (a simple recursive formula), and for
the sake of showcasing patern matching matching we'll implement a formula depth function. 

### Lean
Lean provides proper sum types via the inductive keyword. 
Lean by far has the best support for sum types out of everything we look at. 
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
[Run it](https://live.lean-lang.org/#code=inductive%20Formula%20where%0D%0A%7C%20atom%20%3A%20String%20-%3E%20Formula%0D%0A%7C%20not%20%3A%20Formula%20-%3E%20Formula%0D%0A%7C%20and%20%3A%20Formula%20-%3E%20Formula%20-%3E%20Formula%0D%0A%0D%0Adef%20Formula.depth%20%3A%20Formula%20-%3E%20Nat%0D%0A%7C%20atom%20_%20%3D%3E%201%0D%0A%7C%20not%20f%20%3D%3E%20depth%20f%20%2B%201%0D%0A%7C%20and%20l%20r%20%3D%3E%20max%20(depth%20l)%20(depth%20r)%20%2B%201%20%20%20%0D%0A%0D%0Aopen%20Formula%0D%0A%23eval%20depth%20(and%20(atom%20%22A%22)%20(not%20(atom%20%22B%22))))

Lets now turn to a C tagged union abomination of this exact same code.
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
[Run it](https://godbolt.org/#g:!((g:!((g:!((h:codeEditor,i:(filename:'1',fontScale:14,fontUsePx:'0',j:1,lang:___c,selection:(endColumn:2,endLineNumber:34,positionColumn:2,positionLineNumber:34,selectionStartColumn:2,selectionStartLineNumber:34,startColumn:2,startLineNumber:34),source:'%23include+%3Cstdio.h%3E%0A%0Astruct+Formula%7B%0A++++enum+Type+%7BATOM,+NOT,+AND%7D+type%3B%0A++++union%7B%0A++++++++char+atom%3B%0A++++++++struct+Formula*+not%3B%0A++++++++struct+%7B%0A++++++++++++struct+Formula*+l%3B%0A++++++++++++struct+Formula*+r%3B%0A++++++++%7D+and%3B%0A++++%7D%3B%0A%7D%3B%0A%0Aint+max(int+a,+int+b)%7B%0A++++return+a+%3E+b+%3F+a+:+b%3B%0A%7D%0A%0Aint+depth(struct+Formula*+formula)%7B%0A++++switch(formula-%3Etype)%7B%0A++++++++case+ATOM:+return+1%3B%0A++++++++case+NOT:+return+depth(formula-%3Enot)+%2B+1%3B%0A++++++++case+AND:+return+max(depth(formula-%3Eand.l),+depth(formula-%3Eand.r))+%2B+1%3B%0A++++%7D%0A%7D%0A%0Aint+main()+%7B%0A++++struct+Formula+a+%3D+%7BATOM,+atom:+!'A!'%7D%3B%0A++++struct+Formula+b+%3D+%7BATOM,+atom:+!'B!'%7D%3B%0A++++struct+Formula+notB+%3D+%7BNOT,+not:+%26b%7D%3B%0A++++struct+Formula+AandNotB+%3D+%7BAND,+and:%7B%26a,+%26notB%7D%7D%3B%0A++++printf(%22%25d%22,+depth(%26AandNotB))%3B%0A++++return+0%3B%0A%7D'),l:'5',n:'1',o:'C+source+%231',t:'0')),k:50.11806375442739,l:'4',m:100,n:'0',o:'',s:0,t:'0'),(g:!((h:executor,i:(argsPanelShown:'1',compilationPanelShown:'0',compiler:cg141,compilerName:'',compilerOutShown:'0',execArgs:'',execStdin:'',fontScale:14,fontUsePx:'0',j:1,lang:___c,libs:!(),options:'',overrides:!(),runtimeTools:!(),source:1,stdinPanelShown:'1',wrap:'1'),l:'5',n:'0',o:'Executor+x86-64+gcc+14.1+(C,+Editor+%231)',t:'0')),k:49.88193624557261,l:'4',n:'0',o:'',s:0,t:'0')),l:'2',n:'0',o:'',t:'0')),version:4)

We could do something similar to C in C++, with a custom tagged union, but I would like to show off the state of modern C++20 and 
what the standard library designers would prefer we do using `std::visit`.
```cpp
#include<variant>
#include<string>
#include<utility>
#include<algorithm>
#include<iostream>

//Forced to wrap variant in a struct to allow recursive reference 
struct Formula{
    std::variant<
        std::string,
        Formula*,
        std::pair<Formula*, Formula*>
    > data;
};

int depth(Formula* formula){
    //We could use lambdas if this wasn't a recursive struct
    struct Visitors{
        int operator()(std::string s){
            return 1;
        }
        int operator()(Formula* f){
            return std::visit(Visitors(), f->data) + 1;
        }
        int operator()(std::pair<Formula*, Formula*> p){
            return std::max(std::visit(Visitors(), p.first->data), 
                            std::visit(Visitors(), p.second->data)) + 1;
        }
    };
    return std::visit(Visitors(), formula->data);
}

int main(){
    Formula a = {"A"};
    Formula b = {"B"};
    Formula notb = {&b};
    Formula AandNotB = {std::make_pair(&a, &notb)};
    std::cout<<depth(&AandNotB)<<std::endl;
    return 0;
}
```
[Run it](https://godbolt.org/#z:OYLghAFBqd5QCxAYwPYBMCmBRdBLAF1QCcAaPECAMzwBtMA7AQwFtMQByARg9KtQYEAysib0QXACx8BBAKoBnTAAUAHpwAMvAFYTStJg1DIApACYAQuYukl9ZATwDKjdAGFUtAK4sGe1wAyeAyYAHI%2BAEaYxCAAzLGkAA6oCoRODB7evnrJqY4CQSHhLFEx8baY9vkMQgRMxASZPn5cFVXptfUEhWGR0XEJCnUNTdmtQ109xaUDAJS2qF7EyOwcJhoAguaxwcjeWCaxbgBu9XiGBIfY61tmOwx7XgdHQ8TBwFc327v7mIduXkctEIAE9Pptvg9fv8xMASIQECxwbd7o9nm4nK9MKxkTcAPR4gBiJBW6AA1EQyQB3YhMRJk05vC5k4Jkphk15eBwU1Bs2i0VBUsnETDIJapY6YYWYKjRRgrMk3Tnc4nEFheAwmADsVk2ZP1HII6BAIEZ50E/xuButhuNIFe71IVpt%2BtV6oMAConXqXbaTYkmHhiP83RqmF6yaHPcjrVcyegmHVDrqtlqACLJr6bYIEeOYRIEBAQKPhsn8NVh2balPWgkAdSlaA15K8SjJBhKCYULKoFIQeG7VKYCgYYA4ufZIrFxAlUuVlx9%2BvnZIAagPCCQFNXnS6c2TUIloomSBBZhAhnaHUYOVWdTvffqRQQlgwyVxM4ubdqM5/rXuD0eRDEKexYkO6pZULeNYPgaT4vn6prrgQEBrnkm6nqQZYALRXAmdSzIqlhvh%2BGwPt%2B95/oI%2B6HrSQEgRe/qBsGRwlhGrFxokUEUb6cHEK%2BDEgCwTCqOeRomscSEoUh6HzGSiQAHQ0DOBA4bEuCJkwsncTBOkGgJEl5FJaEzhhcnyUoaAMOgqnqfhBHWMRsTQS65GfuRTn3rx/FiYhhmoRuJmyeW4E2Xhmkka5WzZlRQnBKe26fiWbKKrEaaKneZhmLcZjuc5kZgWGZIRClaXbplViZbl95JQwqAEMVhylRlABsERVYlBUGGSGyGOgoR1RYJXpRYAlCQA1pgAD6AZBhA5jNUwmHzbV9W3hmHmfgJTaXEc/xYAWRbzT1Vn9QQFhVrtLw%2Ba4tAkdaXlkhoEXphw8y0JwACsvB%2BNwvCoJwbjWA5CiLMsUrbDwpAEJor3zGNIAfRo8lcFwAAcGjNbEWofZIkhmFqsQAJz6Jwki8CwEgaBopA/VopD/RwvAKCA1PQxwWjzHAsBIJgqiioCJDkJQ9TAAoyiGJUQgIIKP2Q2gLCJHQibpOLIS0FLMsw6Q8uK/QMTAFIrQ63Q0ShKwqy8MbesAPKAhrVK07wvOihsxCi5wTt88gtT4D9vD8IIIhiOwUgyIIigqOo7M6HoBhGCgQOWPoeARMzkDzAe1TM4z9OSsQbxYGnGHEF4gh4GwAAqqCeEX8wg0sKx6BewSq5L0sO5wkM0nSnevSTHBfTTWsM9gXsC8QZKqKjzVYc1khksAyDIG%2BkjI2SECA5Y1iYbgAWEbEXCzLwbMc3DICSIT8mo6jXCE7EzVmJIH0fVqZjNa070cGTQ/R/THu2CzKGMNZhvU4GYb6w9/4n1hqQPOqRnCSCAA%3D%3D%3D)

Finally lets get a breath of fresh air and look at how Rust does it...
```rs
enum Formula{
    Atom(char),
    Not(Box<Formula>),
    And(Box<Formula>,Box<Formula>)
}

fn depth(f : Formula)->u32{
    match f{
        Formula::Atom(_) => 1,
        Formula::Not(f) => depth(*f)+1,
        Formula::And(l,r) => std::cmp::max(depth(*l), depth(*r))+1
    }
}

fn main() {
    let f : Formula = Formula::And(
        Box::new(Formula::Atom('A')),
        Box::new(Formula::Not(Box::new(Formula::Atom('B')))) 
    );
    println!("{}", depth(f));
}
```
[Run it](https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=b16543947173b85db70a21b36409ff51)

### Closing Remarks
Rust appears to be doing quite a nice job. Its syntax for the type itself is much more
similar to the Lean version than the C or C++ version. Its syntax for matching
is far more intuitive, allowing you to avoid any extra machinary that comes with switch statements,
or better yet avoiding the awful synatax and runtime calling overhead of `std::visit`.
+++
authors = ["James Oswald"]
title = "def∇: An APL-Style Self Reference Macro for Lean4" 
date = "2026-10-07"
description = ""
math = false
tags = ["Lean4", "Programming"]
series = ["DefDel"]
draft=false
+++

I’ve been writing recursive functions over syntax trees a lot recently. I also like my Lean code to be concise, but as things start piling up, this becomes harder and harder. Take the following function over propositional logic formulas as an example:

```lean
inductive Formula where
| atom : String → Formula
| neg : Formula → Formula
| conj : Formula → Formula → Formula

def depth : Formula → Nat
| .atom _ => 1
| .neg c => 1 + depth c
| .conj c d => 1 + max (depth c) (depth d)
```
depth is recursive and `depth` is used three times in its own definition. This is fine for small functions, but it can become cumbersome for larger ones. This is an actual function over description logic syntax from a codebase im working on. (You don't need to understand the details to see thats A LOT of `polarize` all all just to handle a pretty simple recursive traversal)
```lean
def polarize {σ : Signature} : 𝒞 σ → Side → 𝒞 σᵂᴷ
| ⊤, +ₚ => ⊤
| ⊤, -ₚ => ⊥
| ⊥, +ₚ => ⊥
| ⊥, -ₚ => ⊤
| [a]ₐ, side => [(a, side)]ₐ
| ¬ₜ c, +ₚ => polarize c -ₚ
| ¬ₜ c, -ₚ => polarize c +ₚ
| c ⊓ₜ d, +ₚ => polarize c +ₚ ⊓ₜ polarize d +ₚ
| c ⊓ₜ d, -ₚ => polarize c -ₚ ⊔ₜ polarize d -ₚ
| c ⊔ₜ d, +ₚ => polarize c +ₚ ⊔ₜ polarize d +ₚ
| c ⊔ₜ d, -ₚ => polarize c -ₚ ⊓ₜ polarize d -ₚ
| ∃[r] c, +ₚ => ∃[r] polarize c +ₚ
| ∃[r] c, -ₚ => ∀[r] polarize c -ₚ
| ∀[r] c, +ₚ => ∀[r] polarize c +ₚ
| ∀[r] c, -ₚ => ∃[r] polarize c -ₚ
```

In Dyalog APL, [the symbol `∇` refers to the current function](https://docs.dyalog.com/20.0/programming-reference-guide/defined-functions-and-operators/dfns-and-dops/recursion/). I wanted something similar for Lean: 

```lean
def∇ depth : Formula → Nat
| .atom _ => 1
| .neg c => 1 + ∇ c
| .conj c d => 1 + max (∇ c) (∇ d)
```

Lean doesn’t have this built in, but as usual, its macro system is powerful enough to implement it. 

## The macro

```lean
import Lean

macro "∇" : term => do
  return Lean.mkIdent `«∇»

namespace SelfRec
open Lean Parser

@[command_parser] def defDel := leading_parser
  Command.declModifiers false >>
  "def∇" >> Command.declId >>
  ppIndent (many (ppSpace >> Term.bracketedBinder) >> Term.typeSpec) >>
  Term.matchAlts
end SelfRec

macro_rules
  | `(command| $mods:declModifiers def∇ $name:ident
      $binders:bracketedBinder* : $ty:term $alts:matchAlts) => do
      let del := Lean.mkIdent `«∇»
      `(command| $mods:declModifiers def $name
          $binders:bracketedBinder* : $ty := $del:ident
        where
          $del:ident : $ty
            $alts:matchAlts)
```

`def∇` expands into an ordinary `def` whose body is a recursive `where` helper named `«∇»`. For example our above `depth` function expands to:
```lean
def depth : Formula → Nat := «∇»
where
  «∇» : Formula → Nat
  | .atom _ => 1
  | .neg c => 1 + «∇» c
  | .conj c d => 1 + max («∇» c) («∇» d)
```

The separate term macro turns each bare `∇` into a reference to that helper. `Lean.mkIdent` is deliberate here: the reference needs to find the local helper, whereas an ordinary quoted macro expansion would be hygienic and miss it. Lean still checks that the recursion terminates. 

# Some Examples

```lean
-- Fibonacci function
def∇ fib : Nat → Nat
| 0 => 0
| 1 => 1
| n + 2 => ∇ (n + 1) + ∇ n

-- Evaluation of propositional formulae under a given valuation
def∇ eval (valuation : String → Prop) : Formula → Prop
| .atom s => valuation s
| .neg φ => ¬∇ φ
| .conj φ ψ => ∇ φ ∧ ∇ ψ
```

You can check out the examples on the web runner [here](https://live.lean-lang.org/#codez=JYWwDg9gTgLgBAGQKYEMB2AoDIUGMoRwBEg4ERFwBccMSUIcAvAHxwAmEGccUSMArlDSJUaAHQgA1gElWSNPAAGAapIBurGhQgkAZzB4kcAMpIANgDMASklwYIYOcPRwACiig7aWAAIBtXBAgOGisAPr6HrQAumxI5rHmACJmlAxwpqiswGgA5uHunlCccADCgcGsorK4pgCyEFnmwLQ6cOYopp5wTEzFRLLmZN0sZUHoldWmMsPFYGBSIXLwABTBAJ5wy3NG%2BriGPXAAKrQgogBGUHgSvEisAELZslAAlMNHJ6Iwaw47Nq89xWOdHEKBguAAFgBBUwwHQYOSsYxmKw2LA4fAQUJQPgZOFcAA%2BcAUywCYxChIAJCAGjoKJN6o1mh4EiQ4BTNNoKMBZPJilwuBSzo8WhQLlcbvdhVAAFSUNlfCg0Ohsjqwig4MFQmE6V7MNgcfn8jLwWSmVJOMSSGRLIkqdSGrjE0kVSnU1i0%2BkNYBNFoJNkcpB8h0CoWLDyiy64a40SVh2VUClfc0U01cnkwIOGgDu4NogeDhpTZjTNoTX0zBYpqtpGoh0Nhzywjz4uBgwAAboYAGLQEA4lBwHN5jCE0GBOVGGBQbI5OCAJMI4D26P2R3A0EhZ1Ql33TAOF9uV4SAmgAFZyg%2B7%2BeL3v9q8XlBYAas2RgGDg883y8LgByoNXojHehQkYFgAEZ%2F3XWdcBAuBQLgABqOBWVsQlRGPM9oMRPU4MQnAAA9NmQ15lmfRsMCfNpgDOOVf3gH8%2F0JAAGGDGNXODsNXIREIAJhg1lli42DXkQ1lMHIuJWSQdsOk2aTTD4UFgAgIQqEnadcivFwCDAV4t0%2FPdXG0%2F9ALgVo9TkhS22U0yII3OBADHgGCABrWXs%2F90IcuBAAngPjPMAciIkO8jAgA)!
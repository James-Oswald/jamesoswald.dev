+++
authors = ["James Oswald"]
title = "Lean4 Macros for Implementing Custom Quantifiers" 
date = "2025-11-08"
description = "This blog post looks at how to implement custom quantifiers in Lean4 using macros."
math = false
tags = ["Lean4", "Programming"]
draft= false
+++

Recently I've been looking at implementing Higher Order Modal Logic in Lean4, particularly custom quantifiers. Isabelle/HOL makes this quite easy, with a built in binder notation mechanism for defining custom quantifiers. Lean4 does not have this feature, but it does have a powerful macro system that allows us to implement custom syntax and pretty printing to achieve the same effect. Mathlib's [ExistsUnique](https://leanprover-community.github.io/mathlib4_docs/Mathlib/Logic/ExistsUnique.html#ExistsUnique) quantifier `∃! x, Φ x` gave me a good starting point for this.

# Example: Actualist Universal Quantifier for Quantified Modal Logic

Lets say we want to implement an actualist universal quantifier `∀ᴱ x, Φ x` for quantifed modal logic in terms of truth sets, ranging over entities of type `e`. We'll define formulae as truth sets of worlds, functions that take a possible world `w` and return proposition (Think about `w -> Prop` as a set of `w` where the formula is true). To account for predicates who's truth value depends on entities `e`, we'll have our quantifer take formulae of the form (`Φ: e -> w -> Prop`) and return a formula `w -> Prop`. Since this is an actualist quantifier, we also need to take into account whether the entity `x` exists at the world `w`, which we will do by having a relation `existsAt : e -> w -> Prop` that tells us whether an entity exists at a world.


We can start by defining the behavior of the quantifier as follows:

```lean
variable {w : Type} -- Type of possible worlds
variable {e : Type} -- Type of entities

-- Some relation indicating existence of entity at world, see note below
opaque existsAt : e -> w -> Prop 

def ActualistUniversal (Φ : e → w → Prop) : w → Prop :=
  fun w => ∀ x : e, (existsAt x w) → (Φ x w)
```

{{< notice note >}}
We make `existsAt` a fixed opaque relation as abstracting this into a variable would
make our notation more busy, but one can easily imagine
making it a variable and instead and having some notation where it is passed as an argument, e.g.
`∀ᴱ[existsAt] x, P x`.
{{< /notice >}}

To write this out manually tho is quite cumbersome, for example assuming we have the predicates `P : e -> w -> Prop` and `Q : e -> e -> w -> Prop` (for example we'll just define them to hold at all worlds for all arguments, we'll use Nats for worlds), we'd have to write:

```lean
def P : e -> Nat -> Prop := fun _ _ => True -- A unary predicate
def Q : e -> e -> Nat -> Prop := fun _ _ _ => True -- A binary predicate

-- ∀ᴱ x, P x
#check ActualistUniversal (λx => P x) -- ℕ → Prop

-- ∀ᴱ x y, Q x y
#check ActualistUniversal (λx => ActualistUniversal (λy => Q x y)) -- ℕ → Prop
```

## Macros to the Rescue

We can use Lean4's macro system to define a custom syntax for our actualist universal quantifier that makes it much easier to use. We'll define a macro `∀ᴱ` that takes a list of binders (variables `x` or typed variables `(x : Type)`, `{x : Type}`) and a term, and expands it into the appropriate nested calls to `ActualistUniversal`.

```lean
open Lean
open TSyntax.Compat in
macro "∀ᴱ" xs:explicitBinders ", " b:term : term => do
  expandExplicitBinders ``ActualistUniversal xs b
```
Putting in all the work here is Lean4's built in [`Lean.expandExplicitBinders`](https://leanprover-community.github.io/mathlib4_docs/Init/NotationExtra.html#Lean.expandExplicitBinders) macro, which takes care of expanding our list of binders into the correct nested lambda expressions.

With this macro defined, we can now use our actualist universal quantifier in a much more natural way:

```lean
#check ∀ᴱ x, P x -- ℕ → Prop
#check ∀ᴱ x y, Q x y -- ℕ → Prop
#check ∀ᴱ x, ∀ᴱ y, Q x y -- ℕ → Prop
-- We can also use typed binders
#check ∀ᴱ (x : Nat), P x  -- ℕ → Prop
#check ∀ᴱ (x : Nat) (y : Nat), Q x y -- ℕ → Prop
```

We still have one issue remaining tho, the pretty printer doesn't know how to display our nested `ActualistUniversal` calls using our custom `∀ᴱ` syntax. For example if we try to do a proof with one we will see the following:

```lean
-- ∀x, P x is true at any world w under actualist universal quantification
example (w : Nat) : (∀ᴱ x, P x) w := by
  simp [ActualistUniversal, P]

-- Initial Proof State:
-- i e : Type
-- w : ℕ
-- ⊢ ActualistUniversal (fun x => P x) w
```

We can fix this by defining a pretty printer undexpander that matches on the structure of our `ActualistUniversal` calls and rewrites them back into our custom syntax. The following is essentially just a modified copy of [the pretty printer macro used by Lean's built in quantifiers](https://leanprover-community.github.io/mathlib4_docs/Std/Do/SPred/Notation.html#Std.Do.SPred.Notation.unexpandForall):

```lean
@[app_unexpander ActualistUniversal] def unexpandActualistUniversal: Lean.PrettyPrinter.Unexpander
| `($(_) fun $x:ident => ∀ᴱ $xs:binderIdent*, $b) => `(∀ᴱ $x:ident $xs:binderIdent*, $b)
| `($(_) fun $x:ident => $b)                      => `(∀ᴱ $x:ident, $b)
| `($(_) fun ($x:ident : $t) => $b)               => `(∀ᴱ ($x:ident : $t), $b)
| _ => throw ()
```

With this pretty printer macro in place, our proof state now looks much nicer:

```lean
-- ∀x, P x is true at any world w under actualist universal quantification
example (w : Nat) : (∀ᴱ x, P x) w := by
  simp [ActualistUniversal, P]

-- Initial Proof State:
-- i e : Type
-- w : ℕ
-- ⊢ (∀ᴱ x, P x) w
```

[Run it live on Lean4 web](https://live.lean-lang.org/#codez=FANwhgTglmBGA2BTABAbysgXMgKgTwAdEBfUSGBFVFbfI0gewLAEcBXFRADygGcAXXgEF+WZCgC0APmQZpyAAoQmwYABNEAM2RCAxvzZh4ffgFUAdlBCIIvI8gAUgMuAxKQEmEs5B6VMAlGIxvZQIsAF5gZGRAbuBkAHdkUJlAACJkLlcAGkduE2FRNNj/D2dUuN9VDW0FMQA5MFF5WvqZHxDMUORNNnNkAH1ehJkcCA51LWQARRq65Abp2abFYLCOrv6+vsTcYcRVAGJdAAtEXQBrHX1DYwELKxs7eEcotM2qrjL9o9PzgyMTG+tbPYHE8Bt9Ln9LAD7o88KDJmk8L4ysAmIhugAZRBgcwoojdHAAZTw5n4YC4ADoAMIMAC2zFEUBxNLAumUyAARElAIy47NSvEw3AIxl0UH4ACFGRpbBzMrzYJh+DYaWJFRBlZs1AwIuIuMxzGoAKK64WiiX6u7IAAGlr0PyuZkhd3sXF4yFge0OxzO3NSmVeMwkyEAqIReRYqD5e5A+hGZeHIWESQMhoLhz1faOZH14WMlBNJ0MtYCJ5AAdRQumxyCMvAYyBpUDS/EIiDUbsld2AEfTXMcaWwjV8fpKAeDBeCnbT3p7Dj7yAHjlh/bqg4muZHybDBFUxaSXCHaT4yH42yromxsNiDAg8FbsWA3DAdKQjniS/4/jEDgzilS/lf7VgPBtV4KA6WQABtW1wWuR1AXgP0AF1VAAAXAsACAIHoukFbEpTBX4YNuOCEOQCpkGw3VcKggiHSI+5sExbFySURB+CbJRGVVckLBw80IGAAAfK0HAAEgcHp/E6boRK4TAoA0ElQR9GT+VgdsIAASQU/gACpMhE2B/E2S0vx7GS5O05AVMwNS+K0tFdP0wzBOEsSJJWaTZPkhzQQMj9IgCwKguC4zTKsrztKcsohJMtzJNWUSIp87ARPfXzDOCzLIlCn1Eos5KrPfKKXI2GR+AOZR4gcZEdz3H8D1dY8OFPKtzAvK8bzie8uEfIUUAcV852XSJsDCurXj/ZZAOA0CQkgi4aP+J14MUBCgA)
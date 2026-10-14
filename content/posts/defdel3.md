+++
authors = ["James Oswald"]
title = "def∇: An inductive∇ Macro" 
date = "2026-10-14"
description = ""
math = false
tags = ["Lean4", "Programming"]
series = ["DefDel"]
draft=false
+++
Last week I looked at some basic "minification" using a small self-reference macro `def∇` in Lean 4. This went so well that I started wondering if I could extend the idea to inductive type constructors. Could I create an `inductive∇` that lets constructors refer to the type being defined with `∇`? In the first post, I defined a simple formula type:
```lean
inductive Formula where
| atom : String → Formula
| neg : Formula → Formula
| conj : Formula → Formula → Formula
```
That is a lot of `Formula` references. I want to write the same declaration with `∇` in their place:
```lean
inductive∇ Formula where
| atom : String → ∇
| neg : ∇ → ∇
| conj : ∇ → ∇ → ∇
```
It should also work for types with parameters. For a list type, `∇` should stand for `CList α` without repeating `α` in every constructor:
```lean
inductive∇ CList (α : Type) where
| nil : ∇
| cons : α → ∇ → ∇
```

## The Macro

This builds on the `selfRef` syntax and `replaceSelf` tree walk from the [previous post]({{< ref "defdel2.md" >}}). Here they are again so the example is complete:

```lean
import Lean

syntax (name := selfRef) "∇" : term

private partial def replaceSelf (call : Lean.Syntax) : Lean.Syntax → Lean.Syntax
  | .node info kind args =>
      if kind == `selfRef then call
      else .node info kind (args.map (replaceSelf call))
  | stx => stx

namespace SelfRec
open Lean Parser

@[command_parser] def inductiveDel := leading_parser
  Command.declModifiers false >>
  "inductive∇" >> Command.declId >> ppIndent Command.optDeclSig >>
  optional (symbol " :=" <|> " where") >>
  many Command.ctor >>
  optional (ppDedent ppLine >> Command.computedFields) >>
  Command.optDeriving
end SelfRec

@[macro SelfRec.inductiveDel] def expandInductiveDel : Lean.Macro :=
  fun stx => do
    let declId := stx.getArg 2
    let name : Lean.TSyntax `ident := ⟨declId.getArg 0⟩
    let sig := stx.getArg 3
    let binders := (sig.getArg 0).getArgs

    let mut call ← `(term| $name:ident)
    for binder in binders do
      if binder.getKind == ``Lean.Parser.Term.explicitBinder then
        let ids := (binder.getArg 1).getArgs
        if ids.size != 1 then
          Lean.Macro.throwError
            "inductive∇ supports one name per explicit binder"
        let id : Lean.TSyntax `ident := ⟨ids[0]!⟩
        call ← `(term| $call:term $id:ident)
      else if binder.getKind != ``Lean.Parser.Term.implicitBinder then
        Lean.Macro.throwError "unsupported binder in inductive∇"

    let ctors := replaceSelf call (stx.getArg 5)
    let args := #[
      Lean.Syntax.atom .none "inductive",
      declId,
      sig,
      stx.getArg 4,
      ctors,
      stx.getArg 6,
      stx.getArg 7
    ]
    let ind := Lean.Syntax.node .none
      ``Lean.Parser.Command.inductive args
    return Lean.Syntax.node .none
      ``Lean.Parser.Command.declaration #[stx.getArg 0, ind]
```

The parser follows Lean's `inductive` command: it reads the modifiers, name, signature, constructors, optional computed fields, and `deriving` clause. The macro then takes the name and the binders from the signature and builds the type that `∇` should mean. For `Formula`, that is just `Formula`; for `CList (α : Type)`, it is `CList α`. Explicit parameters are applied to the name, while implicit parameters are left for Lean to infer.

`replaceSelf` walks the constructor syntax and substitutes that type for each `∇`. The rest of the syntax is put back into an ordinary `inductive` declaration, so the two examples above expand to the original `Formula` declaration and to:

```lean
inductive CList (α : Type) where
| nil : CList α
| cons : α → CList α → CList α
```

Lean then elaborates and checks the resulting declarations just as it would if I had written them by hand.

## Limitations

The binder handling is deliberately small. Each explicit parameter must have a single name, such as `(α : Type)`; a grouped binder like `(α β : Type)` produces an error. Implicit parameters are accepted, but strict implicit, instance, and other binder forms are not. Supporting them would require more cases in the loop that builds the replacement type.

Only `∇` inside constructor syntax is replaced. A `∇` in the declaration's signature or computed fields is outside the part of the tree passed to `replaceSelf`. The replacement is also purely syntactic: it does not inspect scopes or types before replacing a `∇` node.

Finally, `∇` always includes the current explicit parameters. If a constructor needs a different application of the type, write its name and arguments directly. Within those limits, `inductive∇` is a shorthand for an ordinary Lean `inductive`, with no extra type or constructor left behind.

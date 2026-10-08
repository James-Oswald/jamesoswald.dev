+++
authors = ["James Oswald"]
title = "def∇: A Drop In def∇" 
date = "2026-10-08"
description = ""
math = false
tags = ["Lean4", "Programming"]
series = ["DefDel"]
draft=false
+++

Yesterday I looked at `def∇`, a macro for Dyalog APL like self-referencing functions in Lean. 

{{< notice note >}}
Id like to thank my Lisp friend Armin for pointing out Lisp people have also been doing this since time immemorial, and pointing me to Paul Graham's `alambda` from his book *On Lisp* where he does effectively the same thing in Common Lisp.
```
(defmacro alambda (parms &body body)
  `(labels ((self ,parms ,@body))
     #'self))

(alambda (n)
  (if (> n 0)
      (cons n (self (- n 1)))))     
```
{{< /notice >}}

Unfortunately, after using that version of `def∇` in practice in a huge project beyond the toy examples I gave yesterday, I quickly realized its largest limitation: it is not a drop in replacement. It turns the body of the definition into a `where` helper, so proofs that rely on the original definition can break. The `∇` in the body refers to that helper, which closes over the explicit binders rather than calling the function being defined.

My goal today then became a new version of `def∇` that would expand into the ordinary `def` I would have written by hand. Yesterday's macro took this:

```lean
def∇ listLength (α : Type) : List α → Nat
  | [] => 0
  | _ :: xs => 1 + ∇ xs
```
and expanded it to:
```lean
def listLength (α : Type) : List α → Nat := «∇»
where
  «∇» : List α → Nat
  | [] => 0
  | _ :: xs => 1 + «∇» xs
```
Today's will expand the `def∇` into the ordinary `def` I would have written by hand:
```lean
def listLength (α : Type) : List α → Nat
  | [] => 0
  | _ :: xs => 1 + listLength α xs
```    

# The Macro
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

@[command_parser] def defDel := leading_parser
  Command.declModifiers false >>
  "def∇" >> Command.declId >>
  ppIndent (many (ppSpace >> Term.bracketedBinder) >> Term.typeSpec) >>
  Term.matchAlts
end SelfRec

macro_rules
  | `(command| $mods:declModifiers def∇ $name:ident
      $binders:bracketedBinder* : $ty:term $alts:matchAlts) => do
      let mut call ← `(term| $name:ident)

      for binder in binders do
        match binder with
        | `(bracketedBinder| ($arg:ident : $argType:term)) =>
            let _ := argType
            call ← `(term| $call:term $arg:ident)
        | `(bracketedBinder| {$arg:ident : $argType:term}) =>
            let _ := arg
            let _ := argType
            pure ()
        | _ =>
            Lean.Macro.throwError
              "def∇ supports single-name explicit and implicit binders"

      let alts' : Lean.TSyntax ``Lean.Parser.Term.matchAlts :=
        ⟨replaceSelf call alts.raw⟩
      `(command| $mods:declModifiers def $name
          $binders:bracketedBinder* : $ty $alts':matchAlts)
```

This time `∇` is syntax that the `def∇` command handles itself. There is no separate term macro turning it into a local `where` function. `replaceSelf` walks through the match alternatives and replaces each `selfRef` node with a call to the name we are defining. It does this before Lean elaborates the function, so Lean just sees an ordinary recursive `def` afterward.

The slightly tricky part is building that call. We start with the function name, then add each explicit binder. In `listLength`, that makes `call` into `listLength α`. Implicit binders are skipped because Lean will infer them when it elaborates the call. So `∇ xs` becomes `listLength α xs`. The macro then puts the rewritten alternatives back under a regular `def`, keeping the original name, binders, return type, and modifiers. There is no extra helper for proofs to unfold, and Lean still checks termination as usual.

# Limitations

I've had great success with this macro so far in my own project, but it is important to understand its limitations, some of which I lay out here:

This is still a small macro, not every form of Lean's `def`. It only parses equation-style definitions with match alternatives, so it does not handle a body written with `:=`. The binder loop also only knows about a single named explicit binder like `(α : Type)` or a single named implicit binder like `{α : Type}`. Grouped binders such as `(x y : Nat)`, instance binders, and other binder forms hit the error message in the code above.

There is also a tradeoff in the shorthand. `∇` automatically passes the current values of all explicit binders. You write `∇ xs`, not `∇ α xs`; the latter would pass `α` twice. This is convenient for a traversal where those parameters stay fixed, but it means you cannot use `∇` to make a recursive call with a *different* value for one of those explicit parameters. In that case, call the function by name.

Finally, `replaceSelf` is just a syntax tree walk. It replaces every `∇` node it finds in the alternatives; it does not try to understand scopes or distinguish a recursive call from an `∇` tucked inside some other syntax. That is enough for the functions I wanted to write, but it is something to keep in mind before using it as a general replacement for `def`.

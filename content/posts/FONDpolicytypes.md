+++
authors = ["James Oswald"]
title = "The Three Types of FOND Planning Policies" 
date = "2026-08-27"
description = "We discuss the three types of fond policies with an illustrated example"
math = true
tags = ["Automated Planning"]
series = []
draft= false
+++

In fully-observable non-deterministic (FOND) planning, there are three primary types of policies, weak policies, strong policies, and strong cyclic policies. To illustrate each we give the following example FOND problem with three routes, modeled as a non-deterministic transition system.

{{<mermaid>}}
flowchart LR
    s0["State: s0<br/>(Start)"]
    a_risky["Action:<br/>risky-jump"]
    a_retry["Action:<br/>retry-walk"]
    a_det_s["Action:<br/>detour-start"]
    s_dead["State: s-dead<br/>(Dead End)"]
    s1["State: s1"]
    s2["State: s2"]
    a_step["Action:<br/>safe-step"]
    a_det_e["Action:<br/>detour-end"]
    s_goal["State: s-goal<br/>(Goal)"]

    s0 --> a_risky
    s0 --> a_retry
    s0 --> a_det_s
    a_risky -.->|lose| s_dead
    a_risky -.->|win| s_goal
    a_retry -.->|succeed| s1
    a_retry -.->|slip| s0
    a_det_s --> s2
    s1 --> a_step
    s2 --> a_det_e
    a_step --> s_goal
    a_det_e --> s_goal

    classDef stateNode stroke-width:2px
    classDef actionNode stroke-width:2px,stroke-dasharray:3 3
    classDef terminalNode stroke-width:3px
    class s1,s2 stateNode
    class s0,s_goal,s_dead terminalNode
    class a_risky,a_retry,a_det_s,a_step,a_det_e actionNode
{{</mermaid>}}

We can encode this domain in PDDL as follows:

{{<details summary="Show the PDDL encoding">}}

```lisp
; Domain file
(define (domain fond-example)
  (:requirements :typing :non-deterministic)
  (:types location)
  (:predicates (at ?l - location))

  ;; 1. The Risky Action: Might succeed, might result in an unrecoverable dead end.
  (:action risky-jump
    :parameters ()
    :precondition (at s0)
    :effect (oneof
              (and (not (at s0)) (at s-goal))
              (and (not (at s0)) (at s-dead)))
  )

  ;; 2. The Slippery Action: Might succeed, might result in no state change (requiring retry).
  (:action retry-walk
    :parameters ()
    :precondition (at s0)
    :effect (oneof
              (and (not (at s0)) (at s1))
              (and ))
  )

  (:action safe-step
    :parameters ()
    :precondition (at s1)
    :effect (and (not (at s1)) (at s-goal))
  )

  ;; 3. The Deterministic Detour: A safe, multi-step path.
  (:action detour-start
    :parameters ()
    :precondition (at s0)
    :effect (and (not (at s0)) (at s2))
  )

  (:action detour-end
    :parameters ()
    :precondition (at s2)
    :effect (and (not (at s2)) (at s-goal))
  )
)
```

```lisp
; Problem file
(define (problem fond-prob1)
  (:domain fond-example)
  (:objects s0 s1 s2 s-goal s-dead - location)
  (:init (at s0))
  (:goal (at s-goal))
)
```

{{</details>}}

## Weak Policies

A weak policy is one that guarantees reaching the goal in at least one possible execution, but not necessarily in all executions. In our example, a weak policy could involve attempting the risky jump, since there is a chance of reaching the goal immediately, even though it might also lead to a dead end. IE the policy
$$
\pi(s0) = \text{risky-jump}
$$

## Strong Policies

A strong policy is one that guarantees reaching the goal in a bounded number of steps, regardless of the non-deterministic outcomes of actions. In our example, the strong policy would avoid the risky jump and instead follow the deterministic detour. Note that following the retry-walk action is not part of the strong policy, because it might require an unbounded number of retries to succeed after slipping, which violates the boundedness requirement.

$$
\begin{aligned}
\pi(s0) &= \text{detour-start} \\\\
\pi(s2) &= \text{detour-end} \\\\
\end{aligned}
$$

## Strong Cyclic Policies

A strong cyclic policy is one that guarantees reaching the goal eventually, but allows for the possibility of revisiting states multiple times due to non-deterministic outcomes. In our example, a strong cyclic policy could involve repeatedly attempting the retry-walk action until it succeeds, ensuring eventual progress towards the goal.

$$
\begin{aligned}
\pi(s0) &= \text{retry-walk} \\\\
\pi(s1) &= \text{safe-step}
\end{aligned}
$$

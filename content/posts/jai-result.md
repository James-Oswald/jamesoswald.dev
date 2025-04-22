+++
authors = ["James Oswald"]
title = "Emulating Rust's Result type and ? Operator in Jai with Metaprogramming" 
date = "2025-02-02"
description = "This post looks at how to emulate Rust's Results in Jai"
math = false
tags = ["Jai", "Programming"]
series = ["Jai"]
draft= false
+++

{{< notice note >}}
This Post was originally written February 2nd, 2025 but released April 22nd, 2025.
I held onto it and forgot about it in my drafts folder because it did not feel very original, 
particularly after borrowing so much from SogoCZE, but decided to release it anyway as there does
not seem to be any public resources on how something like this may be accomplished.  
{{< /notice >}}

Recently I've been playing around with Jai again after getting access to the closed beta. For the past six months ive been using Rust and really enjoying their error handling with Result, and was curious how one might go about implementing it in Jai. This post is a quick look at a simple implementation. 

### A Basic Result Type and Constructors  

The code below defines a generic `Result` struct that carries either a successful value (`ok`) or an error (`err`). Additionally, it includes a boolean flag `is_ok` to indicate which of these values it holds. By leveraging Jai’s metaprogramming facilities, we can write macros that construct results similarly to Rust. Unfortunately due to no result type inference, we need to specify the type of the error if we are constructing an ok value, and the type of the ok if we are constructing an err. 

```jai
Result :: struct($T : Type, $E : Type) {
    is_ok : bool;
    ok : T;
    #place ok;
    err : E;
}

ok :: (ok : $T, $E : Type) -> Result(T, E) #expand {
    return .{is_ok=true, ok = ok};
}

err :: ($T : Type, err : $E) -> Result(T, E) #expand {
    return .{is_ok=false, err = err};
}
```

## The try macro: Emulating the ? Operator
Rust’s ? operator simplifies error handling by automatically returning from a function if an error is encountered. Here, we mimic that behaver with a try macro that makes use of Jai's ``return` to return from the outer scope. Credit to [SogoCZE](https://github.com/SogoCZE) for this idea.
```
//Rust's ? operator
try :: (result: Result($T, $E)) -> T #expand {
    if !result.is_ok {
        // Exit in the current scope
        // Auto-casts to correct result return type if necessary
        `return .{is_ok=false, err = result.err};
    }
    return result.ok;
}
```
Try assumes it will be used in a function that returns a Result, if its not we will get a compiler error. To better harden this, perhaps one could use #this to inspect the return type of the function try is being called from and return a more readable error message at compile time. 

# Additional Functions

To further showcase result types in Jai, we include several of the common utility functions Rust has:
- unwrap: Extracts the value from a Result and “panics” (exits) if it is an error.
- unwrap_or & unwrap_or_else: Provide default values when an error is encountered.
- map & map_err: Transform the contained value or error, respectively.

```jai
//Extract the value from a Result, "panics" if it's an error
unwrap :: (result: Result($T, $E)) -> T #expand {
    if !result.is_ok {
        `log_error("attempted to unwrap an error result!");
        `exit(1);
    }
    return result.ok;
}

unwrap_or :: (result: Result($T, $E), default: T) -> T {
    return ifx result.is_ok result.ok else default;
}

unwrap_or_else :: (result: Result($T, $E), default: (E) -> T) -> T {
    return ifx result.is_ok result.ok else default(result.err);
}

map :: (result: Result($T, $E), f: (T) -> $U) -> Result(U, E) {
    return ifx result.is_ok ok(f(result.ok), E) else err(U, result.err);
}

map_err :: (result: Result($T, $E), f: (E) -> $F) -> Result(T, F) {
    return ifx result.is_ok ok(result.ok, F) else err(T, f(result.err));
}
```

Below are two example functions: foo_good and foo_bad. Credit to [SogoCZE](https://github.com/SogoCZE) for the original example.
- foo_good constructs a successful result using ok and then uses try to extract the value.
- foo_bad intentionally creates an error result and demonstrates the early exit behavior of try.
The main function calls both examples, showcasing the behavior of our custom error handling utilities.

```jai
#import "Basic";

foo_good :: () -> Result(float, string) {
  result := ok(42, string);
  value: int = try(result);

  print("Will get here!\n");

  return ok(cast(float) value, string); // Different result type
}

foo_bad :: () -> Result(float, string) {
  result := err(int, "Error!");
  value: int = try(result);

  print("Won't get here!\n");

  return ok(cast(float) value, string);  // Different result type
}

main :: () {
    print("foo_good is: %\n", foo_good());
    // foo_good is: {true, 42, ""}
    print("foo_bad is: %\n", foo_bad());
    // foo_bad is: {false, 0, "Error!"}
    
    //unwrap examples
    print("unwrap foo_good: %\n", unwrap(foo_good()));
    //unwrap foo_good: 42

    // This will exit the program
    //print("unwrap foo_bad: %\n", unwrap(foo_bad())); 
    print("unwrap foo_good or default 0: %\n", unwrap_or(foo_good(), 0.0));
    //unwrap foo_good or default 0: 42
    print("unwrap foo_bad or default 0: %\n", unwrap_or(foo_bad(), 0.0));
    //unwrap foo_bad or default 0: 0

    //map examples
    print("map foo_good: %\n", map(foo_good(), x => cast(int)x + 5 ));
    //map foo_good: {true, 47}
    print("map foo_bad: %\n", map(foo_bad(), x => cast(int)x + 5 ));
    //map foo_bad: {false, 6}
    
    //map_err examples
    print("map_err foo_good: %\n", map_err(foo_good(), x => sprint("Uh Oh: %", x)));
    print("map_err foo_bad: %\n", map_err(foo_bad(), x => sprint("Error: %", x)));
}
```


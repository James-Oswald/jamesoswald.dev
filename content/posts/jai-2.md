+++
authors = ["James Oswald"]
title = "Embedding, Jai, and Joy (Jai Part 2)" 
date = "2024-06-24"
description = "This post looks at Jai and embedding resources into executables using the #run directive."
math = false
tags = ["Jai", "Programming"]
series = ["Jai"]
draft= false
+++

[Last post](/posts/jai-1) we looked at Jai's powerful standard library and probably praised it too much for making what others would probably call a bad decision: including too much specific stuff in the standard. But you know what, it brought me a lot of joy to be able to do something like that out of the box, so thats ok. In this post we'll look at another gripe I have with C++ and see if Jai can save us from it. 

### Rage Against C/C++ Resource Embedding Hell

In another universe not so far away, there exists another problem I've had the misfortune of meeting at least three times in my C++ career: resource embedding. *i.e*. embedding your images, audio, data, etc. inside of an executable so you can distribute a *standalone executable* without the need for an installer, and having your program keep track of where a bunch of resource files are. Java didn't get much right, but the executable Jar is a good case study of resource embedding and one thing I think java did get right. Windows also provides some platform specific shenanigans for embedding resources but this is not viable cross platform.

{{< notice note >}}
I should note that C23 introduced the `#embed` directive exactly for this purpose, however as of writing 6/24/2024, it is still [not supported by any compilers](https://en.cppreference.com/w/c/compiler_support/23). Read [this post](https://thephd.dev/implementing-embed-c-and-c++) for a good overview on C23's `#embed` and its implementation difficulties. 
{{< /notice >}}

In C/C++ the tried and true solution is to **programmatically generate a header file containing the entire resource as an array of bytes** (see [here](https://stackoverflow.com/questions/11813271/embed-resources-eg-shader-code-images-into-executable-library-with-cmake)). There are utilities to do this as well, the hexdump utility `xxd` on linux has a flag `-i` that will cause it to dump a file `foo.xyz` to a C header file `foo.h`. The header file `xxd -i foo.xyz` will take the form:
```c
unsigned char foo[] = {
  0x48, 0x65, 0x6c, //...
};
unsigned int foo_len = 47;
```
The issues begin to arise when you have resources that mutate between builds and want to do this in a cross platform way (tools like `xxd` are platform dependent). I've discussed this at length with a friend of mine who at the time was on the the CMake development team, and I was shocked to hear 
that when it comes to doing this in enterprise scale applications, almost everyone is rolling their own CMake solution or trying and borrow and adapt someone elses solution (see [here](https://jonathanhamberg.com/post/cmake-file-embedding/) for a CMake solution). Thus the nightmare begins. 

### Can Jai Help?

Let us return to our Jai program for rendering a png to a window from the last post. Recall that we have a resource `blow.png` that we load at runtime. 
```jai
    bitmap := get_bitmap("blow.png");
    image : Simp.Texture;
    Simp.texture_load_from_bitmap(*image, *bitmap);
```

For the sake of learning, lets try moving the executable out of the folder with `blow.png` and see what happens.
```
>main1.exe
Unable to load bitmap 'blow.png'.
main.jai:15,5: Assertion failed: Failed to load bitmap from blow.png
jai/modules/Basic/module.jai:87: assert_helper
main.jai:15: get_bitmap
main.jai:27: main
```
As expected, the program can't find the resource. This sucks because I would like to DM this exe to my friends on discord and have them see Johnathan's face when they run it, but I don't want them to have to download `blow.png` as well. 

If only there were a way to embed the image in the application at compile time. Well we're in luck... there is a way to do this, and it only requires
adding a single directive to the program, `#run`. 
```jai
    bitmap := #run get_bitmap("blow.png");
    image : Simp.Texture;
    Simp.texture_load_from_bitmap(*image, *bitmap);
```

Alright and now we can compile it:

```bash
jai main2.jai
```

and move it out of the folder with `blow.png` and run it:

```
main2.exe
```

and voilà:

![alt text](/blog/blow.png)

So what exactly does `#run` do? It instructs the compiler to evaluate Jai code during compilation. What makes Jai's version of this particularly powerful is that Jai can do **ANYTHING** in a `#run` directive, from opening files to downloading data over the internet. 

{{< notice note >}}
For more on the `#run` directive I strongly suggest reading [the Jai community wiki article](https://jai.community/t/run-directive/145)
{{< /notice >}}

In our small example we run the `get_bitmap` call at compile time and the generated bitmap is embedded in the `.data` section of the executable.

{{< notice note >}}
All memory returned by a `#run` gets copied into the data section of the executable even if assigned with `:=` instead of `::`
-Local Jai Expert
{{< /notice >}}


Upon seeing `#run` in action for the first time I immediately thought of embedding as an application but honestly this does not even scratch the surface of its true power. Im looking forward to seeing and playing around with more applications. Since embedding has given me so much grief in C++ over the years and I was able to embed a resource in Jai with one word, I would say that Jai has once again brought me joy.  

All code in this post is available [here](https://github.com/James-Oswald/Jai-Simp-and-Embed) on my GitHub.




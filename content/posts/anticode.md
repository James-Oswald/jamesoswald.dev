
+++ 
authors = ["James Oswald"]
title = "Anticode: A Good Minimalist Code Of Conduct for Small Open Source Projects" 
date = "2023-11-03"
description = ""
math = false
tags = ["Software Development", "Opinion"]
series = []
+++

Recently while trying to get [one of my Github repositories](https://github.com/RAIRLab/Peirce-My-Heart) to meet [Github's recommended open source project guidelines](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/about-community-profiles-for-public-repositories), I found myself in need of a code of conduct for my project. 

Github offers two default options for you to pick from:
1. [The Contributor Covenant](https://www.contributor-covenant.org/) used by some of the worlds largest open source projects, such as Linux, git, Tensorflow. 
2. [The Citizen Code of Conduct](https://github.com/stumpsyn/policies/blob/master/citizen_code_of_conduct.md) is a general purpose code of conduct designed for events and projects.

These are quite good, and feature very clear policies that can be beneficial for large communities with multiple administrators, and feature a clear list of unacceptable behaviors. I find however that sometimes less is more, much of the policies outlined in these codes of conduct are primarily beuracratic in nature and are not particularly relevant to open source development, the The Citizen Code of Conduct for example has a weapons policy section.

Looking for alternatives I found the [Anticode](https://git.sr.ht/~webb/anticode) by [webb](http://webb.spiderden.org/). While webb seems to take more issues with existing codes of conduct than I do, I am particularly fond of Anticode's productivity first mission statement, which I feel harkens to the core purpose of a code of conduct: to help open source developes stay on task and get things done without worrying about community drama or harassment. 

```txt
The anticode is designed for what's important. It's designed to make
people more productive, and focus on getting stuff done. It's simple,
easy to understand, accessible, and without ambiguity.
```
The notion of accessability in this mission statement is understated, Anticode takes less than 30 seconds to read and manages to subsume much of the content from other codes of content, by leaving responsibility in the hands of the community administrators. Additionally, Anticode is in the public domain, making it effortless to use in any open source project. Due to this, I plan on adopting Anticode for all of my open source projects for the forseeable future. 

The Anticode of conduct: 
```
# Code of Conduct

## Scope
This code of conduct applies to on-topic development channels of the project. This
includes but is not limited to:
- Bug trackers
- Development repositories
- Mailing lists
- Non-development platforms if misbehaviour is also applicable to development channels
- Any other communication method for development of software

Off-topic channels are subject to their own rules and guidelines.

## Standards of Communication

We expect all users to stay on-topic while using development channels. 

We will not accept the following:

- Stalking and witchhunting
- Arguments, and off-topic debates
- Ad hominems
- Attempts to flame, or otherwise derail communication
- Troll feeding

If you see misbehaviour, ignore the person(s) and speak with a moderator or administrator.
```
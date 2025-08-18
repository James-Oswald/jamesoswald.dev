
+++
authors = ["James Oswald"]
title = "Status Page Theater" 
date = "2025-08-17"
description = ""
math = true
tags = ["Opinion", "Website"]
series = []
draft=false
+++

Earlier this week [Overleaf](https://www.overleaf.com/) went down. Not that you would ever know, as [their status page](https://status.overleaf.com/) still, days later, says nothing at all happened. Crowd sourced status sites like [downdetector](https://downdetector.com/) and [isitdownrightnow](https://www.isitdownrightnow.com) tell a different story, with 100s of comments complaining about the outage. 

So surely this must be a bug in Overleaf's status checking software right? I asked myself this question curiously while refreshing Overleaf's status page, unaware of the rabbit hole it would take me down. Overleaf's status page looks suspiciously like [Discord's status page](https://discordstatus.com/) a large green bar boldly proclaiming "All Systems Operational", followed by lots of little bars representing daily issues over the course of the past 90 days, followed by text listing percentage system uptime, seemingly always 99 point something. 

Interesting, these companies must be using the same status software, from some third party provider. But in that case, if all they're shipping is status software, it should be pretty good right? Who would use ship buggy status software? Maybe they're just only checking that the site is up every 10-30 mins? Oh if only it was that innocent of an answer. 

After digging around for all of 10 seconds and scrolling to the bottom of Overleaf's status page I finally saw it "Powered by Atlassian Status Page." Wow the the big guys, I wonder why they're haven't detected the outage? I clicked on the link for [Atlassian Status Page](https://web.archive.org/web/20250815193847/https://www.atlassian.com/software/statuspage) and from there proceeded to lose any modicem of good faith I had in any of the companies listed for their efforts in trying to "transparently communicate issues with end users".

One thing should be made very clear: Atlassian Status Page is not a status page. It is a status microblogging tool where companies self report "incidents" as little blog posts. Displayed status and uptime are not tied in any real automated way to actual status and uptime, but are rather simply manufactured by whoever is running the status page. In short, the majority of companies are playing at status page theater. This becomes slightly more concerning when you consider that "uptime" is not just a nice number to feel good about, but is given by companies in earnings reports and reliability reports to show off how trustworthy they are for investors and users. 

So, this was quite depressing. I am not a fan of theater, but surely there are people out there doing the right thing and actually reporting downtime right? As usual my friend [Brandon Rozek](https://brandonrozek.com/) is a few years ahead of me here. I recalled him writing [a post](https://brandonrozek.com/blog/website-status-checking/) using [updown.io](https://updown.io/) for implementing his own status page for his website. Of course, this is a real status page that does exactly what you would expect. It's a 3rd party service running on multiple servers across the world and every few minutes these servers ping your website and aggregate the results, finishing by displaying a nice collection of statistics for users and admins alike. 

I liked this so much, that I decided to run my own which you can now find at [status.jamesoswald.dev](https://status.jamesoswald.dev/). Long live real status pages, down with status page theater!
title: SSDNodes review
date: 2020-06-15
tags: hosting
----

A while ago when reading [yellow site](https://news.ycombinator.com) I stumbled upon [a comment](https://news.ycombinator.com/item?id=22651472) from XERQ, who is a founder of [SSDNodes](https://www.ssdnodes.com/). The company's value proposition is to pay them for a year and get **a massive** discount on price compared to [Linode](https://linode.com) (which is what I'm using right now) or others: thousands of dollars a year!

Honestly saying, I almost rented a server that day, since SSDNodes homepage was boasting a sale which will end in around 18 or something hours. When I went to checkout it turned out that advertised price of $89 per year for a high-performance 16 GB VPS (with NVMe!) is valid when you pay for three years, not for a year. It'll be $139 if I pay for a year and I decided not to rush. :)

The next day I discovered that "sale" was restarted (again "only XX hours left!") and while it left me with a displeasing aftertaste, I thought nothing particularly bad about it. I decided to put off buying though. I'm not "losing" too much using my current Linode's node and it's okay for my tasks. Bigger boxes just lure me. :)

## Next episode

Fast forward a few months and finally I had something to do for a box of this size! So I went and bought one "on sale" for 89 err 139$. 

It provisioned just well, gave me an IP and a root password, and away we go! I logged in my brand new Ubuntu 20.04: `apt update` reported 3 packages due for an upgrade. During `apt upgrade` I noticed that new kernels (especially their headers) became big: it took noticeable time to finish upgrading them!

Then the actual task: I went to download GraalVM release from Github. And that's what set me off! I downloaded the same release an evening before on Linode VPS (where it died OOM during compilation, haha) and while it's 100+ MB it wasn't a burden. On SSDNodes it was taking a while, started at ~300 KB/s, and then settled at ~3 MB/s. I went to check and sure enough Linode was doing 20 MB/s.

Wow. Where's my promised 10 Gbps network? That looks worse than my home connection!

And then `tar xf` took an infinite amount of time. Like, all of time in the world. So I googled how to check disk speed and came back with `hdparm` - haven't touched that tool since the early 00s. :)

Okay, so this is how hdparm looks on Linode:

That is good results I think. This is how it looks on SSDNodes:

```
root@rigel:~# hdparm -Tt /dev/sda

/dev/sda:
 Timing cached reads:   11810 MB in  1.99 seconds = 5931.70 MB/sec
SG_IO: bad/missing sense data, sb[]:  70 00 05 00 00 00 00 0a 00 00 00 00 20 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
 Timing buffered disk reads: 310 MB in  3.03 seconds = 102.39 MB/sec
```

NVMe my ass! That is stone age speeds! Also, what is this stuff about missing sense data?.. I didn't even try to benchmark CPU, just looked at `/proc/cpuinfo`, there were 4 of those:

```
model name	: Intel(R) Xeon(R) CPU E5-2650 v4 @ 2.20GHz
cpu MHz		: 2199.998
cache size	: 4096 KB
```

It's a 4 years old CPU. Should be okay I guess if it's not overloaded, shame I didn't test. Linode is on AMD EPYC though, another score in their basket. :)

Okay, so what's next? Fortunately enough they guarantee 14 days money back. It's through a ticket and not an automated button. They asked me why and after being provided with hdparm output proposed to "recreate the server in another location that will provide better performance". I declined and received a notification that my refund is processed. Money had arrived quickly, so that's a plus.

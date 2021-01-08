title: Streaming
date: 2021-01-05
tags: video
draft: true
----

Few months ago I got a feeling that I'd enjoy live streaming some coding. I'm not an introspective kind of person, but it seems to be somewhere along the lines of "sitting at home," "not enough people around to complain to" and things like that. Plus it feels like it could spark some interesting discussions. Maybe. Also this creates some time-based pressure to do smaller projects — because you're doing that every Wednesday (or whenever). And doing small things outside of a general job-related stuff makes me feel like a person with wider interests. Who am I kidding though, it's all programming.

The issue here is that I can't just start doing something. I can't just buy a dishwashing machine  — I need to read up on what are the current features and trends and qualities and select the one I like. It's the same here  — I can't stream with my Macbook's cam even though I'm going to sit in a little sector of a video. I need a better webcam so I can feel like it's for real! So I set to research the topic.


## Camera

And it turns out [you can't buy a good webcam](https://vsevolod.net/good-webcams/). They are all shit — even if you pay $200+. If you want a good picture quality the only way right now is to buy a photo camera with an HDMI capture card. All major brands have released drivers to connect cameras via USB, but those drivers are unanimously bad: USB2 can support compressed 1080p60, but those drivers only support 576p30. What is this madness I don't know, so you have to use an HDMI capture card.

The capture card could either be some [cheap thingie](https://aliexpress.com/item/4000917130635.html) for $15 from Aliexpress, or an [Elgato Camlink 4K](https://www.amazon.com/dp/B07K3FN5MR) for $130 (or other proper brand-name stuff for even more money). I settled on a cheap crap and it works fine for now: it doesn't support 4K, and 1080p is also questionable, but the resulting video quality is miles ahead of webcams and phones.

For a camera you have two non-negotiable properties:

1) It should be able to work from an AC adapter. Obviously, working using batteries and a charger is insanity, when it's a non-mobile working place.
2) It should output so-called "clean HDMI". Which means that HDMI output should contain whatever camera sees but without all the technical information, which is present on a camera screen — like a shutter speed or a battery level.

The second one just out-ruled my Fuji X-T1, because it outputs only recorded footage at the HDMI port. It was painful to realize, but I went to [OLX](https://www.olx.ua/) (it's a local classified site) and bought used Sony a5100 for $250. 

There are a few reasons why a5100:

1) Sony's autofocus is the best on the market.
2) The sensor is good enough. I looked at [dxomark](https://www.dxomark.com/sony-a5100-sensor-review-uncompromising-performance/) results and they are almost the same as much newer a6400 and a6600 results.
3) It has a flip-out screen which flips up 180° (sticking from the top of the camera). Excellent as a self-monitor, because it will work even if some of the components in the path fail.
4) It's dirt cheap. It's an older model made for 6 years already.

I'd prefer to have Fuji — their colors are so much better to look at — but I wanted to keep investment low just in case in two months time I decide I don't need it all. And the cheapest Fuji setup would be 2x from a5100 — partially because Sony's kit lens is so cheaply made, ugh! Also, when I compared a5100 autofocus performance to my beloved X-T1 my jaw just dropped. Reviews suggest that newer Fuji cameras have improved greatly, but still are not on par with Sony.


## Mount

Of course, you can't just put a camera on your display. Webcams can do that, haha, should've gone that way, right? Tripod is an option if you have a place to put it beside a table, but I don't. So I watched some YouTube videos to see how people mount cameras to film themselves and discovered a Magic Arm. 

> *Aside*: did I tell you I had to watch a lot of videos instead of reading text to discover everything? No? Now I did. It's a bit painful, but lots and lots of information are in video format and text articles about streaming are hard to find and incomplete. I guess including this one. :-)

Back to the story. I never saw Magic Arms before, but the way they work is magical:

<iframe class="mcenter" width="560" height="315" src="https://www.youtube.com/embed/yfE00pXkL8U" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

It seems that Manfrotto invented that stuff (can't find reliable sources, but I recall reading somewhere it was invented in 2008), but now everyone and their grandma are making clones of that stuff. Clones are not even close in terms of quality to Manfrotto's products (or Matthews Infinity Arm, or other costly brands), but they are cheap! You can get a "decent" one along with a "crab" clamp for around 20-25$ here in Ukraine (and even cheaper on AliExpress). It's made from aluminum and will die on you if you use it a lot, but I'm not going to.

So I bought a monitor stand (a cheap one, of course), and put a magic arm there, and a little $4 ball head, and — bam! — camera is looking right at me now.


## Microphone

They say that there are three important things in a video, in that order:

1. Sound
2. Light
3. Video

And... did you know that camera's mic is the worst mic ever? By a weird coincidence — I tried to make a video from Fuji X-T1 few times :) — I already knew that. They pick up weird frequency profiles (to a point where I can't listen to my own voice from those mics), and they are **noisy** as hell. My MacBook's mic array is vastly superior to a camera mic, but it just won't do. It won't feel real (see above)!

I knew next to nothing about mics, and I didn't just want to buy a Blue Yeti because it's a layman choice. Plus I had an audio interface with XLR input and a 48V phantom power[^1]. So I went to read and view — because there are heaps of information on YouTube which just don't exist in text form! — on mics and after some point stumbled upon [Neat Worker Bee](https://www.neatmic.com/bee/worker-bee-microphone/).

[^1]: "next to nothing" is on the ternary scale, of course; phantom power is a current sent along XLR cable from a pre-amplifier to a condenser mic to drive it — it's like PoE!

<img class="mcenter" alt="worker bee image" src="https://images-na.ssl-images-amazon.com/images/I/81iDWBewlfL._AC_SL1500_.jpg" height="400px">

It turned out that because of Gibson's bankruptcy a CEO of Neat Microphones was able to buy it (maybe not by himself alone, but still). And that CEO  — [Skipper Wise](https://en.wikipedia.org/wiki/Skipper_Wise) — is one of the founders of Blue Microphones. So they bought it out and lowered prices 2x to 3x on all their equipment. Both King Bee and Worker Bee have loads of glowing reviews on YouTube, and their design... It's funny and it's different, so I went to buy one. Unfortunately, King Bees are no longer produced, so Worker Bee it is. Too bad that it's mostly black from the back (especially sitting in a cradle), so it's a bit less interesting in a captured video than I hoped.

Other big brands you probably know of — like Audio-Technica and Shure — are great as well. There are some other great companies I've never heard of before, like RØDE. 

Various tests say that your listeners won't be able to tell the difference if you have any mic costing from about $100. Do whatever you want with that information.


## Light

That's the hardest one, because it's much more about physical world than anything else. Like, you can compare a camera to other cameras and buy the one you decided on, you can do the same with mic, but with lightning the specs of light you buy is not going to be the main thing. The main thing is placement. Tutorials say you have to have three different light sources: a key light, a fill light and a back light.

A *key light* is a bright source of light that should light up your face somewhat from the side so that you have some shadows. I put a Yongnuo YN300 right behind my camera. 

A *fill light* should be slightly less bright, its purpose is to reduce harshness of those shadows on your face. I have a small lamp from the other side of my display which I reflect from the wall.

And a *back light* is something to highlight you from a back (surprise!) to add a feeling of depth to the image. I have nothing there and image suffers a little bit because of that. I'll have to fix that.

There are also so-called *practical lights*, whose purpose is to add interesting points to your background so it's less dull.


## Streaming

Now that I told you the gist of what I learned over the course of few weeks (I'll try to add more information, it's hard to extract knowledge from a human brain), let's get to the point of all that — streaming.

I did [some](https://www.youtube.com/playlist?list=PL7gxcNpwRVlp1Xepntn5EiUFo0YjtT8ok). It doesn't feel satisfying though. I know that to get some audience you have to persist, but the content should be interesting as well. 5 viewers suggest it's not yet.

I still feel the itch to produce some video content, but I guess it shouldn't be live coding. It's not exciting to watch some guy trying to figure out what the hell is going on with that SHA1 calculation for 10 minutes. Maybe diving deep in some bigger project would be more interesting, but I'm not involved into a big open source right now and showing innards of Kasta is something I'm wary of. 

So right now the idea is to do a number of (shorter) videos on various technical/programming topics, like why PostgreSQL is the best DB, or what do I think about Hotwire, etc. Topics are not set in stone and I'm open to suggestions! Stay tuned, [subscribe](https://www.youtube.com/c/asolovyov) to my channels to get notifications, etc.
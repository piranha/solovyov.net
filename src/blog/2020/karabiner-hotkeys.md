title: Switching languages with Karabiner
date: 2020-01-04
tags: software, macos
favorite: true
----

Life has blessed me with being born in Ukraine; this complicates life a bit when dealing with computers. For example, you can't just use a single layout like all those peoples in the USA or elsewhere where they have this luxury. That makes living in Ukraine similar to living in Russia or elsewhere where they have the same problem. So it's like a layout for Latin letters (for writing text in English and programming) and layout for Cyrillic letters.

But, you see, here comes a problem. After hundreds of years of Russian rule, we got a situation where the Russian language is widespread along with Ukrainian. And keyboard layouts for those two are a little bit different. Different enough to make a single unified layout (where you have all letters for both alphabets) so annoying that I will not speak of it.

So you have three keyboard layouts and a single keyboard. What do you do? Well, most people cope in the worst ways possible. For example, some of them just have two layouts: either English/Russian or English/Ukrainian. This makes a single hotkey to switch layouts bearable but limits your communication abilities. Then there are freaks (a majority of the population, actually), who use single hotkey to switch between three layouts (one after each other, so sometimes to get somewhere you click once and sometimes twice). Then there is a middle ground when you use a shortcut to switch to "previous", but if you hold it, it'll show you full choice.

Either way, it sucks: you have to know where you are right now (be it Latin or one of Cyrillic layouts) to get where you need. This makes layout juggling mentally taxing: you have to think about it all the time. So how do you solve that? Easy! With those hands (shake your hands in the air)!

Enter [Karabiner-Elements](https://pqrs.org/osx/karabiner/) - a powerful keyboard customizer. It makes you able to change any key to any other key. While this sounds boring, there is an exceptional feature: it can make a key behave like one when clicked and another when pressed and held. That is a game-changer! There is a lot of modifier keys for us to use!

So what I did is I mapped my left Command key to F16, right Command to F17 and right Option to F18. This doesn't sound as useful until you learn about [Hammerspoon](https://www.hammerspoon.org/), another exceptional software!

Hammerspoon is a tool to script macOS in Lua. It has an extensive library of functions and the one most needed by me is switching a keyboard layout. So I have this in my config:

```lua
hs.hotkey.bind({}, "F16", function()
    hs.keycodes.setLayout("U.S.")
end)

hs.hotkey.bind({}, "F17", function()
    hs.keycodes.setLayout("Russian - Normal")
end)

hs.hotkey.bind({}, "F18", function()
    hs.keycodes.setLayout("Ukrainian - Normal")
end)
```

How do you like that? When I press the left Command key, my keyboard switches to English no matter what state it was in. Even if it was in English. It took me a week to train my muscle memory and it's been years now since I thought about what layout is currently enabled.

Hammerspoon has also replaced my previous god of window layouts, SizeUp, I just configured shortcuts the same. And it triples its usefulness as an application launcher.

Almost forgot! Since I got escapeless Macbook Pro, I configured my fn key to work as an Escape key when clicked. And it's been so comfortable that I use that on my escapefull Macbook Air even though there is a real Escape key.

Here are my [Karabiner config](https://github.com/piranha/conf/blob/master/karabiner.json) and [Hammerspoon config](https://github.com/piranha/conf/blob/master/hammerspoon.lua).

P.S. Weirdly enough this post is not very useful for English speakers, so there is no real reason to write it in English. But this thought came to me only when I finished writing and I'm too lazy to rewrite it. :)

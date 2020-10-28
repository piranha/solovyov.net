title: Useful shell prompt
date: 2020-10-28
tags: shell
draft: true
----

There are only a few apps I use everyday and shell — ZSH — is one of the most used. It's been that way since beginning of 00's and back then I spent a lot of time configuring my prompt to be a good balance between compact/readable and useful. I found that I dislike fancy two-line prompts, information on a right hand side (because of it's awkward behavior), and stuff like that. So result looks like that:

```
piranha@rigel ~> █
```

where `█` is a cursor. It shows username, `@` to separate it from hostname - or `#` if this is uid 0 shell, then hostname, and an home-abbreviated path. One of the fancy things is that space before cursor is Unicode glyph `\u00A0` - non-breaking space - which is bound in ZLE to delete everything to a beginning of a line. Unfortunately, this does not work with Terminal.app, so it just sits there waiting for a better time. This setup along with colors had no changes for over a decade.

But a week ago a saw a [tweet](https://twitter.com/thingskatedid/status/1316081732467081217) with an idea to change prompt's prompt (the `>` thingie) to a red color when previous command exited with an error status. This motivated me to cleanup and update my prompt to a newer conventions. This is a result:

<img alt="prompt screenshot" src="/media/prompt.jpg" height="60px" width="127px">

You can see I removed my username since it really gives me no information, no reason to spend space on that. I also really like white background, but if you don't, changing colors is easy — I'll explain how everything works.

Let's break down it bit by bit. Prompt syntax is a little hard on eyes - in case if you have ideas how to write this so next time I won't have to dig deep into ZSH documentation, I'll be glad to listen.

```
p_at='%(!.%F{red}%B#%b%f.@)'
```

In this case two things are interesting. `%(x.if-true.if-false)` construct (documented [here][1]) shows either `@` if I'm a normal user or a red `#` if I'm a root. `!` means "True if the shell is running with privileges". You can clearly see `@` after the second dot, but what does `%F{red}%B#%b%f` mean? `%B` means "start bold", `%b` means "end bold". `%F`/`%f` duo is "start/stop color" - it can either accept old-style color numbers (where 1 is red) or color names, which is easier to understand.

```
p_host='%F{blue}%m%f'
p_path='%F{blue}%~%f'
```

Those are easy to understand, just refer to [documentation][2] - `%m` is a host name before first dot, `%~` is a path where `$HOME` is abbreviated to `~`.

```
p_pr='%(?.%F{blue}.%F{red})>%f'
```

This is a new part. `?` means "True if exit status of the last command was 0". So if a command exited nicely (with a status code 0), then it's going to be blue `>`, in other case it's going to be red `>`. Voila! :-)

End result looks like this:

```
p_at='%(!.%F{red}%B#%b%f.@)'
p_host='%F{blue}%m%f'
p_path='%F{blue}%~%f'
p_pr='%(?.%F{blue}.%F{red})>%f'

PS1="$p_at$p_host $p_path$p_pr "
unset p_at p_host p_path p_pr
```

You can see I'm unsetting color in every variable and unset those variables — cleaning up after yourself is a valuable habit, especially with shell. :-) 

I'm pretty sure the same could be done for bash (or tclsh, or whatever), but I'm not using it so... If anybody wants to contribute similar configuration for other shells, I'll gladly link to a post or add it here.

[1]: http://zsh.sourceforge.net/Doc/Release/Prompt-Expansion.html#Conditional-Substrings-in-Prompts
[2]: http://zsh.sourceforge.net/Doc/Release/Prompt-Expansion.html
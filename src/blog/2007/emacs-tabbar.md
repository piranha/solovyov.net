title: Emacs tabbar
date: 2007-07-11 09:29:30
tags: software, emacs
----


Какое-то время назад я писал про то, [как я переключаю буферы](http://piranha.org.ua/blog/2006/09/16/emacs/) в Emacs'е. Но в конце-концов меня задолбало отсутствие табов и я решил поставить и разобраться в таббаре (я его раньше ставил, но он раздражал своим внешним видом и странным поведением :)).

Самая неочевидная штука заключается в том, что брать его надо однозначно [из CVS](http://emhacks.cvs.sourceforge.net/*checkout*/emhacks/emhacks/tabbar.el), потому что файлик, который лежит в виде релиза на SF, просто-напросто на 3 года старше CVS'ового.

Ну а дальше всё оказалось просто - надо его кинуть в диру к остальным `*.el`, и немного поднастроить под себя. Немного - у нового поведение в разбрасывании табов по группам куда более адекватное, чем у старого - он их раскидывает по основному режиму, что при редактировании в основном Питоновских файлов удобно - не приходится лазить по остальным, ненужным, буферам.

Вот настройки:

    ;;;;;;;;;
    ;; Tabbar
    
    (require 'tabbar)
    
    (global-set-key [C-S-tab] 'tabbar-backward-tab)
    (global-set-key [C-tab] 'tabbar-forward-tab)
    
    (set-face-foreground 'tabbar-default "LightSteelBlue")
    (set-face-background 'tabbar-default "DarkSlateGray")
    (set-face-foreground 'tabbar-selected "pale green")
    (set-face-bold-p 'tabbar-selected t)
    (set-face-attribute 'tabbar-button nil :box '(:line-width 1 :color "gray72"))
    
    (setq tabbar-buffer-groups-function
          (lambda () 
            (list
             (cond
              ((find (aref (buffer-name (current-buffer)) 0) " *") "*")
              (t "All Buffers"))
             )))
    
    (tabbar-mode)
    ;; tabbar end
    ;;;;;;;;;;;;;

`tabbar-buffer-groups-function` - раскидывает все буферы по двум группам: все, начинающиеся с пробела или астериска - в *, остальные - в All buffers. За функцию спасибо [Хейзу](http://haizz.livejournal.com), потому что я сам не осилил написать. ;)

Ну а [тут](http://hg.piranha.org.ua/conf/file/tip/) лежит весь мой .emacs.

**UPD**. Функция группировки, конечно, порядочно усовершенствовалась со времени написания этого поста...

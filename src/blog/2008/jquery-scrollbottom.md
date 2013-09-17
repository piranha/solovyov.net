title: jQuery scrollBottom
date: 2008-10-31 13:18:15
tags: byteflow, jquery
----


Наконец-то я собрался и сделал, чтоб ссылки "комментировать"/"ответить" вели себя так, как я хотел этого с самого начала. :) Всё просто - при нажатии ссылки появляется форма, и нижняя граница браузера скроллится к нижней границе формы. 

А так как в принципе функция довольно удобная, а я тут ещё и случайно увидел, как расширяются объекты jQuery, то вот вам код для того, чтоб можно было сделать `$("#id").scrollBottom(1)` (1 - это время в миллисекундах, за которое должно произойти само событие):

<!--more-->

    jQuery.fn.extend({
        scrollBottom: function(speed) {
            return this.each(function() {
                var targetOffset = $(this).offset().top + $(this).height();
                $('html').animate({scrollTop: targetOffset - $(window).height()}, 
                                       speed);
                });
            }
        });

Сижу вот, думаю - может сделать scrollTop, scrollMiddle и запихать на сайт jQuery как плагин?..

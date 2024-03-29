title: Clojure Cup 2013
date: 2013-09-30
tags: life, programming, clojure
----

Недели три назад мне пришла в голову идея, что было бы прикольно поучаствовать в
Clojure Cup и написать что-то прикольное на кложуре (сорри, я буду называть еë
кложура, а не кложа, как делаю и в реальной жизни, потому что я так вижу ;)). Я
вообще никогда особенно не испытывал большого желания участвовать в подобных
соревнованиях (и не очень подобных, типа ICFPC) - мне всегда думалось, что если
я захочу что-то написать, я и так напишу, и мне не нужны для этого соревнования.

Но тут сложилось то, что мне никак (из-за лени, и приоритезации проектов
попроще/попрактичнее) не удавалось начать писать что-то хотя бы относительно
серьëзное на кложуре, плюс наличие цельной идеи, у которой чëтко были видны
рамки - [Risk'a][1]. Мы (чуть забегая вперëд) играли хотя бы несколько раз в
[Conquer Club][2], который вполне неплох в смысле коммьюнити, карт и разумности
правил, при этом у него абсолютно ужасный интерфейс, который не меняется
годами. Альтернативы тоже довольно паршивые, на флеше и сильверлайте,
бррр. Вообще, Риск казался мне довольно амбициозной целью, но разве мы не
шарящие чуваки, а?

[1]: http://en.wikipedia.org/wiki/Risk_(board_game)
[2]: http://conquerclub.com/

Мы - это я, [Сева][seva], [Сергей][serge] и [Рома][roma]. Рома немножко
посомневался, сможет ли он участвовать, и стоит ли, но в конце-концов таки
решился.

[seva]: http://twitter.com/Murkt
[serge]: http://twitter.com/mrjoez
[roma]: http://twitter.com/rofh

## До

Недели за полторы я начал попинывать чуваков на тему "учаснеги, вы всë уже
забыли, раздупляйтесь с кложурой", на что они вяло отвечали "да, надо бы...", и
я тоже не проявлял какой-то особенной активности (ну, хотя бы заставил всех
завести флоудок, гг). Они немного посидели над
[4clojure.com](http://4clojure.com), чего, конечно, было мало, и еще за неделю
до события мы втроëм (без Ромы) собрались у Севы и минимально обсудили планы и
разные подробности. Обсуждение вышло на мой вкус не очень продуктивным - по
крайней мере оно ничего не изменило в моей голове (впрочем, не скажу о головах
других, но всë же). Всем было несколько лень напрячься, представления о том, как
это всë будет, мне кажется, были довольно смутные.

К среде мы уже больше начали напрягаться, все заджойнились во Flowdock, который
нам дали на шару на 3 месяца, и вечером устроили еще одно обсуждение, уже более
продуктивное. В процессе обсуждения родилась наконец идея, как делать фронт-энд.

# Фронт-энд

Техническое отступление. Горячая тема последних месяцев в кложуре - это
core.async. [Дэвид][3] пилит [впечатляющие][4] [демки][5], все с ним носятся и
пишут туториалы и гайды, устраивают срывы покровов и вообще творят
вакханалию. Не могу сказать, что меня обошла эта вакханалия, но одно смущало:
чуваки предлагают кор.асинк для управления потоками данных, а к интерфейсу
приклеиваются по старинке, [селекторами][sel]. Это меня резко отвращает,
селекторы всегда всë делают противным. В то же время, есть концептуально
красивый [hoplon][6], с которым я ношусь последние полгода. Но с ним другая
проблема - он банально тормозит в файрфоксе. У фф (по словам Алана, одного из
авторов хоплона) есть определëнные траблы с оптимизацией рекурсии и вложенных
стеков, и вот результат. Короче, меня порядочно плющило и я никак не мог решить,
умный я или красивый.

[3]: http://twitter.com/swannodette
[4]: http://swannodette.github.io/2013/08/02/100000-dom-updates
[5]: http://swannodette.github.io/2013/08/02/100000-processes
[sel]: http://swannodette.github.io/2013/08/17/comparative/
[6]: http://github.com/tailrecursion/hoplon

И тут у нас родилась прекрасная идея! Надо взять [React][] - который, между
прочим, я выбрал для текущего проекта на работе, большей частью из-за
концептуальной близости к хоплону, чуть смещëнной в сторону прагматичности и
императивной привычности. Так вот, реакт, и сделать для него обëртку на
кложурскрипте, заодно заменив синтаксис определения DOM-дерева на синтаксис
темплейтов [Hiccup][].

[React]: http://facebook.github.io/react/
[Hiccup]: https://github.com/weavejester/hiccup

Если вы не в курсе, то идея Реакта в том, что он из метода `render` должен
вернуть "виртуальное" дерево DOM (из обычных жс-объектов), и потом специальный
механизм согласует реальный DOM с этим виртуальным. Работает это довольно быстро
(быстрее, чем Angular или Ember, как минимум) и, что главное -
декларативно. Главное уметь отрисовать состояние полностью, а заботиться о том,
как изменять DOM - не нужно. Минимальный компонент выглядит как-то так:

```js
var Comp = React.createClass({
    render: function() {
        return <div>Hello</div>;
    }
});
```

Мы выдумали вот такое:

```clj
(defr Comp []
    [:div "Hello])
```

Т.е. весь хтмл вместо какого-нибудь специального синтаксиса описывается
структурами данных на кложуре, которые можно тасовать и преобразовывать
стандартным образом. Как сгенерировать список элементов? `[:ul (map (fn [x]
[:li x]) ["a" "b" "c"])]`, и всë (если вам кажется, что выглядит страшно, вам
кажется - см. [твит Ромы][7]).

[7]: http://twitter.com/rofh/status/384733718213951488

Так вот, мы наконец решили, как всë надо делать, четверг был занят, а в пятницу
после обеда Сева сел разбираться и с реактом, и с кложурскриптом, и к тому
моменту, как я пришëл домой, уже имел парочку рабочих компонентов (как всегда -
не стоит недооценивать незнакомости языка и его окружения). Я приступил к работе
(копированию и переделыванию частей hiccup'a и crate'а под наши нужды), потом мы
всë это вместе как-то слили и пошли спать к 12 ночи с незаконченной либой.

# Суббота

Первые часа 3-4 субботы мы с Севой потратили на допиливание [pump][]'a до
рабочего состояния (куча всякой неочевидно фигни всплыла, чуть расслаблюсь и
буду сочинять письмо в рассылку реакта, хочется как-то плотнее интегрироваться),
а Сергей с Ромой на раздупление с экосистемой, эксперименты с архитектурой и
мокапы интерфейса.

[pump]: https://github.com/piranha/pump

К двум часам дня мы рестартовали репозиторий начисто и понеслась! Сергей занялся
бэкендом, я занялся архитектурой клиента, Рома занялся мордой и Сева занялся
картой. Распределились в этот момент мы реально очень удачно, потому что мы друг
другу не мешали и независимо по всем направлениям достигли успехов - сервер
чо-та там работал, принимал и слал, клиент показывал рожу, карта обретала
очертания и данные, и я таки заставил (часа полтора угробил!) работать
кроссоверы в cljsbuild - шаринг кода между клиентом и сервером кложуры (я потом
был нереально счастлив, что не бросил это дело на полпути).

В целом мы работали довольно усердно, но не на грани безумия, просто хорошо шли
и к концу нашего забега в пол-одиннадцатого по Киеву у нас были готовы
аутентификация через персону, отрисовывающаяся и довольно симпатичная карта,
базовая архитектура клиента вместе с какими-то рабочими уже хендлерами -
сообщения обновляли мир (мы остановились на 1 атоме со всем состоянием
приложения), простейший роутер (которого оказалось почти более, чем достаточно),
управление пользователями и состоянием игры (создание/джойн/етц) на сервере.

Вроде бы немного, но реально плана и архитектуры-то не было, поэтому для первого
дня довольно неплохо. Хотелось бы больше, но будем реалистичны - надо было лучше
готовиться для этого. :)

# Воскресенье

Поднялся как-то довольно рано, и пока все раздуплялись, проапгрейдил макро в
pump'e, чтоб компоненты стало писать еще проще, чем раньше, и забег начался
опять.

Я занялся запиливанием мелочей и красоты (типа граватара, редактирования
профиля, улучшениями мелкими внутренних вещей), Сева замутил нам лого (еее,
теперь мы совсем взрослые!), Серëга продолжал штамповать код
на сервере (списки игр, всякие там переходы состояний в игре), а Рома разбирался
с Персоной, которая не хотела ни держать юзера залогиненным, ни вылогинивать -
оказалось, что мы еë децл неправильно поняли.

![Logo](/media/warmagnet-index.png)

Энивей, к 3 часам дня у нас уже были лого, список игр, мы могли в игры заходить,
логин работал безупречно (кто мешал с персоной разобраться на неделе? )), карта
ресайзилась под экран и вообще всë начинало выглядеть так, как будто у нас есть
шанс успеть - я оптимист, но под конец субботы темп никак не выглядел таким, как
будто что-то выйдет.

И вот тут как-то всë понеслось - не проходило 10 минут без коммита, фиксы
мелких штук, улучшения, синхронизация апи сервера и клиента, новый формат карты
и его использование на сервере, улучшения интерфейса карты, завершение логики
сервера (исключая собственно саму игру).

К 10 вечера уже был весь интерфейс, который мы хотели сделать, исключая
собственно игру, логику которой начал делать Сергей - заполнение карты юнитами,
распределение провинций по людям, атаку и передвижение войск после неë. Я тоже
немножечко помог с этим - сделал логику получения солдат в начале хода, которая
может задеплоить 7.666667 солдат. ;))

Где-то около 12 я практически перестал писать код (за три часа - коммит про
определение цвета игрока и фикс моего кода про деплой солдат), и начал по
очереди тусить с чуваками, помогая фиксить неочевидные баги. Мне кажется, это
было чрезвычайно разумное решение - так прогресс двигался быстрее: во-первых,
мне не приходилось конкретно писать код, что освобождало некоторые ресурсы
мозга, во-вторых, даже мой ограниченный опыт (она не является у меня основным
языком) с кложурой явно давал фору по поводу понимания ошибок/проблем (особенно
на стороне клиента), и так я умудрялся помогать фиксить заметно больше багов,
чем фиксил бы сам - плюс нельзя недооценивать то, что из-за этого общения с
каждым по очереди я понимал, как работают разные части приложения и мог
объяснять это чувакам, которые с ними интегрировались, пока другие писали код
дальше.

Примерно же в это время мы словили дикий баг с тем, что `(js->clj data
:keywordize-keys true)` преобразовывает в кейворды не только то, что было
кейвордами, а вообще абсолютно всë, и наш `{:player-state {1 ...}}`, где 1 - это
ид пользователя, становился `{:player-state {:1 ...}}`! Мы это очень долго
ловили и фиксили в двух местах, а потом оказалось, что `(keyword 1)` и `(keyword
"1")` возвращают разные вещи, и у меня вообще в голове очень смутно помнится,
как мы это обнаружили (и я до сих пор прозреваю, что таки обнаружили)! NB: Нужно
зарепортить баг.

А потом оказалось, что такое место не одно, и я допилил в протокол общения с
сервером функцию, которая преобразовывала все кривые места обратно, иначе общая
с сервером логика разваливалась. :( Мы потратили в сумме на это по моим
прикидкам час-полтора критического (близкого к релизу) времени двух человек! Это
один из самых неприятных моментов. Я в самом начале думал использовать
[cljson][], но у него довольно смешной формат реализации и мы решили, что
обычного жсона достаточно. Зря, конечно.

[cljson]: https://github.com/tailrecursion/cljson

К 3 часам у нас была карта, можно было из интерфейса задеплоить войска,
атаковать и закончить атаку. Где-то в 2:50 я задеплоил джарник и оказалось, что
на сервере карта не показывается! В 2:54 виден коммит, когда я попытался
пофиксить проблему - и он почти бы заработал, потому что там я написал:

```clj
(def map-data (ClassLoader/getSystemResource "resources/static/map-classic.json"))
```

Всего-то не надо было писать строку `resources/`, и всë бы работало! Очень
неприятно, особенно учитывая что за 6 минут я таки мог бы догадаться и
починить... Но незнание JVM и общая усталось (3 часа ночи, я обычно уже часа
3 как сплю!)... Щит, неприятно. Я еще пытался метаться, что
[заметил и Никита][tonsky] (там есть скрин [моего твита][15mins] в посте), но
уже всë. Закруглились и поехали по домам.

[tonsky]: http://tonsky.livejournal.com/281695.html
[15mins]: https://twitter.com/asolovyov/status/384466703885008896

## Ощущения

То, что не подготовились хоть сколько-нибудь - очень плохо. У нас, мне кажется,
были серьëзные шансы - и довольно серьëзная идея, и отличный логотип, и название
относительно цепляющее (хотя при чëм тут магниты, не понимаю - хотя это я
придумал название), и реализация всего довольно симпатичная (см картинку
ниже). Но блин, фейл, и если бы подготовились - у нас бы было еще где-то часа
3-4 у каждого.

![Logo](/media/warmagnet-map.jpg)

Очень зол на сериализацию. Очень. Надо переходить на нормальную, которая не
теряет типы данных.

С базой данных не пришлось возиться вообще! В основном ей был занят Сергей, но и
PostgreSQL, и [nomad][] работали молча и ни разу не попросили кушать - хотя
дропали мы базу и создавали заново регулярно. К [korma](http://sqlkorma.com) зато нарекания есть -
она слишком простая (не simple, а simplistic), нужно будет попробовать
[ClojureQL](http://clojureql.org/) или
[clojure-sql](https://bitbucket.org/czan/clojure-sql).

[nomad]: https://github.com/piranha/nomad

ClojureScript разрывает! Код очень плотный (поначалу меня это напрягало,
кстати - раза в три плотнее жс/кофескрипта), вместе с paredit'ом редактировать
его удобно (структурное редактирование ftw), и даже чуваки, которые поначалу не
были особенно счастливы от синтаксиса, к концу, мне кажется, прониклись
серьëзнее. Очень хороший стандартный набор функции, клëвые структуры данных и
вообще всë супер. Нужно только серьëзно озаботиться вопросом прямой интеграции с
платформой, особенно с джаваскриптом - он своими мудацкими свойствами иногда
подкидывал серьëзные приколы.

React - очень, очень хорош. Он быстрый, поверх него нам удалось построить очень
простой синтаксис и разработка происходила в ситуации, когда с фреймворком не
нужно бороться вообще, просто кайф. Все эти [угловые](https://angularjs.org) и
[тлеющие](https://emberjs.com) не идут ни в какое сравнение. Надо только связаться с
разработчиками и найти возможность вхукнуться внутрь, чтоб плотнее
интегрировать кложурскрипт с реактом.

Разрабатывать в редакторе, который может отправлять изменения сразу в запущенный
процесс - очень удобно. Можно быстро зафиксить мелкую функцию и не перезапускать
весь сервер, можно увидеть состояние и понять, что происходит, без расставления
принтов. На клиенте этого очень не хватало и я собираюсь себе всë настроить. На
сервере, кстати, мне лично не хватало пошагового дебаггера типа pdb - в хроме
дебагать всë-таки можно, если умеешь читать снегерированный джаваскрипт (мне
кажется, что я уже и писать его умею).

Mozilla Persona рулит. Буду юзать только еë, когда возможно, значительно меньше
гемора с логином.

Flowdock - очень удобная штука. Их разделение на два экрана, когда в одном чат,
а в другом всякие нотификации - отлично работает. Чат можно редактировать, на
важные сообщения можно вешать теги и потом по ним искать, можно отдельно
посмотреть список присланных ссылок, загруженных файлов. И нотификации -
отлично, ничего не пропускаешь, куча интеграций со всякими сервисами. Когда тебя
упоминают, выскакивают десктопные нотификации, а если ты не онлайн - шлëтся всë
на почту. Мне очень понравился.

Всë было очень прикольно, хотя часто я повторять такое не хочу, таки
тяжеловато. Но количество эндорфинов безумное, конечно, мы написали не просто
много кода (1454 строки в warmagnet и 187 в pump'e), а много толкового кода,
который работает, а не просто существует.

## Zee &

Мы планируем зафиксить остаток багов, привести логику игры в порядок и сделать
полноценный Риск! Сейчас запрещена любая публикация приложения до пятницы, к
сожалению - но мне будет очень приятно, если вы за нас
[проголосуете][vote]. Cheers! :-)

UPD: [War Magnet](https://github.com/wunderwaffle/warmagnet) теперь на гитхабе с
открытым кодом.

[vote]: http://clojurecup.com/app.html?app=warmagnet

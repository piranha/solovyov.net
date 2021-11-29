date: 2021-11-22 11:23:50
tgid: 95
----

Трійко рочків тому всередині сайта Касти ми зробили цікаву (для мене) річ — закешували результати збирання товару по всій базі у тій самій базі. 

Тобто ідея така: товар розкладений по десятку таблиць, типу там стоки, ціни, інформація про постачальника і таке інше. Зібрати його і потім ще дообробити — це займає доволі багато часу і ще й навантажує базу своїми джойнами. А так ти результати поклав у базу, і фактично по ключу дістаєш вже готові дані. Тільки не забувай оновляти дані!

Але це теж вирішена проблема, за декілька місяців до того переробили оновлення даних у еластіку і вони туди попадають через єдине місце. А там де товар оновлюється, шлються нотифікашки для цього сервісу через кафку. Через те, що для еластіка теж потрібні всі дані про товар, це місце ідеально підходить для того, щоб оновляти той «постійний кеш». 

І все було супер, але з часом етап після доставання з дб-кешу (за нестачею гарного терміну) теж почав розростатися, типу всякі більш динамічні штуки важко закешувати надовго. Скажімо, шаблони написання імені товару — рендерінг строки, кльово б закешувати, але чекати день до того, як товари оновляться - наче дуже довго. 

Так ми жили аж до минулого тижня, коли вже вкінець задовбало, що в цього апі 99 процентиль - 300 мс під навантаженням. А тепер ми прожили перший день тижня чорної п‘ятниці з 99 процентилем у 130 мс! Непогано, га?

Що ми видумали: вираховувати ці «динамічні» властивості перед дб-кешем плюс брати хеш від *конфігу* для їх вираховування. А у той момент, коли відбувається виклик апі, порівнювати хеши від конфігів і за необхідності відправляти запит на перекешування товару. І таким чином перенесли важкі операції у асинхронну площину. 

> *Конфіг* у цьому випадку — це типу залежність для прорахунку. Скажімо, хочеш відрендерити ім'я товару — то треба шаблон, значить від нього і будемо хеш рахувати.

А ще, поки з тим колупалися, помітили купу вже нерелевантної роботи — вона мала вигляд наче дуже корисна, та тільки клієнти (у сенсі веб/аппки) нею вже не користувалися. Вирубання цього дало навіть кращі результати, ніж той двуступеневий кеш. :)) Ну як завжди, ггг.

Цікава річ, що запит на перекешування ми поки вимкнули, бо воно генерує ті запити значно швидше, ніж виходить перекешувати товар. :) Треба придумати якийсь дебаунсер відправки з урахуванням того, що апп-серверів багато... хз, може час ключі для топіків кафки заюзати. :)

P.S. А ще ми у п‘ятницю півтори години паршиво працювали, але це еластік винуватий — товари себе відчували мов живі. І це зовсім інша історія. :)
date: 2021-05-12 14:40:00
tgid: 50
----

У далекому 2009 в мене був цілий місяць (грудень) між роботами, і я його тоді провів дуже продуктивно — наприклад, написав клієнтську бібліотеку до Редіса (на пайтоні), основну фічу якої автор redis-py потім перетягнув до себе, бо там була нереальна економія на кількості коду. А ще круто роздуплився з метапрограмуванням у пайтоні, що дуже допомогло написати ядро системи на наступній роботі, а потім нереально допомогло вичистити код від метапрограмування на пайтоні на той що була наступна за наступною. 😁

А ще написав малесенький пастбін — [paste.in.ua](https://paste.in.ua), тому що мій звичайний через раз бував у даунтаймі, а юзав я його багато. І вже давно всі результати того місяця залишили після себе тільки досвід, а PIU досі живий, і я минулого року його навіть на [Кложу та ГраальВМ](https://solovyov.net/blog/2020/clojure-graalvm-polyglotvm-paste-in-ua/)
 переписав.

І у процесі переписування думав перевести сховище на SQLite, щоб простіше було то все менеджити, але виявилося, що драйвер склайту для джави [не компілюється у статичний бінарь під лінуксом](https://github.com/xerial/sqlite-jdbc/issues/584#issuecomment-783795172)
 (на відміну від мака та вінди), тож дзуськи. На жаль, я не спеціаліст у війнах з gcc та C++, і проблема досі не вирішена, тож я залишив той формат зберігання, що там є, у файлах. А там... неортодоксальна серіалізація. :) 

Зед Шо мені нашепотів заюзати для енкодінгу [tnetstrings](https://tnetstrings.info/)
, формат, прикольний своєю простотою. 😂 Але коли я переписував все на кложу, я знайшов лібу, яку написав американець (це важливо). І через не дуже приємний код я ту лібу переписав трішечки симпатичніше, але! не дуже замислюючись. 

Чому американець і моя тупня важливі? Тому що стандарт каже: довжина у **байтах**. А джава оперує строками, а не байтами, і в мене вийшла ліба, яка зберігає (і читає!) довжину у символах UTF-8. 😵 Вчора вночі прилетіла нотіфікашка "здох твій піу", і виявилося, що хтось там питав один і той самий урл з помилкою доволі часто, і Грааль закрешився, бо не вистачило пам'яті.

А помилка була у тому, що це була стара паста, ще пітонівська, з кирилицею. Через невідповідність у логіці воно намагалося взяти символів більше, ніж було у рядку, і помирало. Я якось заліпив це, а сьогодні, як була хвилька між зустрічами, пішов трішки краще пофіксив це. Пофіксив у сенсі тепер все перетворюється на довжину у символах, але пофіг.

Найгарнішим фіксом було б то все викинути і переїхати в SQLite, хто б оце сумісність з граалем йому полікував, але добре, що хоч якось є. Я ще й паралельно — дякуючи флексбоксу — пофіксив лейаут, щоб його не джаваскрипт розтягував на увесь екран, і щоб на мобілах нормально виглядало, то якось приємніше стало жити. 😊

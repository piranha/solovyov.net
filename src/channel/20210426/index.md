date: 2021-04-26 16:03:52
tgid: 42
----

Кеш — це спосіб уникнути <s>штрафів</s> повторення виконання один і тих самих операцій. Найпростіше, що можна собі уявити — це функція `memoize`, яка допоможе порахувати числа Фібоначчі швидко без того, щоб думати над алгоритмом. :) 

У веб-сервісах є багато шарів, де можна закешувати результат. Перше, що приходить до голови — це кешування запитів до БД. Зазвичай че запит у інший процесс (власне, процес БД), або навіть через мережу у іншого сервера. Тож ми берему якусь кльову бібліотеку (або пишемо самі), якій кажемо: кешуй виклик оцієї функції в залежності від цих аргументів. І параметри до нашого запиту починають параметризувати і кеш. Це буває дуже ефективне місце, навіть якщо кешуємо результати ми у `memcached`, до якого теж ходимо по мережі. Особливо це ефективно, коли запит складний, а варіативність параметрів низька. У найбільш яскравих випадках взагалі є сенс підраховувати результати заздалегідь і класти їх в базу, отримуючи, так би мовити, нескінченне кешування.

Наступний шар — це рендерінг шаблонів. Йдуть роки, а генерація строк залишається однією з найбільш ємних частин веба. Навіть якщо цей шаблон — це JSON, і (на відміну від більшості ліб шаблонів) генерація написана на C, це займає доволі багато ресурсів. Тож ми можемо закешувати його. Тут треба дуже уважно слідкувати за варіативністю параметрів: якщо у результати попадає ім'я користувача, ми ризикуємо генерувати кеш для кожного користувача окремо і тоді ефективність такого кешування впаде до плінтуса. При цьому при розробці (та тестуванні) все буде виглядати нормально, тому що користувач-то один буде. Це те саме місце, де можна відчути, що кеш — одна з наскладніших проблем у програмуванні.

І з важливого є ще один шар, власне HTTP. У протокол HTTP вбудований механізм кешування, який імплементовано і в браузерах, і в різних балансувальниках нагрузки, як от в nginx чи у Cloudflare. Він нам дуже цікавий, тому що дозволяє навіть з доволі повільним бекендом (на Django чи то на Rails) мати сайт, який відносно нормально витримує навантаження. У будь-якій HTTP відповіді можна додати хедер `Cache-Control: max-age=3600` (припустимо), і браузер, який отримав цю відповідь, ще годину не буде повторювати цей запит. Ще цікавіше: якщо перед нашим сервером сидить якийсь проксі, то він теж закешує ту відповідь і жоден запит з будь-яких браузерів з тим самим урлом вже не прилетить до бекенду.

Ми цим кешуванням дуже широко користуємося у Касті. Як API, так і усі публічні сторінки рендеряться так, наче їх дивиться анонім, а потім фронтенд біжить і довантажує кастомні елементи (насправді, у більшості випадків — хедер, де є ім'я користувача). 

Правильно побудоване кешування — дуже ефективна штука, тому що найшвидший код — це той, який не потрібно виконувати.
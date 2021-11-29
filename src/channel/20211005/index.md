date: 2021-10-05 08:14:14
tgid: 78
----

Фейсбук знач вчора відпочивав, чули таке? І тіки він вимкнувся, з різних сторон почали лізти дуже конспірологічні теорії про хакерів, правительство США та криптовалюту від фейсбуку, і інший подібний бруд. Цікаво, зо я в цілому не так багато торкаюся цієї частини інтернету і воно лізло з дуже неочікуваних місць. 

Але насправді це була помилка у конфигурації. CTO Cloudflare вже написав [статтю](https://blog.cloudflare.com/october-2021-facebook-outage/)
 про те, як це виглядало ззовні: фейсбук просто перестав себе рекламувати по [BGP](https://uk.wikipedia.org/wiki/BGP)
. Тобто перестав всім іншим розповідати, як добратися до його мережі з іншого інтернету. Ну реально просто як вимкнув телефон і приліг спати. :)

В одному треді на реддіті якийсь чувак заявив, що він приймає участь в операції відновлення і дві великі проблеми полягають у тому, що:

- через пандемію в датацентрах менше людей, ніж було раніше - я так розумію, що більшою частиною «залізячники», а інші віддалено
- люди, які знають, що зробити, які вміють це робити і які мають фізічний доступ, щоб зробити - це три різні групи людей
- всі внутрішні коммунікації - через сам фейсбук, який не працює, тож складно скоординувати зусилля

Загалом воно лежало близько 4,5 годин і почало піднімати голову після 12 ночі за Києвом. Непогане нагадування про те, що інтернет одночасно і дуже складний, і працює завдяки тому, що всі ведуть себе корректно. Такі самі відчуття, як з дорожнім рухом. :)

Дуже хочеться почитати постмортем від самого фейсбука! Тож чекаємо на нього. :)
class: center

# Интернационализация в браузере

.meta[Alexander Solovyov]

---

# i18n - решëнная проблема

## GNU gettext

- `_('translate me')`
- `_('%n bottle', '%n bottles', NUM) % NUM`

---

# Но в джаваскрипте еë решают странно

- Объект `{login_success: {ru: 'Ура', en: 'Hurray'}}`
- Имплементация gettext на 1000 строк
  - Их 3, поддерживается 1, инфраструктуры нет

---

# puttext

- `__('translate me')`
- `__('1 bottle', '{n} bottles', NUM, {n: NUM})`
- 100 строк (1713 байт минифицированный)

---

# Инфраструктура (в комплекте)

- xgettext.js - поиск строк для перевода в JS
- i18n-collect.sh - заодно и мерж со старыми
- mo2json.py - нет смысла парсить бинарные данные в браузере

---

# Урл!

## github.com/socialabs/puttext

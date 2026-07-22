# Daigo Cordova — актуализация API

Версия приложения: **1.3.1** (`android-versionCode=131`).
Основной backend: **https://api.daigo.ru**.

## Исправленные контракты

### Авторизация

- `POST /v1/auth/send-code` — первая отправка SMS, body `{ phone_number }`.
- `POST /v1/auth/send-fc` — повторная отправка через flash-call, body `{ phone_number }`.
- `POST /v1/auth/verify-code` — `{ phone_number, code, project_name: "daigo_web" }`.
- `POST /v1/auth/refresh` — `{ refresh_token }`.
- Сохраняются `access_token`, `refresh_token`, `daigo_id`; профиль загружается через `GET /v1/auth/user/{daigo_id}`.

Успешный HTTP-ответ `send-code` больше не сравнивается с одной жёстко заданной строкой `message`. Поэтому приложение не показывает ложную ошибку, когда SMS реально отправлено.

### Каталог

- `GET /v1/shop/products?page=1&page_size=100` с последовательной загрузкой страниц.
- Поддерживаются ответы-массивы и обёртки `products`, `items`, `data`, `result`, `payload`.
- `GET /v1/shop/products/{slug}/card` используется для актуальной цены карточки.
- Все коллекции проверяются через `Array.isArray`, поэтому ошибка `products is not iterable` устранена.

### Акции

- `GET /v1/shop/promotion?session_id={uuid}` для гостя.
- `GET /v1/shop/promotion?daigo_id={id}` для авторизованного.
- Без одного из этих параметров backend отвечает `400`, поэтому identity теперь добавляется всегда.
- Отмена: `DELETE /v1/shop/promotion/cancel?...`, body `{ promo_id }`.

### Корзина

- Пользователь: `/v1/shop/cart/{daigo_id}`.
- Гость: `/v1/shop/guest-cart/{session_id}`.
- Добавление, изменение количества, удаление, очистка, купоны, `2+1`, миграция гостевой корзины — через серверные endpoint-ы актуального сайта.
- Итог, скидка, купон и подарки берутся из ответа backend, а не рассчитываются устаревшей локальной логикой.

### Заказ и профиль

- Профиль: `GET/PATCH /v1/auth/user/{daigo_id}`.
- Адрес: `POST /v1/auth/user/{daigo_id}/addresses`.
- Заказ: `POST /v1/shop/order`.
- Способы оплаты: `tpay_qr` и `tpay_card` (также сохранены исторические варианты интерфейса).

## Проверка перед сборкой

```powershell
npm install
npm run verify:api
npm run build
cordova prepare android
cordova build android --debug
```

После установки старые токены и кэш лучше удалить:

```powershell
adb shell pm clear ru.daigo.appmobile
adb install -r platforms\android\app\build\outputs\apk\debug\app-debug.apk
```

В `chrome://inspect/#devices` в Console должны быть строки:

```text
[API →] GET https://api.daigo.ru/v1/shop/products
[API ←] 200 GET https://api.daigo.ru/v1/shop/products
[catalog] Загружено товаров: N
```

Запрос акций должен содержать `session_id` либо `daigo_id`:

```text
[API →] GET https://api.daigo.ru/v1/shop/promotion
```

В раскрытом объекте `params` должно быть одно из полей:

```text
{ session_id: "..." }
{ daigo_id: "..." }
```

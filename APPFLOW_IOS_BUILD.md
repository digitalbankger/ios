# Сборка iOS в Ionic Appflow

Проект является **Cordova**, а не Capacitor. Он подготовлен для облачной сборки iOS в Ionic Appflow без локального Mac.

## Что уже подготовлено

- `ionic.config.json` с Cordova integration;
- `cordova-ios@8.1.1` и Cordova CLI 13;
- iOS platform добавлена в `package.json`;
- `platforms/` и `plugins/` не должны храниться в Git;
- иконка 1024×1024 без alpha;
- launch screen;
- описания геолокации, камеры и медиатеки;
- universal/deep-link scheme `daigoapp`;
- открытие платежных ссылок через системный браузер;
- iOS build number `2`;
- API остаётся `https://api.daigo.ru`.

## Перед загрузкой в Appflow

1. Проверь Bundle ID в App Store Connect. Сейчас в `config.xml` указан:
   `ru.daigo.appmobile`
   Он должен совпадать с существующим приложением Apple. Если у старой iOS-версии другой Bundle ID, замени `widget id` или используй Native Config в Appflow.
2. Если в Appflow уже есть приложение DAIGO, подключи этот Git-репозиторий к нему.
3. Если `ionic.config.json` старого репозитория содержал поле `id`, добавь туда прежний Appflow App ID.
4. Push-уведомления в этом архиве не включены для iOS: отсутствует `GoogleService-Info.plist` и APNs-конфигурация. Само приложение собирается без push. Для push потребуется отдельная настройка Firebase/APNs.

## Локальная проверка на Windows

```powershell
npm ci
npm run build:checked
```

## Сборка в Appflow

1. Commit/push проекта в подключённый Git-репозиторий.
2. Appflow → Builds → New Build.
3. Commit: последний.
4. Platform: `iOS`.
5. Build type: `App Store`.
6. Build stack: `Latest` с Node 20+ и актуальным Xcode.
7. Signing certificate: существующий Production certificate + App Store provisioning profile.
8. Запустить Build.
9. После успешной сборки: Deploy → существующий Apple App Store destination → TestFlight.

Appflow сам выполнит `npm install`, `npm run appflow:build`, `cordova platform add ios` и `cordova build ios`. Папку `platforms/` коммитить нельзя.

## Версии

- App version: `1.3.1`
- iOS build number: `2`
- Bundle ID: `ru.daigo.appmobile`
- Cordova iOS: `8.1.1`
- Minimum iOS: `13.0`

Для следующей загрузки увеличивай `ios-CFBundleVersion` на 1: `3`, `4`, `5` и т. д.

# Appflow production environment
# VITE_API_BASE_URL=https://api.daigo.ru
# VITE_API_DEBUG=false

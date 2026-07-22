# Изменения для iOS/Appflow

1. Проект зафиксирован как Apache Cordova (`ionic.config.json`, integration `cordova`).
2. Добавлены Cordova CLI 13 и `cordova-ios@8.1.1`.
3. Удалены сгенерированные `platforms/`, `plugins/`, старый вложенный `cordova-app/` и Android signing-файлы.
4. Добавлена iOS-платформа в `package.json` и `config.xml`.
5. `ios-CFBundleVersion` увеличен до `2`.
6. Добавлены iOS icon 1024×1024 без alpha и launch screen.
7. Добавлены системные тексты разрешений для геолокации, камеры и медиатеки.
8. Добавлены настройки status bar, safe area и `viewport-fit=cover`.
9. Платёжные/внешние ссылки открываются через системный браузер на устройстве.
10. Регистрация push-токена теперь определяет платформу динамически (`iOS`/`Android`).
11. API и контракты не менялись: основной адрес — `https://api.daigo.ru`.
12. Push для iOS пока не подключён: в исходном архиве нет `GoogleService-Info.plist` и APNs-конфигурации.

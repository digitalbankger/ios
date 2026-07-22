# DAIGO Mobile

Мобильное приложение DAIGO на Vue 3 + Vite + Apache Cordova.

- Android: Cordova Android 14.0.1
- iOS: Cordova iOS 8.1.1
- Облачная iOS-сборка: Ionic Appflow
- API: `https://api.daigo.ru`

Инструкция по TestFlight: [APPFLOW_IOS_BUILD.md](APPFLOW_IOS_BUILD.md).

## Web-сборка

```bash
npm install
npm run build:checked
```

Каталоги `platforms/` и `plugins/` создаются Cordova/Appflow и не хранятся в Git.

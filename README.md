# Календарь звонков


[![hexlet-check](https://github.com/i-samsonov/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/i-samsonov/ai-for-developers-project-386/actions)

Разработайте совместно с ИИ сервис для бронирования календаря

Учебный проект Хекслета: https://ru.hexlet.io/programs/ai-for-developers
Как это должно работать: https://files.hexlet.app/a/2ipc5m

## Стек

- React, TypeScript, Vite
- Tailwind CSS, shadcn/ui
- Fastify (API), Vitest (тесты), Oxlint (линтер)

## API-контракт

Рукописный источник контракта — `api/main.tsp`. Выполните `npm run generate:api`, чтобы обновить OpenAPI (`generated/@typespec/openapi3/openapi.json`), типизированный клиент (`src/generated/sdk/`) и серверные типы, JSON-схемы валидации и регистрацию маршрутов (`server/generated/`). Эти артефакты не редактируются вручную. `npm run check:generated` проверяет повторяемость генерации и выполняется в CI после lint → test → build.

Серверные маршруты подключаются через `registerCalendarRoutes(app, handlers)`; генератор никогда не перезаписывает бизнес-логику. Все шесть операций доступны. Админский API не защищён авторизацией: приложение предназначено только для локального учебного использования, не размещайте его публично с реальными персональными данными.

## Установка

Нужен Node.js 22.12+ и npm. По умолчанию API хранит данные в `calendar.sqlite` (SQLite, файл исключён из Git); путь можно изменить через `DATABASE_PATH`.

```bash
git clone https://github.com/i-samsonov/ai-for-developers-project-386.git
cd ai-for-developers-project-386
npm install
```

## Использование

Запустите фронтенд и API в двух терминалах:

```bash
npm run dev
npm run dev:api
```

Откройте адрес, который выведет Vite (обычно http://localhost:5173). Vite проксирует `/api` к http://127.0.0.1:3000; если API запущен с другим `PORT`, задайте тот же `PORT` при старте Vite. Vite обновляет страницу при изменениях кода, а `tsx watch` перезапускает API. Остановить серверы можно сочетанием Ctrl+C.

Проверки и просмотр собранной версии локально:

```bash
npm run lint
npm test
npm run build
npm run preview
```

`npm run preview` поднимает локальный сервер для фронтенда из `dist/`. При размещении проекта эти файлы может отдавать статический веб-сервер. API собирается в `dist-server/` и запускается через `npm run start:api`; для него нужен работающий Node.js-сервер.

Проверки запускаются также в GitHub Actions (`.github/workflows/ci.yml`). Файл `.github/workflows/hexlet-check.yml` отвечает за отдельные проверки Хекслета.

## Релизы

Используйте [Conventional Commits](https://www.conventionalcommits.org/): `feat: ...`, `fix: ...`, `chore: ...`; для несовместимых изменений — `feat!: ...`. Workflow `.github/workflows/release-please.yml` на ветке `main` поддерживает release-PR, changelog и версии. В настройках репозитория GitHub включите **Settings → Actions → General → Allow GitHub Actions to create and approve pull requests**. Для запуска CI на автоматически созданных release-PR добавьте секрет `RELEASE_PLEASE_TOKEN` (fine-grained PAT с доступом к Contents и Pull requests); без него action использует `GITHUB_TOKEN`, но созданные им PR сами не запустят другие workflow.

Новые компоненты shadcn/ui можно добавлять через `npx shadcn@latest add <имя>`; CLI не установлен как зависимость приложения.

---

<details>
<summary>Автоматические тесты Хекслета</summary>

Тесты запускаются на каждый коммит. За запуск отвечает файл `.github/workflows/hexlet-check.yml` — не удаляйте и не переименовывайте ни его, ни репозиторий.

</details>

## О Хекслете

[Хекслет](https://ru.hexlet.io/) — школа программирования: авторские программы обучения с практикой, поддержкой наставников и реальными проектами, которые остаются в резюме. Этот репозиторий — один из таких проектов.

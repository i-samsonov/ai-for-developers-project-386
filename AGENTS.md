# Правила проекта

- Фронтенд: `src/` — React, TypeScript, Vite, Tailwind CSS и компоненты shadcn/ui в `src/components/ui/`.
- API: `server/` — Fastify; точка входа `server/index.ts`, маршруты регистрируются в `server/app.ts`.
- Проверки перед коммитом: `npm run lint`, `npm test`, `npm run build`. В CI зависимости устанавливаются через `npm ci`.
- Коммиты оформляйте по Conventional Commits: `feat:`, `fix:`, `chore:` и т. д.; несовместимые изменения помечайте `!` после типа. Это необходимо для release-please.
- Не изменяйте `.github/workflows/hexlet-check.yml` — это проверка Хекслета.

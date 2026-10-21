import { ArrowRight, CalendarClock } from 'lucide-react'

function App() {
  return (
    <div className="landing-page min-h-screen text-slate-950">
      <header className="border-b border-slate-200/90 bg-slate-50/90">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4 sm:px-8">
          <div className="flex items-center gap-2 font-semibold">
            <CalendarClock aria-hidden="true" className="size-5 text-orange-500" />
            <span>Календарь звонков</span>
          </div>
          <nav aria-label="Основная навигация" className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <button type="button" disabled className="cursor-not-allowed">Записаться</button>
              <span className="text-xs text-slate-500">Скоро</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <button type="button" disabled className="cursor-not-allowed">Предстоящие события</button>
              <span className="text-xs text-slate-500">Скоро</span>
            </span>
          </nav>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-6 pb-24 pt-14 sm:px-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase text-slate-600">
            Быстрая запись на звонок
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">Календарь звонков</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            Один экран, понятные слоты, быстрая запись. Здесь можно будет выбрать время
            и записаться на звонок без лишних шагов.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled
              className="inline-flex min-h-12 cursor-not-allowed items-center gap-3 rounded-xl bg-orange-500 px-6 font-semibold text-white"
            >
              Записаться <ArrowRight aria-hidden="true" className="size-4" />
            </button>
            <span className="text-sm text-slate-600">Скоро</span>
          </div>
        </div>

        <section
          aria-labelledby="how-it-works"
          className="min-h-[250px] self-start rounded-2xl border border-slate-200 bg-white/85 p-6 shadow-sm sm:p-7"
        >
          <h2 id="how-it-works" className="text-xl font-bold">Как будет работать запись</h2>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-slate-600">
            <li>• 30-минутные слоты с 09:00 до 18:00 (последний — 17:30–18:00).</li>
            <li>• Проверка конфликтов при записи.</li>
            <li>• Просмотр предстоящих событий в отдельном разделе.</li>
          </ul>
        </section>
      </main>
    </div>
  )
}

export default App

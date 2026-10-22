import { useEffect, useState, type FormEvent } from 'react'
import { ArrowRight, CalendarClock } from 'lucide-react'
import { calendarApiCreateBooking, calendarApiCreateEventType, calendarApiGetBookingSettings, calendarApiListEventTypes, calendarApiListSlots, calendarApiListUpcomingBookings } from './generated/sdk/sdk.gen'
import type { BookingSettings, EventType, Slot, UpcomingBooking } from './generated/sdk/types.gen'

const time = (value: string) => new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
const dateTime = (value: string) => new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
const dateAt = (date: string, days: number) => new Date(Date.parse(`${date}T12:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10)
const reasonText: Record<string, string> = { past: 'Время прошло', booked: 'Занято', does_not_fit: 'Не помещается до закрытия' }
type Page = 'home' | 'booking' | 'upcoming'
const currentPage = (): Page => {
  if (typeof window === 'undefined') return 'home'
  if (window.location.hash === '#/booking') return 'booking'
  if (window.location.hash === '#/upcoming') return 'upcoming'
  return 'home'
}

function App() {
  const [page, setPage] = useState<Page>(currentPage)
  const [settings, setSettings] = useState<BookingSettings>()
  const [types, setTypes] = useState<EventType[]>([])
  const [selected, setSelected] = useState<EventType>()
  const [date, setDate] = useState(today)
  const [slots, setSlots] = useState<Slot[]>([])
  const [slot, setSlot] = useState<Slot>()
  const [confirmed, setConfirmed] = useState(false)
  const [upcoming, setUpcoming] = useState<UpcomingBooking[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const loadTypes = async () => {
    const result = await calendarApiListEventTypes()
    if (result.data) setTypes(result.data)
    else setError('Не удалось загрузить типы событий. Проверьте, что API запущен.')
  }
  useEffect(() => {
    const updatePage = () => { setPage(currentPage()); setError('') }
    window.addEventListener('hashchange', updatePage)
    return () => window.removeEventListener('hashchange', updatePage)
  }, [])
  useEffect(() => {
    if (page === 'upcoming') {
      void calendarApiListUpcomingBookings().then((result) => {
        if (result.data) setUpcoming(result.data)
        else setError('Не удалось загрузить встречи.')
      })
    }
    if (page !== 'home') {
      void calendarApiListEventTypes().then((result) => {
        if (result.data) setTypes(result.data)
        else setError('Не удалось загрузить типы событий. Проверьте, что API запущен.')
      })
    }
    if (page === 'booking') {
      void calendarApiGetBookingSettings().then((result) => {
        if (result.data) setSettings(result.data)
        else setError('Не удалось загрузить настройки записи. Проверьте, что API запущен.')
      })
    }
  }, [page])
  useEffect(() => {
    if (!selected) return
    let active = true
    void calendarApiListSlots({ path: { id: selected.id }, query: { date } }).then((result) => {
      if (!active) return
      if (result.data) setSlots(result.data.slots)
      else setError('Не удалось загрузить слоты. Попробуйте снова.')
    })
    return () => { active = false }
  }, [selected, date])

  const book = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selected || !slot) return
    const form = new FormData(event.currentTarget)
    setLoading(true)
    setError('')
    try {
      const response = await calendarApiCreateBooking({ body: { eventTypeId: selected.id, startsAt: slot.startsAt, guestName: String(form.get('name')).trim(), guestEmail: String(form.get('email')).trim() } })
      if (response.data) setConfirmed(true)
      else {
        setError(response.response.status === 409 ? 'Время уже занято. Выберите другой слот.' : 'Проверьте имя, email и время записи.')
        const refreshed = await calendarApiListSlots({ path: { id: selected.id }, query: { date } })
        if (refreshed.data) setSlots(refreshed.data.slots)
        setSlot(undefined)
      }
    } catch { setError('Не удалось связаться с API.') }
    finally { setLoading(false) }
  }

  const createType = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const element = event.currentTarget
    const form = new FormData(element)
    setError('')
    const response = await calendarApiCreateEventType({ body: { id: String(form.get('id')), name: String(form.get('name')).trim(), description: String(form.get('description')).trim(), durationMinutes: Number(form.get('duration')) } })
    if (response.data) { element.reset(); await loadTypes() }
    else setError(response.response.status === 409 ? 'Этот id уже используется.' : 'Проверьте данные типа события.')
  }

  return <div className="landing-page min-h-screen text-slate-900">
    <header className="border-b border-slate-200 bg-slate-50"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
      <a href="#/" className="flex items-center gap-2 font-semibold"><CalendarClock className="h-5 w-5 text-orange-500" /> Calendar</a>
      <nav aria-label="Основная навигация" className="flex flex-wrap gap-6 text-sm text-slate-500 sm:gap-8"><a className="hover:text-slate-900" href="#/booking" aria-current={page === 'booking' ? 'page' : undefined}>Записаться</a><a className="hover:text-slate-900" href="#/upcoming" aria-current={page === 'upcoming' ? 'page' : undefined}>Предстоящие события</a></nav>
    </div></header>
    <main className={page === 'home' ? 'mx-auto max-w-6xl px-5 py-14 sm:py-16' : 'mx-auto max-w-6xl space-y-6 px-5 py-8'}>
      {error && <p role="alert" className="rounded-lg bg-red-100 p-4 text-red-800">{error}</p>}
      {page === 'home' ? <div className="grid gap-10 md:grid-cols-2 md:gap-12">
        <section>
          <p className="mb-6 inline-block rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase text-slate-500">Быстрая запись на звонок</p>
          <h1 className="text-5xl font-bold tracking-tight">Calendar</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-500">Один экран, понятные слоты, быстрая бронь. Выберите время и запишитесь на звонок без лишних шагов.</p>
          <a href="#/booking" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600">Записаться <ArrowRight className="h-4 w-4" /></a>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Что доступно прямо сейчас</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-500">
            <li>• Слоты с шагом 30 минут с 09:00 до 18:00.</li>
            <li>• Проверка конфликта при бронировании.</li>
            <li>• Просмотр предстоящих событий в отдельном разделе.</li>
          </ul>
        </section>
      </div> : page === 'booking' ? <>
        {!confirmed && settings && <p>Часовой пояс: {settings.timezone}. Ежедневно {settings.opensAt}–{settings.closesAt}, шаг начала {settings.slotStepMinutes} минут.</p>}
        {confirmed ? <section><h2 className="text-2xl font-bold">Бронь подтверждена. До встречи!</h2><button className="mt-5 rounded-lg bg-orange-600 p-3 text-white" onClick={() => { setConfirmed(false); setSelected(undefined); setSlot(undefined); void loadTypes() }}>Забронировать еще</button></section>
          : !selected ? <section><h2 className="mb-4 text-2xl font-bold">Выберите тип встречи</h2>{types.length === 0 && <p>Пока нет доступных типов встреч.</p>}<div className="grid gap-4 sm:grid-cols-2">{types.map((item) => <button key={item.id} onClick={() => { setSelected(item); setDate(today()); setError('') }} className="rounded-xl border bg-white p-5 text-left shadow-sm hover:border-orange-500"><strong className="block text-lg">{item.name}</strong><span className="block">{item.description}</span><span>{item.durationMinutes} мин.</span></button>)}</div></section>
            : <section className="space-y-5"><button className="text-orange-700 underline" onClick={() => { setSelected(undefined); setSlot(undefined) }}>← К типам встреч</button><h2 className="text-2xl font-bold">{selected.name} · {selected.durationMinutes} мин.</h2>
              <label className="block">Дата (Europe/Moscow) <select className="ml-2 rounded border p-2" value={date} onChange={(event) => { setDate(event.target.value); setSlot(undefined); setSlots([]) }}>{Array.from({ length: settings?.bookingWindowDays ?? 14 }, (_, index) => dateAt(today(), index)).map((day) => <option key={day} value={day}>{day}</option>)}</select></label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{slots.map((item) => <button key={item.startsAt} type="button" disabled={!item.available} onClick={() => { setSlot(item); setError('') }} className={`rounded-lg border p-3 text-left ${item.available ? 'bg-white hover:border-orange-500' : 'bg-slate-200 text-slate-600'} ${slot?.startsAt === item.startsAt ? 'border-orange-600 ring-2 ring-orange-500' : ''}`}>{time(item.startsAt)} {item.reason && <small className="block">{reasonText[item.reason]}</small>}</button>)}</div>
              {slot && <form className="max-w-md space-y-3 rounded-xl border bg-white p-5" onSubmit={(event) => void book(event)}><h3 className="font-semibold">Запись на {dateTime(slot.startsAt)}</h3><label className="block">Имя<input className="block w-full rounded border p-2" name="name" required maxLength={100} /></label><label className="block">Email<input className="block w-full rounded border p-2" name="email" type="email" required maxLength={254} /></label><button disabled={loading} className="rounded-lg bg-orange-600 p-3 text-white">{loading ? 'Сохраняем…' : 'Подтвердить запись'}</button></form>}
            </section>}
      </> : <section className="space-y-8"><p className="rounded bg-amber-100 p-3">Учебное локальное приложение: список и контакты гостей доступны без авторизации. Не используйте реальные персональные данные при публичном размещении.</p>
        <div><h1 className="text-2xl font-bold">Предстоящие события</h1>{upcoming.length ? <ul className="mt-3 space-y-3">{upcoming.map((item, index) => <li className="rounded border bg-white p-4" key={`${item.startsAt}-${index}`}><strong>{item.eventType.name}</strong> ({item.eventType.id}) · {dateTime(item.startsAt)} · {item.eventType.durationMinutes} мин.<br />{item.guestName} · {item.guestEmail}</li>)}</ul> : <p className="mt-3">Предстоящих встреч пока нет.</p>}</div>
        <div><h2 className="text-2xl font-bold">Создать тип встречи</h2><form className="mt-4 grid max-w-lg gap-3" onSubmit={(event) => void createType(event)}><label>id<input name="id" required pattern="[a-z0-9\\-]{1,64}" maxLength={64} className="block w-full rounded border p-2" /></label><label>Название<input name="name" required maxLength={100} className="block w-full rounded border p-2" /></label><label>Описание<textarea name="description" required maxLength={1000} className="block w-full rounded border p-2" /></label><label>Длительность (мин.)<input name="duration" type="number" min="1" max="540" step="1" required className="block w-full rounded border p-2" /></label><button className="rounded-lg bg-orange-600 p-3 text-white">Создать</button></form></div>
        <div><h2 className="text-2xl font-bold">Типы встреч</h2>{types.length ? <ul className="mt-3 space-y-2">{types.map((item) => <li key={item.id}>{item.name} ({item.id}) · {item.durationMinutes} мин. — {item.description}</li>)}</ul> : <p>Типов пока нет.</p>}</div>
      </section>}
    </main>
  </div>
}

export default App

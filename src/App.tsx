import { useEffect, useState, type FormEvent } from 'react'
import { CalendarClock } from 'lucide-react'
import { calendarApiCreateBooking, calendarApiCreateEventType, calendarApiGetBookingSettings, calendarApiListEventTypes, calendarApiListSlots, calendarApiListUpcomingBookings } from './generated/sdk/sdk.gen'
import type { BookingSettings, EventType, Slot, UpcomingBooking } from './generated/sdk/types.gen'

const time = (value: string) => new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
const dateTime = (value: string) => new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
const dateAt = (date: string, days: number) => new Date(Date.parse(`${date}T12:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10)
const reasonText: Record<string, string> = { past: 'Время прошло', booked: 'Занято', does_not_fit: 'Не помещается до закрытия' }

function App() {
  const [page, setPage] = useState<'guest' | 'owner'>('guest')
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
  const loadUpcoming = async () => {
    const result = await calendarApiListUpcomingBookings()
    if (result.data) setUpcoming(result.data)
    else setError('Не удалось загрузить встречи.')
  }
  useEffect(() => {
    void calendarApiListEventTypes().then((result) => {
      if (result.data) setTypes(result.data)
      else setError('Не удалось загрузить типы событий. Проверьте, что API запущен.')
    })
    void calendarApiGetBookingSettings().then((result) => {
      if (result.data) setSettings(result.data)
      else setError('Не удалось загрузить настройки записи. Проверьте, что API запущен.')
    })
  }, [])
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

  const switchPage = (next: 'guest' | 'owner') => {
    setPage(next); setError('')
    if (next === 'owner') void loadUpcoming()
    else void loadTypes()
  }

  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <header className="border-b bg-white"><div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 p-5">
      <h1 className="flex items-center gap-2 text-xl font-bold"><CalendarClock className="text-orange-500" /> Календарь звонков</h1>
      <nav className="flex gap-4"><button className="text-orange-700 underline" onClick={() => switchPage('guest')}>Записаться</button><button className="text-orange-700 underline" onClick={() => switchPage('owner')}>Владелец (без авторизации)</button></nav>
    </div></header>
    <main className="mx-auto max-w-5xl space-y-6 p-5">
      {error && <p role="alert" className="rounded-lg bg-red-100 p-4 text-red-800">{error}</p>}
      {page === 'guest' ? <>
        {!confirmed && settings && <p>Часовой пояс: {settings.timezone}. Ежедневно {settings.opensAt}–{settings.closesAt}, шаг начала {settings.slotStepMinutes} минут.</p>}
        {confirmed ? <section><h2 className="text-2xl font-bold">Бронь подтверждена. До встречи!</h2><button className="mt-5 rounded-lg bg-orange-600 p-3 text-white" onClick={() => { setConfirmed(false); setSelected(undefined); setSlot(undefined); void loadTypes() }}>Забронировать еще</button></section>
          : !selected ? <section><h2 className="mb-4 text-2xl font-bold">Выберите тип встречи</h2>{types.length === 0 && <p>Пока нет доступных типов встреч.</p>}<div className="grid gap-4 sm:grid-cols-2">{types.map((item) => <button key={item.id} onClick={() => { setSelected(item); setDate(today()); setError('') }} className="rounded-xl border bg-white p-5 text-left shadow-sm hover:border-orange-500"><strong className="block text-lg">{item.name}</strong><span className="block">{item.description}</span><span>{item.durationMinutes} мин.</span></button>)}</div></section>
            : <section className="space-y-5"><button className="text-orange-700 underline" onClick={() => { setSelected(undefined); setSlot(undefined) }}>← К типам встреч</button><h2 className="text-2xl font-bold">{selected.name} · {selected.durationMinutes} мин.</h2>
              <label className="block">Дата (Europe/Moscow) <select className="ml-2 rounded border p-2" value={date} onChange={(event) => { setDate(event.target.value); setSlot(undefined); setSlots([]) }}>{Array.from({ length: settings?.bookingWindowDays ?? 14 }, (_, index) => dateAt(today(), index)).map((day) => <option key={day} value={day}>{day}</option>)}</select></label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{slots.map((item) => <button key={item.startsAt} type="button" disabled={!item.available} onClick={() => { setSlot(item); setError('') }} className={`rounded-lg border p-3 text-left ${item.available ? 'bg-white hover:border-orange-500' : 'bg-slate-200 text-slate-600'} ${slot?.startsAt === item.startsAt ? 'border-orange-600 ring-2 ring-orange-500' : ''}`}>{time(item.startsAt)} {item.reason && <small className="block">{reasonText[item.reason]}</small>}</button>)}</div>
              {slot && <form className="max-w-md space-y-3 rounded-xl border bg-white p-5" onSubmit={(event) => void book(event)}><h3 className="font-semibold">Запись на {dateTime(slot.startsAt)}</h3><label className="block">Имя<input className="block w-full rounded border p-2" name="name" required maxLength={100} /></label><label className="block">Email<input className="block w-full rounded border p-2" name="email" type="email" required maxLength={254} /></label><button disabled={loading} className="rounded-lg bg-orange-600 p-3 text-white">{loading ? 'Сохраняем…' : 'Подтвердить запись'}</button></form>}
            </section>}
      </> : <section className="space-y-8"><p className="rounded bg-amber-100 p-3">Учебное локальное приложение: список и контакты гостей доступны без авторизации. Не используйте реальные персональные данные при публичном размещении.</p>
        <div><h2 className="text-2xl font-bold">Создать тип встречи</h2><form className="mt-4 grid max-w-lg gap-3" onSubmit={(event) => void createType(event)}><label>id<input name="id" required pattern="[a-z0-9\\-]{1,64}" maxLength={64} className="block w-full rounded border p-2" /></label><label>Название<input name="name" required maxLength={100} className="block w-full rounded border p-2" /></label><label>Описание<textarea name="description" required maxLength={1000} className="block w-full rounded border p-2" /></label><label>Длительность (мин.)<input name="duration" type="number" min="1" max="540" step="1" required className="block w-full rounded border p-2" /></label><button className="rounded-lg bg-orange-600 p-3 text-white">Создать</button></form></div>
        <div><h2 className="text-2xl font-bold">Типы встреч</h2>{types.length ? <ul className="mt-3 space-y-2">{types.map((item) => <li key={item.id}>{item.name} ({item.id}) · {item.durationMinutes} мин. — {item.description}</li>)}</ul> : <p>Типов пока нет.</p>}</div>
        <div><h2 className="text-2xl font-bold">Предстоящие встречи</h2>{upcoming.length ? <ul className="mt-3 space-y-3">{upcoming.map((item, index) => <li className="rounded border bg-white p-4" key={`${item.startsAt}-${index}`}><strong>{item.eventType.name}</strong> ({item.eventType.id}) · {dateTime(item.startsAt)} · {item.eventType.durationMinutes} мин.<br />{item.guestName} · {item.guestEmail}</li>)}</ul> : <p>Предстоящих встреч пока нет.</p>}</div>
      </section>}
    </main>
  </div>
}

export default App

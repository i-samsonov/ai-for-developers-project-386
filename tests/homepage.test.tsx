import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import App from '../src/App'

test('главная описывает будущую запись на звонок и согласованные правила слотов', () => {
  const html = renderToStaticMarkup(<App />)

  expect(html).toContain('<h1')
  expect(html).toContain('Календарь звонков</h1>')
  expect(html).toContain('Как будет работать запись')
  expect(html).toContain('30-минутные слоты с 09:00 до 18:00')
  expect(html).toContain('17:30–18:00')
  expect(html).toContain('Проверка конфликтов при записи')
  expect(html).not.toContain('доступно прямо сейчас')
})

test('главная показывает запись и события как неактивные заглушки', () => {
  const html = renderToStaticMarkup(<App />)
  const buttons = [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)]
  const booking = buttons.filter(([, , content]) => content.includes('Записаться'))
  const events = buttons.filter(([, , content]) => content.includes('Предстоящие события'))

  expect(booking).toHaveLength(2)
  expect(events).toHaveLength(1)
  for (const [, attributes] of [...booking, ...events]) {
    expect(attributes).toMatch(/\bdisabled\b/)
  }
  expect(html).toContain('Скоро')
  expect(html).not.toMatch(/<a\b/)
})

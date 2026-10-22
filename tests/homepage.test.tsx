import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import App from '../src/App'

test('главная предлагает запись и не выдаёт админский раздел за защищённый', () => {
  const html = renderToStaticMarkup(<App />)
  expect(html).toContain('Выберите тип встречи')
  expect(html).toContain('Владелец (без авторизации)')
  expect(html).not.toContain('Скоро')
})

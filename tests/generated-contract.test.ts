import { describe, expect, it } from 'vitest'
import Fastify from 'fastify'
import { registerCalendarRoutes } from '../server/generated/routes.js'

describe('generated Fastify routes', () => {
  it('registers contract paths and validates request bodies before handlers run', async () => {
    const app = Fastify({ logger: false })
    let created = false
    registerCalendarRoutes(app, {
      CalendarApi_getBookingSettings: async () => ({ timezone: 'Europe/Moscow', opensAt: '09:00', closesAt: '18:00', slotStepMinutes: 30, bookingWindowDays: 14 }),
      CalendarApi_listEventTypes: async () => [],
      CalendarApi_createEventType: async () => { created = true; return { id: 'test', name: 'Test', description: 'Test', durationMinutes: 45 } },
      CalendarApi_listSlots: async () => ({ date: '2026-10-22', slots: [] }),
      CalendarApi_createBooking: async () => ({ confirmed: true }),
      CalendarApi_listUpcomingBookings: async () => [],
    })

    try {
      const settings = await app.inject('/api/booking-settings')
      expect(settings.statusCode).toBe(200)
      expect(settings.json().timezone).toBe('Europe/Moscow')

      const invalid = await app.inject({ method: 'POST', url: '/api/event-types', payload: { id: 'UPPER', name: 'Test', description: 'Test', durationMinutes: 45 } })
      expect(invalid.statusCode).toBe(400)
      expect(created).toBe(false)

      const valid = await app.inject({ method: 'POST', url: '/api/event-types', payload: { id: 'test', name: 'Test', description: 'Test', durationMinutes: 45 } })
      expect(valid.statusCode).toBe(200)
      expect(created).toBe(true)
    } finally {
      await app.close()
    }
  })
})

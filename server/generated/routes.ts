// Generated from api/main.tsp. Do not edit.
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { CalendarApiListUpcomingBookingsData, CalendarApiListUpcomingBookingsResponse, CalendarApiGetBookingSettingsData, CalendarApiGetBookingSettingsResponse, CalendarApiCreateBookingData, CalendarApiCreateBookingResponse, CalendarApiListEventTypesData, CalendarApiListEventTypesResponse, CalendarApiCreateEventTypeData, CalendarApiCreateEventTypeResponse, CalendarApiListSlotsData, CalendarApiListSlotsResponse } from './types.js'
import { routeSchemas } from './schemas.js'

export interface CalendarHandlers {
  CalendarApi_listUpcomingBookings: (request: FastifyRequest<{ Body: CalendarApiListUpcomingBookingsData['body']; Params: CalendarApiListUpcomingBookingsData['path']; Querystring: CalendarApiListUpcomingBookingsData['query'] }>, reply: FastifyReply) => CalendarApiListUpcomingBookingsResponse | Promise<CalendarApiListUpcomingBookingsResponse>;
  CalendarApi_getBookingSettings: (request: FastifyRequest<{ Body: CalendarApiGetBookingSettingsData['body']; Params: CalendarApiGetBookingSettingsData['path']; Querystring: CalendarApiGetBookingSettingsData['query'] }>, reply: FastifyReply) => CalendarApiGetBookingSettingsResponse | Promise<CalendarApiGetBookingSettingsResponse>;
  CalendarApi_createBooking: (request: FastifyRequest<{ Body: CalendarApiCreateBookingData['body']; Params: CalendarApiCreateBookingData['path']; Querystring: CalendarApiCreateBookingData['query'] }>, reply: FastifyReply) => CalendarApiCreateBookingResponse | Promise<CalendarApiCreateBookingResponse>;
  CalendarApi_listEventTypes: (request: FastifyRequest<{ Body: CalendarApiListEventTypesData['body']; Params: CalendarApiListEventTypesData['path']; Querystring: CalendarApiListEventTypesData['query'] }>, reply: FastifyReply) => CalendarApiListEventTypesResponse | Promise<CalendarApiListEventTypesResponse>;
  CalendarApi_createEventType: (request: FastifyRequest<{ Body: CalendarApiCreateEventTypeData['body']; Params: CalendarApiCreateEventTypeData['path']; Querystring: CalendarApiCreateEventTypeData['query'] }>, reply: FastifyReply) => CalendarApiCreateEventTypeResponse | Promise<CalendarApiCreateEventTypeResponse>;
  CalendarApi_listSlots: (request: FastifyRequest<{ Body: CalendarApiListSlotsData['body']; Params: CalendarApiListSlotsData['path']; Querystring: CalendarApiListSlotsData['query'] }>, reply: FastifyReply) => CalendarApiListSlotsResponse | Promise<CalendarApiListSlotsResponse>;
}

/** Register only after supplying handwritten business handlers. */
export function registerCalendarRoutes(app: FastifyInstance, handlers: CalendarHandlers): void {
  app.get("/api/admin/bookings", { schema: routeSchemas.CalendarApi_listUpcomingBookings }, handlers.CalendarApi_listUpcomingBookings)
  app.get("/api/booking-settings", { schema: routeSchemas.CalendarApi_getBookingSettings }, handlers.CalendarApi_getBookingSettings)
  app.post("/api/bookings", { schema: routeSchemas.CalendarApi_createBooking }, handlers.CalendarApi_createBooking)
  app.get("/api/event-types", { schema: routeSchemas.CalendarApi_listEventTypes }, handlers.CalendarApi_listEventTypes)
  app.post("/api/event-types", { schema: routeSchemas.CalendarApi_createEventType }, handlers.CalendarApi_createEventType)
  app.get("/api/event-types/:id/slots", { schema: routeSchemas.CalendarApi_listSlots }, handlers.CalendarApi_listSlots)
}

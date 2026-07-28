import availabilityHandler from "../server/root-endpoints/availability.js";
import bookingsHandler from "../server/root-endpoints/bookings.js";
import deadlineRemindersHandler from "../server/root-endpoints/deadline-reminders.js";

const ROUTE_HANDLERS = {
  availability: availabilityHandler,
  bookings: bookingsHandler,
  // Invoked by the Vercel cron in vercel.json, not by the browser. The handler
  // requires Authorization: Bearer $CRON_SECRET and refuses outright if that env
  // var is unset, since it sends mail to guests.
  "deadline-reminders": deadlineRemindersHandler,
};

export default async function handler(req, res) {
  const value = req.query?.route;
  const route = Array.isArray(value) ? value[0] : value;
  const routeHandler = ROUTE_HANDLERS[route];

  if (!routeHandler) {
    res.statusCode = 404;
    return res.end();
  }

  return routeHandler(req, res);
}

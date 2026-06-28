import availabilityHandler from "../server/root-endpoints/availability.js";
import bookingsHandler from "../server/root-endpoints/bookings.js";

const ROUTE_HANDLERS = {
  availability: availabilityHandler,
  bookings: bookingsHandler,
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

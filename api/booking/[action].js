import fileHandler from "../../server/public-booking-reads/file.js";
import statusHandler from "../../server/public-booking-reads/status.js";

const ACTION_HANDLERS = {
  file: fileHandler,
  status: statusHandler,
};

export default async function handler(req, res) {
  const value = req.query?.action;
  const action = Array.isArray(value) ? value[0] : value;
  const actionHandler = ACTION_HANDLERS[action];

  if (!actionHandler) {
    res.statusCode = 404;
    return res.end();
  }

  return actionHandler(req, res);
}

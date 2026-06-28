import approve from "../../../../server/admin-booking-actions/approve.js";
import assign from "../../../../server/admin-booking-actions/assign.js";
import cancel from "../../../../server/admin-booking-actions/cancel.js";
import countersign from "../../../../server/admin-booking-actions/countersign.js";
import file from "../../../../server/admin-booking-actions/file.js";
import paymentProof from "../../../../server/admin-booking-actions/payment-proof.js";
import payment from "../../../../server/admin-booking-actions/payment.js";
import redo from "../../../../server/admin-booking-actions/redo.js";
import reject from "../../../../server/admin-booking-actions/reject.js";
import resendApproval from "../../../../server/admin-booking-actions/resend-approval.js";
import { getQueryValue } from "../../../../server/api/_adminUtils.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ACTION_HANDLERS = {
  approve,
  assign,
  cancel,
  countersign,
  file,
  "payment-proof": paymentProof,
  payment,
  redo,
  reject,
  "resend-approval": resendApproval,
};

export default async function handler(req, res) {
  const id = getQueryValue(req, "id");
  const action = getQueryValue(req, "action");
  const actionHandler = ACTION_HANDLERS[action];

  if (typeof id !== "string" || !actionHandler) {
    res.statusCode = 404;
    return res.end();
  }

  return actionHandler(req, res);
}

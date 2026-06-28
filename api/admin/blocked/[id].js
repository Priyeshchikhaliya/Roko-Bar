import collectionHandler from "../../../server/admin-blocked-actions/collection.js";
import itemHandler from "../../../server/admin-blocked-actions/item.js";

const COLLECTION_ROUTE_ID = "__collection";

export default async function handler(req, res) {
  const value = req.query?.id;
  const id = Array.isArray(value) ? value[0] : value;

  if (id === COLLECTION_ROUTE_ID) {
    return collectionHandler(req, res);
  }

  return itemHandler(req, res);
}

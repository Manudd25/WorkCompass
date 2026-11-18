/** Production API (public URL, safe in client bundle). */
const PRODUCTION_API =
  "https://workcompass-aubna8bcgub5f3bt.westeurope-01.azurewebsites.net";

/** Local backend when running `npm run dev`. */
const LOCAL_API = "http://localhost:8000";

export const API_BASE = import.meta.env.DEV ? LOCAL_API : PRODUCTION_API;
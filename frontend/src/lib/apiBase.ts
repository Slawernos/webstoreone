// Devben hagyjuk üresen, így a Vite proxy kezeli a /api hívásokat
// (telefonról elég a frontend portot elérni).
// Production környezetben VITE_API_URL-lal felülírható.
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

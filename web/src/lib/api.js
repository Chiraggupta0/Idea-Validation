/** Backend base URL. Set VITE_API_URL in production (Vercel env) to your Render URL,
 *  e.g. https://sivp-backend.onrender.com. Falls back to localhost for dev. */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

import axios from 'axios'
export const api = axios.create({
baseURL: import.meta.env.VITE_API_URL || 'https://backend.bitflow.com.mx/api',
timeout: 20000,
})
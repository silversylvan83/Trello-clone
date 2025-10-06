import axios from 'axios'

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.trim() || 'http://localhost:4000'

export const api = axios.create({ baseURL: API_BASE })

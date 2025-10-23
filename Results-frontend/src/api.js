import axios from "axios";

let base = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
export const api = axios.create({ baseURL: base.replace(/\/+$/,"") });

// carry admin token if present
const token = sessionStorage.getItem("admin_jwt");
if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;

/* ---------- PUBLIC ---------- */
export const getEvents = async () => (await api.get("/api/public/events")).data;
export const getEventBundle = async (eventId) => (await api.get(`/api/public/events/${eventId}/bundle`)).data;
export const getPublishedWinners = async (eventId) => (await api.get(`/api/public/results/events/${eventId}`)).data;

/* ---------- RESULTS (admin) ---------- */
export const listResultSets = async (eventId) => (await api.get(`/api/results`, { params: { eventId } })).data;
export const createResultSet = async (payload) => (await api.post(`/api/results`, payload)).data;
export const getResultSet = async (id) => (await api.get(`/api/results/${id}`)).data;
export const updateResultSet = async (id, payload) => (await api.put(`/api/results/${id}`, payload)).data;
export const deleteResultSet = async (id) => (await api.delete(`/api/results/${id}`)).data;

export const addResultItem = async (setId, payload) => (await api.post(`/api/results/${setId}/items`, payload)).data;
export const updateResultItem = async (itemId, payload) => (await api.put(`/api/results/items/${itemId}`, payload)).data;
export const deleteResultItem = async (itemId) => (await api.delete(`/api/results/items/${itemId}`)).data;
export const publishResultSet = async (id) => (await api.post(`/api/results/${id}/publish`)).data;
export const exportCsv = (id) => `${api.defaults.baseURL}/api/results/${id}/export.csv`;

/* ---------- DASHBOARD ANALYTICS (admin) ---------- */
export const getKpis = async () => (await api.get(`/api/dashboard/kpis`)).data;
export const getCategoriesProgress = async () => (await api.get(`/api/dashboard/categories`)).data;
export const getLeaders = async (categoryId, limit=3) =>
  (await api.get(`/api/dashboard/leaders`, { params: { categoryId, limit } })).data;
export const getTrend = async (hours=24) =>
  (await api.get(`/api/dashboard/trend`, { params: { hours } })).data;

// Ensure you already have an axios instance named `api` exported from this file.
// Below are the report helpers used by Analytics.jsx:

export const getAllEvents   = async () =>
  (await api.get("/api/admin/reports/events")).data;

export const getEventReport = async (eventId) =>
  (await api.get(`/api/admin/reports/events/${eventId}`)).data;

export const exportEventReportCsv = (eventId) =>
  `${api.defaults.baseURL}/api/admin/reports/events/${eventId}/export.csv`;

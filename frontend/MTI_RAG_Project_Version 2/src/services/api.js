import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const TOKEN_KEY = "mti_access_token";
const USER_KEY = "mti_user";

const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

api.interceptors.request.use((config) => {
	const token = sessionStorage.getItem(TOKEN_KEY);
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

export const getToken = () => sessionStorage.getItem(TOKEN_KEY);

export const getStoredUser = () => {
	const raw = sessionStorage.getItem(USER_KEY);
	if (!raw) {
		return null;
	}

	try {
		return JSON.parse(raw);
	} catch {
		sessionStorage.removeItem(USER_KEY);
		return null;
	}
};

export const saveSession = ({ access_token, user }) => {
	sessionStorage.setItem(TOKEN_KEY, access_token);
	sessionStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSession = () => {
	sessionStorage.removeItem(TOKEN_KEY);
	sessionStorage.removeItem(USER_KEY);
};

export const registerUser = async (payload) => {
	const { data } = await api.post("/register", payload);
	return data;
};

export const loginUser = async (payload) => {
	const { data } = await api.post("/login", payload);
	return data;
};

export const logoutUser = async () => {
	const { data } = await api.post("/logout");
	return data;
};

export const askQuestion = async (question) => {
	const { data } = await api.post("/chat", { question });
	return data;
};

export const fetchHistory = async () => {
	const { data } = await api.get("/history");
	return data;
};

export const deleteHistoryItem = async (historyId) => {
	const { data } = await api.delete(`/history/${historyId}`);
	return data;
};

export default api;

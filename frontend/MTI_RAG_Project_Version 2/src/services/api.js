import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const TOKEN_KEY = "mti_access_token";
const USER_KEY = "mti_user";
const DEVICE_KEY = "mti_device_id";

const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

export const getDeviceId = () => {
	let deviceId = localStorage.getItem(DEVICE_KEY);
	if (!deviceId) {
		if (typeof crypto !== "undefined" && crypto.randomUUID) {
			deviceId = "dev_" + crypto.randomUUID().replace(/-/g, "");
		} else {
			deviceId = "dev_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
		}
		localStorage.setItem(DEVICE_KEY, deviceId);
	}
	return deviceId;
};

export const getOrInitAnonymousSession = async () => {
	let token = getToken();
	if (token) return token;

	const deviceId = getDeviceId();
	try {
		const { data } = await axios.post(`${API_BASE_URL}/auth/anonymous`, { device_id: deviceId });
		saveSession(data);
		return data.access_token;
	} catch (err) {
		console.error("Failed to initialize anonymous session", err);
		return null;
	}
};

api.interceptors.request.use(async (config) => {
	if (!getToken() && !config.url?.includes("/auth/anonymous")) {
		await getOrInitAnonymousSession();
	}
	const token = getToken();
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		if (error.response && error.response.status === 401 && !error.config?._retry) {
			error.config._retry = true;
			clearSession();
			const token = await getOrInitAnonymousSession();
			if (token) {
				error.config.headers.Authorization = `Bearer ${token}`;
				return api(error.config);
			}
		}
		return Promise.reject(error);
	}
);

export const getToken = () => sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);

export const getStoredUser = () => {
	const raw = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
	if (!raw || raw === "undefined" || raw === "null") {
		return null;
	}

	try {
		return JSON.parse(raw);
	} catch {
		sessionStorage.removeItem(USER_KEY);
		localStorage.removeItem(USER_KEY);
		return null;
	}
};

export const saveSession = (data) => {
	if (!data) return;
	const token = data.access_token || data.token;
	const user = data.user || { name: "MTI User", email: "" };
	if (token) {
		sessionStorage.setItem(TOKEN_KEY, token);
		localStorage.setItem(TOKEN_KEY, token);
	}
	if (user) {
		sessionStorage.setItem(USER_KEY, JSON.stringify(user));
		localStorage.setItem(USER_KEY, JSON.stringify(user));
	}
};

export const clearSession = () => {
	sessionStorage.removeItem(TOKEN_KEY);
	sessionStorage.removeItem(USER_KEY);
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(USER_KEY);
};

export const logoutUser = async () => {
	const { data } = await api.post("/logout");
	return data;
};

export const askQuestion = async (question, mode = "moderate", threadId = null) => {
	const { data } = await api.post("/chat", { question, mode, thread_id: threadId });
	return data;
};

export const generateDiagram = async (prompt) => {
	const { data } = await api.post("/chat/generate-diagram", { prompt });
	return data;
};

export const fetchThreads = async () => {
	const { data } = await api.get("/threads");
	return data;
};

export const fetchThreadMessages = async (threadId) => {
	const { data } = await api.get(`/threads/${threadId}/messages`);
	return data;
};

export const renameThread = async (threadId, title) => {
	const { data } = await api.put(`/threads/${threadId}`, { title });
	return data;
};

export const deleteThread = async (threadId) => {
	const { data } = await api.delete(`/threads/${threadId}`);
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

export const deleteAllHistory = async () => {
	const { data } = await api.delete("/history");
	return data;
};

export const fetchUserProfile = async () => {
	const { data } = await api.get("/user/profile");
	return data;
};

export const updateUserProfile = async (payload) => {
	const { data } = await api.put("/user/profile", payload);
	return data;
};

export const translateMessage = async (text, targetLanguage = "hindi") => {
	const { data } = await api.post("/chat/translate", {
		text,
		target_language: targetLanguage,
	});
	return data;
};

export default api;

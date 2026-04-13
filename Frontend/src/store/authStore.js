import { create } from "zustand";
import api from "../api/axios";

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("cf_token") || null,
  isLoading: false,
  isInitialized: false,

  // ── Initialize: fetch /me if token exists ──
  init: async () => {
    const token = localStorage.getItem("cf_token");
    if (!token) {
      set({ isInitialized: true });
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      set({ user: data, token, isInitialized: true });
    } catch {
      localStorage.removeItem("cf_token");
      set({ user: null, token: null, isInitialized: true });
    }
  },

  // ── Register ──
  register: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      localStorage.setItem("cf_token", data.token);
      set({ user: data.user, token: data.token, isLoading: false });
      return { success: true };
    } catch (err) {
      set({ isLoading: false });
      return { success: false, message: err.response?.data?.message || "Registration failed" };
    }
  },

  // ── Login ──
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("cf_token", data.token);
      set({ user: data.user, token: data.token, isLoading: false });
      return { success: true };
    } catch (err) {
      set({ isLoading: false });
      return { success: false, message: err.response?.data?.message || "Login failed" };
    }
  },

  // ── Logout ──
  logout: () => {
    localStorage.removeItem("cf_token");
    set({ user: null, token: null });
  },

  // ── Refresh user from /me (e.g. after Stripe upgrade) ──
  refreshUser: async () => {
    try {
      const { data } = await api.get("/auth/me");
      set({ user: data });
    } catch {
      // silent
    }
  },
}));

export default useAuthStore;

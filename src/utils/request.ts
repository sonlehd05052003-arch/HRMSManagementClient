

import type { AxiosRequestConfig } from "axios"
import axios from "axios"



const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api.peoplecore.tech/api",
  // The JWT is an HttpOnly cookie set by the API at login; the browser attaches it, scripts never see it
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Session expired or revoked: reload on the login page, which drops the in-memory session.
    // The startup session check is left alone: a 401 there just means "not signed in yet".
    if (error.response && error.response.status === 401 && error.config?.url !== "/Auth/me") {
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const request = async(config: AxiosRequestConfig) => {
  return instance({
    ...config,
  })
}
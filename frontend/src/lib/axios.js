import axios from "axios";

export const axiosInstance = axios.create({
  // Always use deployed backend URL for API calls
  baseURL: "https://college-connect-ubrq.onrender.com/api",
  withCredentials: true,
});

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setupRequestInterceptor } from "./lib/request-interceptor";

// Setup request interceptor to auto-check all API calls
setupRequestInterceptor();

createRoot(document.getElementById("root")!).render(<App />);
import { createRoot } from "react-dom/client";

import App from "@/app/app";

/**
 * Application entry point.
 * Creates the React root and renders the main App component in StrictMode.
 */
createRoot(document.getElementById("root")!).render(
  <App />
)
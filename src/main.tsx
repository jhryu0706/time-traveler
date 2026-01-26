import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Ensure portaled components (e.g. Radix dropdowns) inherit the same theme tokens.
// Our CSS variables are defined under the `.dark` selector, so it must live on a
// common ancestor of both the app tree and any portals (which mount under <body>).
document.documentElement.classList.add("dark");

createRoot(document.getElementById("root")!).render(<App />);

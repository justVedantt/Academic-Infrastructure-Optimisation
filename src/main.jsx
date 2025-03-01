import React from "react";
import ReactDOM from "react-dom/client";
import Home from "./App"; // Changed from "./app" to "./App"
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>
);
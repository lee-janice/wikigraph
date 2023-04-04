import ReactDOM from "react-dom/client";
import "./styles/index.css";
import App from "./App";
import React from "react";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

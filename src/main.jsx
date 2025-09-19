import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import AppWrapper from "./App"; // <-- App.jsx enthält AppWrapper
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <AppWrapper />
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);

/*
// ⬇️ Einstiegspunkt deiner React-App mit Context und Routing
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter> {}
      <UserProvider> {}
        <AppWrapper />
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);
*/
// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import App from "./App.jsx";
// The opsz cut carries Fraunces' optical-size axis alongside weight (+30 kB on
// latin). Display sizes get the finer, higher-contrast letterforms the family
// was drawn for; see the .display-* rules in index.css.
import "@fontsource-variable/fraunces/opsz.css";
import "@fontsource-variable/inter";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <LanguageProvider>
        {/* Deliberately no analytics script of any kind: /datenschutz promises
            no tracking and no visitor counting, and that promise is only worth
            something if nothing here quietly contradicts it. */}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </LanguageProvider>
    </HelmetProvider>
  </React.StrictMode>
);

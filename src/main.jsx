import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";
import { store } from "./redux/store";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queryClient";
import { PaymentProvider } from "./context/paymentContext.jsx";
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPrompt = e;
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <HelmetProvider>
            <PaymentProvider>
              <App />
            </PaymentProvider>
          </HelmetProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/firebase-messaging-sw.js').catch(error => {
      console.log('SW registration failed: ', error);
    });
  });
}

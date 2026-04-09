import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";
import { store } from "./redux/store";
import { ErrorBoundary } from "./components/common";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PaymentProvider } from "./context/paymentContext";

// Configure React Query with better error handling and caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <ErrorBoundary>
    <HelmetProvider>
      <Provider store={store}>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <PaymentProvider>
              <App />
            </PaymentProvider>
          </QueryClientProvider>
        </BrowserRouter>
      </Provider>
    </HelmetProvider>
  </ErrorBoundary>
  // </React.StrictMode>
);

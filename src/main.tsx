import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import App from "./app/App";
import "./styles/index.css";

// Global error listener to catch any syntax or initialization runtime crash
window.addEventListener("error", (e) => {
  console.error("Global runtime error caught:", e);
});

window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled promise rejection:", e.reason);
});

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("React ErrorBoundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          backgroundColor: "#080c09",
          color: "#e8f2ea",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center"
        }}>
          <div style={{
            maxWidth: "600px",
            backgroundColor: "#0d1410",
            border: "1px solid #1a261c",
            borderRadius: "24px",
            padding: "32px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              backgroundColor: "rgba(255, 68, 68, 0.1)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              color: "#ff4444",
              fontWeight: "bold",
              fontSize: "20px"
            }}>!</div>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "8px" }}>
              Something went wrong
            </h2>
            <p style={{ color: "#8a9e8e", fontSize: "14px", marginBottom: "24px" }}>
              An error occurred while loading this view. You can reload the studio to restore your session.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: "#aaff38",
                color: "#080c09",
                border: "none",
                fontWeight: "bold",
                cursor: "pointer",
                padding: "10px 24px",
                borderRadius: "12px",
                fontSize: "14px"
              }}
            >
              Reload Studio
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(
    <ErrorBoundary>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        storageKey="layerat_theme_mode"
      >
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
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
            border: "1px solid rgba(170, 255, 56, 0.2)",
            borderRadius: "24px",
            padding: "32px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
          }}>
            <h1 style={{ color: "#aaff38", fontSize: "24px", margin: "0 0 12px 0" }}>
              Layerat Design Studio
            </h1>
            <p style={{ color: "#6b8c72", fontSize: "14px", margin: "0 0 20px 0" }}>
              A client-side initialization issue occurred.
            </p>
            <pre style={{
              background: "#162018",
              color: "#fca5a5",
              padding: "16px",
              borderRadius: "12px",
              fontSize: "12px",
              textAlign: "left",
              overflowX: "auto"
            }}>
              {this.state.error?.message || "Unknown error"}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: "20px",
                padding: "12px 24px",
                borderRadius: "12px",
                backgroundColor: "#aaff38",
                color: "#080c09",
                border: "none",
                fontWeight: "bold",
                cursor: "pointer"
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
      <App />
    </ErrorBoundary>
  );
}
// --- Imports ---
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Window1Test from "./window1Test";
import SeperateTest from "./seperateTest";

// --- Main App ---
export default function App() {
  return (
    <Router>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          backgroundColor: "#fafbfc",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
        // Removed onCreated prop, which is invalid for div
      >
        <nav
          style={{
            width: "100vw",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 100,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "0.5rem 0",
            background: "#fff",
            boxShadow: "0 2px 12px 0 rgba(0,0,0,0.06)",
            borderBottom: "1px solid #e5e7eb",
            borderRadius: 0,
            fontFamily: "Inter, system-ui, sans-serif",
            gap: 32,
          }}
        >
          <Link
            to="/window1"
            style={{
              color: "#222",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "1.08rem",
              letterSpacing: "0.01em",
              margin: "0 1.5rem",
              padding: "0.5rem 1rem",
              borderRadius: "10px",
              background: "none",
              border: "none",
              transition: "color 0.18s, border-bottom 0.18s",
              position: "relative",
              display: "inline-block",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = "#2563eb";
              e.currentTarget.style.textDecoration = "underline";
              e.currentTarget.style.textUnderlineOffset = "6px";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = "#222";
              e.currentTarget.style.textDecoration = "none";
            }}
          >
            Window1 Test
          </Link>
          <Link
            to="/seperate"
            style={{
              color: "#222",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "1.08rem",
              letterSpacing: "0.01em",
              margin: "0 1.5rem",
              padding: "0.5rem 1rem",
              borderRadius: "10px",
              background: "none",
              border: "none",
              transition: "color 0.18s, border-bottom 0.18s",
              position: "relative",
              display: "inline-block",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = "#2563eb";
              e.currentTarget.style.textDecoration = "underline";
              e.currentTarget.style.textUnderlineOffset = "6px";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = "#222";
              e.currentTarget.style.textDecoration = "none";
            }}
          >
            Seperate Test
          </Link>
        </nav>
        <div style={{ paddingTop: 70 }}>
          <Routes>
            <Route path="/window1" element={<Window1Test />} />
            <Route path="/seperate" element={<SeperateTest />} />
            <Route
              path="*"
              element={
                <div
                  style={{ color: "#222", textAlign: "center", marginTop: 40 }}
                >
                  <h2>Choose a test page above</h2>
                </div>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

import React from "react";

export default function SeperateTest() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        minHeight: "100vh",
        background: "#f4f6fa",
        fontFamily: "Inter, system-ui, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <section
        style={{
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 2px 16px 0 rgba(0,0,0,0.07)",
          padding: "2.5rem 2.5rem 2rem 2.5rem",
          minWidth: 320,
          maxWidth: 420,
          width: "100%",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            color: "#222",
            fontWeight: 700,
            fontSize: "2rem",
            letterSpacing: "0.01em",
            margin: 0,
          }}
        >
          Seperate Test
        </h2>
        <p style={{ color: "#5a5a5a", fontSize: "1.08rem", marginTop: 12 }}>
          This is a placeholder for another test page. Add your content here.
        </p>
      </section>
    </div>
  );
}

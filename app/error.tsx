"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: 20, color: "white", background: "#07070b", minHeight: "100vh" }}>
      <h2 style={{ fontWeight: 900 }}>Something went wrong</h2>
      <p style={{ opacity: 0.8, marginTop: 8 }}>
        {error?.message || "Unknown error"}
      </p>

      <button
        onClick={() => reset()}
        style={{
          marginTop: 14,
          padding: "10px 14px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(255,255,255,0.08)",
          color: "white",
          fontWeight: 900,
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}
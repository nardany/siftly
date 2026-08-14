import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0f172a",
        color: "#ffffff",
        padding: "20px",
        textAlign: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: "120px",
          fontWeight: "900",
          background: "linear-gradient(135deg, #6366f1, #a855f7)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1,
          marginBottom: "16px",
        }}
      >
        404
      </div>

      <h1 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "12px" }}>
        Էջը չի գտնվել
      </h1>
      <Link
        href="/"
        style={{
          padding: "14px 28px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, #6366f1, #4f46e5)",
          color: "#ffffff",
          fontWeight: "700",
          fontSize: "15px",
          textDecoration: "none",
          boxShadow: "0 8px 20px rgba(99, 102, 241, 0.4)",
        }}
      >
        ← Վերադառնալ Գլխավոր Էջ
      </Link>

      <div
        style={{
          marginTop: "60px",
          paddingTop: "20px",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          fontSize: "14px",
          color: "#64748b",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <span>Siftly — Built with by</span>
        <a
          href="https://www.linkedin.com/in/nar-danielyan"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#818cf8",
            fontWeight: "700",
            textDecoration: "none",
          }}
        >
          Narek Danielyan
        </a>
      </div>
    </div>
  );
}

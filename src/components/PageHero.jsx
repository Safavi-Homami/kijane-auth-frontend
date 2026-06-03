export default function PageHero({ eyebrow, title, subtitle, children }) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg,#0f172a,#1e293b)",
        color: "white",
        borderRadius: "12px",

        padding: "18px 24px",
        marginBottom: "16px",

        maxWidth: "1100px",
        width: "100%",
        marginInline: "auto",

        display: "flex",
        justifyContent: "center",
        alignItems: "center",

        minHeight: "100px"
      }}
    >
      <div
        style={{
          width: "100%",
          textAlign: "center"
        }}
      >

        {eyebrow && (
          <div
            style={{
              fontSize: "12px",
              opacity: 0.7,
              marginBottom: "2px"
            }}
          >
            {eyebrow}
          </div>
        )}

        <h1
          style={{
            fontSize: "22px",
            fontWeight: "600",
            marginBottom: "2px"
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            style={{
              fontSize: "13px",
              color: "#cbd5f5",
              maxWidth: "600px",
              margin: "0 auto",

              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden"
            }}
          >
            {subtitle}
          </p>
        )}

        {/* 🔥 EXTRA CONTENT (Rating etc.) */}
        {children && (
          <div style={{ marginTop: "8px" }}>
            {children}
          </div>
        )}

      </div>
    </div>
  );
}
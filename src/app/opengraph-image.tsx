import { ImageResponse } from "next/og";

export const alt = "ABCD Digital Hub — Full-Stack Web Application Development & SaaS Studio";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0A0A0A",
          padding: "64px 72px",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid pattern background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(#262626 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            opacity: 0.6,
          }}
        />

        {/* Top Header Tag */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0A0A0A",
                fontWeight: 900,
                fontSize: "20px",
                letterSpacing: "-1px",
              }}
            >
              A
            </div>
            <span
              style={{
                fontSize: "14px",
                fontWeight: 700,
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "#A3A3A3",
                fontFamily: "monospace",
              }}
            >
              ABCD Digital Hub
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "999px",
              border: "1px solid #262626",
              backgroundColor: "rgba(20, 20, 20, 0.8)",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#10B981",
              }}
            />
            <span
              style={{
                fontSize: "12px",
                fontFamily: "monospace",
                color: "#E5E5E5",
                fontWeight: 600,
              }}
            >
              Production Ready // 2026
            </span>
          </div>
        </div>

        {/* Main Title & Subhead */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            position: "relative",
            zIndex: 10,
            maxWidth: "960px",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#E5E5E5",
              letterSpacing: "4px",
              textTransform: "uppercase",
              fontFamily: "monospace",
            }}
          >
            // Software Architecture & Digital Consulting
          </div>
          <h1
            style={{
              fontSize: "56px",
              fontWeight: 900,
              letterSpacing: "-2px",
              lineHeight: 1.08,
              color: "#FFFFFF",
              margin: 0,
            }}
          >
            Full-Stack Web Application Development & SaaS Studio
          </h1>
          <p
            style={{
              fontSize: "20px",
              lineHeight: 1.5,
              color: "#A3A3A3",
              margin: 0,
              fontWeight: 400,
            }}
          >
            Engineering scalable multi-tenant platforms, high-throughput APIs, and autonomous AI-powered workflow automations.
          </p>
        </div>

        {/* Bottom Feature Badges & URL */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "24px",
            borderTop: "1px solid #262626",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {["Next.js 15", "TypeScript", "PostgreSQL", "Google Gemini AI", "Prisma"].map(
              (tag) => (
                <span
                  key={tag}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid #262626",
                    color: "#E5E5E5",
                    fontSize: "13px",
                    fontFamily: "monospace",
                    fontWeight: 600,
                  }}
                >
                  {tag}
                </span>
              )
            )}
          </div>

          <span
            style={{
              fontSize: "15px",
              fontFamily: "monospace",
              color: "#737373",
              fontWeight: 600,
            }}
          >
            abcddigitalhub.com
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

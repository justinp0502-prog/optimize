import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at top left, rgba(255,255,255,0.95), rgba(248,244,236,1) 40%, rgba(225,234,228,1) 100%)",
          borderRadius: "120px",
          border: "12px solid rgba(47, 75, 67, 0.12)",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 320,
            height: 320,
            borderRadius: 96,
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(180deg, rgba(47,75,67,1), rgba(34,56,50,1))",
            color: "#f8f4ec",
            fontSize: 180,
            fontWeight: 700,
            fontFamily: "Arial",
            boxShadow: "0 24px 60px rgba(34,56,50,0.25)",
          }}
        >
          O
        </div>
      </div>
    ),
    size
  );
}

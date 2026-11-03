import { ImageResponse } from "next/og";

// Genererer app-ikonet som PNG (192 eller 512 px) – ingen billedfiler nødvendige.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size } = await params;
  const px = size === "192" ? 192 : 512;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          color: "#4ade80",
          fontSize: px * 0.6,
          fontWeight: 700,
        }}
      >
        ✓
      </div>
    ),
    { width: px, height: px }
  );
}

import { ImageResponse } from "next/og";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;
  const isMonochrome = slug.startsWith("monochrome");
  const isMaskable = slug.startsWith("maskable");
  const size = slug.includes("192") ? 192 : 512;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isMonochrome
            ? "#ffffff"
            : "linear-gradient(135deg, #052e16 0%, #0f172a 55%, #2563eb 100%)",
          borderRadius: isMaskable ? size * 0.22 : size * 0.12,
          color: isMonochrome ? "#0f172a" : "#ffffff",
          fontSize: size * 0.36,
          fontWeight: 900,
          letterSpacing: -size * 0.03,
        }}
      >
        PH
      </div>
    ),
    {
      width: size,
      height: size,
    }
  );
}
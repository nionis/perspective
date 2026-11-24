import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ShareCard } from "./card.tsx";
import { parseCardDate, parseShareSearch } from "../../../share/share.ts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const font = readFile(
  join(process.cwd(), "src/app/api/og/IBMPlexMono-Regular.ttf"),
);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = parseShareSearch(url.searchParams);
  if (!params) {
    return new Response("Invalid share parameters", { status: 400 });
  }
  const date = parseCardDate(url.searchParams) ?? new Date();
  return new ImageResponse(<ShareCard params={params} date={date} />, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "IBM Plex Mono",
        data: await font,
        style: "normal",
        weight: 400,
      },
    ],
    headers: {
      "Cache-Control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}

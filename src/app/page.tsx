import type { Metadata } from "next";
import { HomeClient } from "./HomeClient.tsx";
import { shareMetadata } from "../share/metadata.ts";
import { parseShareSearch } from "../share/share.ts";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const record = await searchParams;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(record)) {
    if (typeof value === "string") search.set(key, value);
    else if (Array.isArray(value)) {
      value.forEach((item) => search.append(key, item));
    }
  }
  const params = parseShareSearch(search);
  return params ? shareMetadata(params, new Date()) : {};
}

export default function Page() {
  return <HomeClient />;
}

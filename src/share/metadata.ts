import type { Metadata } from "next";
import { shareCopy } from "../copy.ts";
import { shareImagePath, sharePath } from "./share.ts";
import type { ShareParams } from "./share.ts";

export function shareMetadata(params: ShareParams, date: Date): Metadata {
  const copy = shareCopy(params, date);
  const path = sharePath(params);
  const image = shareImagePath(params, date);
  return {
    title: copy.shareTitle,
    description: copy.label,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: "Perspective",
      title: copy.shareTitle,
      description: copy.label,
      url: path,
      images: [{ url: image, width: 1200, height: 630, alt: copy.label }],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.shareTitle,
      description: copy.label,
      images: [{ url: image, alt: copy.label }],
    },
  };
}

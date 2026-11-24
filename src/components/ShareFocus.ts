"use client";

import { createContext, useContext } from "react";
import type { ShareParams } from "../share/share.ts";

export type DismissOptions = {
  /** Keep the viewport where it is; used when the reader edits a focused field. */
  keepScroll?: boolean;
};

export type ShareFocusValue = {
  params: ShareParams | null;
  dismiss: (options?: DismissOptions) => void;
};

const noop = () => {};

export const ShareFocusContext = createContext<ShareFocusValue>({
  params: null,
  dismiss: noop,
});

export function useShareFocus(): ShareFocusValue {
  return useContext(ShareFocusContext);
}

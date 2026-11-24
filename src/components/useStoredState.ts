import { useState } from "react";
import { readStored, writeStored } from "../storage.ts";

export function useStoredState(key: string, fallback: string, override?: string) {
  const [stored, setStored] = useState(() => readStored(key, fallback));
  const [edited, setEdited] = useState<string | null>(null);
  const value = edited ?? override ?? stored;
  const setValue = (next: string) => {
    setEdited(next);
    setStored(next);
    writeStored(key, next);
  };
  return [value, setValue] as const;
}

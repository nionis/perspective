import { useEffect, useState } from "react";
import { readStored, writeStored } from "../storage.ts";

export function useStoredState(key: string, fallback: string) {
  const [value, setValue] = useState(() => readStored(key, fallback));

  useEffect(() => {
    writeStored(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}

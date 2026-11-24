"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { copyImage, copyText } from "../share/clipboard.ts";
import { shareImagePath, shareUrl } from "../share/share.ts";
import type { ShareParams } from "../share/share.ts";
import styles from "./ShareButton.module.css";

type Props =
  | { chart: "days" | "weekends"; date: Date }
  | { chart: "summers"; age: number; horizon: number }
  | { chart: "visits"; age: number; rate: number; horizon: number };

const LABELS = {
  days: "the year in days",
  weekends: "the year in weekends",
  summers: "your summers left",
  visits: "grandparents visits left",
} as const;

function toParams(props: Props): ShareParams {
  switch (props.chart) {
    case "days":
    case "weekends":
      return { chart: props.chart };
    case "summers":
      return { chart: "summers", age: props.age, horizon: props.horizon };
    case "visits":
      return {
        chart: "visits",
        age: props.age,
        rate: props.rate,
        horizon: props.horizon,
      };
  }
}

export function ShareButton(props: Props) {
  const params = toParams(props);
  const date =
    props.chart === "days" || props.chart === "weekends"
      ? props.date
      : undefined;
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const items = useCallback(
    () =>
      Array.from(
        menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ??
          [],
      ),
    [],
  );

  useEffect(() => {
    if (!open) return;
    items()[0]?.focus();
  }, [open, items]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && wrapRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer, true);
    return () => document.removeEventListener("pointerdown", onPointer, true);
  }, [open]);

  useEffect(() => {
    if (!status) return;
    const id = window.setTimeout(() => setStatus(""), 2500);
    return () => window.clearTimeout(id);
  }, [status]);

  const copyLink = async () => {
    setOpen(false);
    const copied = await copyText(shareUrl(window.location.origin, params));
    setStatus(copied ? "Link copied" : "Copy failed");
  };

  const copyPicture = async () => {
    setOpen(false);
    setStatus("Copying image…");
    const url = new URL(
      shareImagePath(params, date),
      window.location.origin,
    ).toString();
    const result = await copyImage(url, `perspective-${props.chart}.png`);
    setStatus(
      result === "copied"
        ? "Image copied"
        : result === "downloaded"
          ? "Image downloaded"
          : "Copy failed",
    );
  };

  const onMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const list = items();
    const index = list.findIndex((item) => item === document.activeElement);
    switch (event.key) {
      case "Escape":
        setOpen(false);
        triggerRef.current?.focus();
        break;
      case "ArrowDown":
        event.preventDefault();
        list[(index + 1) % list.length]?.focus();
        break;
      case "ArrowUp":
        event.preventDefault();
        list[(index - 1 + list.length) % list.length]?.focus();
        break;
      case "Home":
        event.preventDefault();
        list[0]?.focus();
        break;
      case "End":
        event.preventDefault();
        list[list.length - 1]?.focus();
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  return (
    <div
      className={styles.wrap}
      ref={wrapRef}
      onBlur={(event) => {
        const next = event.relatedTarget;
        if (next instanceof Node && wrapRef.current?.contains(next)) return;
        setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label={`Share ${LABELS[props.chart]}`}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Share"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          aria-hidden="true"
        >
          <rect x="5.5" y="2.5" width="8" height="8" />
          <rect x="2.5" y="5.5" width="8" height="8" />
        </svg>
      </button>
      {open ? (
        <div
          className={styles.menu}
          role="menu"
          aria-label="Share options"
          ref={menuRef}
          onKeyDown={onMenuKeyDown}
        >
          <button
            type="button"
            role="menuitem"
            className={styles.item}
            onClick={copyLink}
          >
            Copy link
          </button>
          <button
            type="button"
            role="menuitem"
            className={styles.item}
            onClick={copyPicture}
          >
            Copy image
          </button>
        </div>
      ) : null}
      <span className={styles.status} role="status" aria-live="polite">
        {status}
      </span>
    </div>
  );
}

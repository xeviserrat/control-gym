"use client";

import { cloneElement, isValidElement, useId, type ReactElement } from "react";
import { cn } from "@/lib/utils";

type TooltipSide = "top" | "bottom";

type TooltipProps = {
  readonly content: string;
  readonly side?: TooltipSide;
  readonly children: ReactElement;
};

const sideStyles: Record<TooltipSide, string> = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
};

export function Tooltip({
  content,
  side = "top",
  children,
}: TooltipProps) {
  const id = useId();

  if (!isValidElement(children)) {
    return children;
  }

  const child = cloneElement(children, {
    "aria-describedby": id,
    title: content,
  } as Record<string, string>);

  return (
    <span className="group/tooltip relative inline-flex">
      {child}
      <span
        id={id}
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 w-max max-w-[220px] rounded-lg",
          "border border-border bg-surface-elevated px-2.5 py-1.5 text-center",
          "text-xs font-medium leading-snug text-foreground shadow-md",
          "opacity-0 transition-opacity duration-150",
          "group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100",
          sideStyles[side],
        )}
      >
        {content}
      </span>
    </span>
  );
}

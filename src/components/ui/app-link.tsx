"use client";

import Link from "next/link";
import type { LinkProps } from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useLoading } from "@/components/providers/loading-provider";

function resolvePathname(href: LinkProps["href"]): string {
  if (typeof href === "string") {
    return href.split("?")[0] ?? href;
  }
  return href.pathname?.split("?")[0] ?? "";
}

function resolveSearch(href: LinkProps["href"]): string {
  if (typeof href === "string") {
    const query = href.split("?")[1];
    return query ?? "";
  }
  if (!href.search) return "";
  return href.search.startsWith("?") ? href.search.slice(1) : href.search;
}

function shouldNavigate(
  href: LinkProps["href"],
  pathname: string,
  currentSearch: string,
): boolean {
  const targetPath = resolvePathname(href);
  if (!targetPath.startsWith("/")) return false;

  const targetSearch = resolveSearch(href);
  if (targetPath !== pathname) return true;
  return targetSearch !== currentSearch;
}

export function AppLink({
  href,
  onClick,
  ...props
}: LinkProps & React.ComponentPropsWithoutRef<"a">) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startNavigation } = useLoading();
  const currentSearch = searchParams.toString();

  return (
    <Link
      href={href}
      onClick={(event) => {
        if (
          !event.defaultPrevented &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          event.button === 0 &&
          shouldNavigate(href, pathname, currentSearch)
        ) {
          startNavigation();
        }
        onClick?.(event);
      }}
      {...props}
    />
  );
}

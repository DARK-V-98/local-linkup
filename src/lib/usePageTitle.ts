import { useEffect } from "react";

export function usePageTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} — Needlyy` : "Needlyy | Sri Lanka's Local Service Marketplace";
    return () => { document.title = prev; };
  }, [title]);
}

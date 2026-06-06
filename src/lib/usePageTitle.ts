import { useEffect } from "react";

function setMeta(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}

function setOg(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.content = content;
}

export function usePageTitle(title: string, description?: string) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} — Needlyy`
      : "Needlyy | Sri Lanka's Local Service Marketplace";
    const desc = description ?? "Find and book verified local professionals across Sri Lanka — from web developers to plumbers, tutors to wedding photographers.";

    const prevTitle = document.title;
    document.title = fullTitle;

    setMeta("description", desc);
    setOg("og:title", fullTitle);
    setOg("og:description", desc);
    setOg("og:type", "website");
    setOg("og:site_name", "Needlyy");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", desc);

    return () => { document.title = prevTitle; };
  }, [title, description]);
}

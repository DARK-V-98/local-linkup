const SAVED_KEY = "needly_saved_services";

export function getSaved(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function isSaved(serviceId: string): boolean {
  return getSaved().includes(serviceId);
}

/** Toggles saved state. Returns true if now saved, false if removed. */
export function toggleSaved(serviceId: string): boolean {
  const current = getSaved();
  const exists = current.includes(serviceId);
  if (exists) {
    localStorage.setItem(SAVED_KEY, JSON.stringify(current.filter((id) => id !== serviceId)));
    return false;
  } else {
    localStorage.setItem(SAVED_KEY, JSON.stringify([...current, serviceId]));
    return true;
  }
}

export function clearSaved(): void {
  localStorage.removeItem(SAVED_KEY);
}

type UrlPersistence = {
  schedule: () => void;
  saveNow: () => void;
  cancel: () => void;
};

/** Read every store node so Solid tracks nested changes without encoding them. */
export const trackStore = (value: unknown): void => {
  if (value === null || typeof value !== "object") return;

  for (const key of Object.keys(value)) {
    trackStore((value as Record<string, unknown>)[key]);
  }
};

export const createDebouncedUrlPersistence = (
  serialize: () => string,
  replaceUrl: (serialized: string) => void,
  delay = 100,
): UrlPersistence => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastSerialized: string | undefined;

  const flush = () => {
    timer = undefined;
    const serialized = serialize();
    if (serialized === lastSerialized) return;

    lastSerialized = serialized;
    replaceUrl(serialized);
  };

  return {
    schedule() {
      if (timer !== undefined) clearTimeout(timer);
      timer = setTimeout(flush, delay);
    },
    saveNow() {
      if (timer !== undefined) {
        clearTimeout(timer);
        timer = undefined;
      }
      flush();
    },
    cancel() {
      if (timer !== undefined) clearTimeout(timer);
      timer = undefined;
    },
  };
};

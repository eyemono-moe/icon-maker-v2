type UrlPersistence = {
  schedule: () => void;
  saveNow: () => void;
  cancel: () => void;
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

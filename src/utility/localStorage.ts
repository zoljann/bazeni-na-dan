interface Storage {
  isSupported: boolean;
  getItem: (key: string) => unknown;
  removeItem: (key: string) => void;
  setItem: (key: string, value: unknown) => unknown;
}

const isSupported = (): boolean => {
  const test = "localStorage";

  try {
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (_e) {
    return false;
  }
};

export const localStorage: Storage = {
  isSupported: isSupported(),
  getItem(key: string) {
    if (!this.isSupported) return null;

    const value = localStorage.getItem(key);

    try {
      return JSON.parse(value as string);
    } catch (_e) {
      return value;
    }
  },
  removeItem(key: string) {
    if (!this.isSupported) return;

    localStorage.removeItem(key);
  },
  setItem(key: string, value: unknown) {
    if (!this.isSupported) return null;

    let valueToStore = value;
    if (value) valueToStore = JSON.stringify(value);

    localStorage.setItem(key, valueToStore as string);
    return this.getItem(key);
  },
};

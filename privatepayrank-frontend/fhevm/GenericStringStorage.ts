export class GenericStringStorage {
  private storage: Record<string, string> = {};

  get(key: string): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(key);
    }
    return this.storage[key] || null;
  }

  set(key: string, value: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value);
    } else {
      this.storage[key] = value;
    }
  }

  remove(key: string): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    } else {
      delete this.storage[key];
    }
  }
}






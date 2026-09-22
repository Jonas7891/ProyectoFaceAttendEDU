// In-memory stores with soft-delete, matching 06-data conventions.
export function nowIso(): string {
  return new Date().toISOString();
}

export class MemoryStore<T extends Record<string, unknown>> {
  private items = new Map<string, T>();
  private seq = 1;
  constructor(private readonly idField: string) {}

  create(data: Record<string, unknown>, stringId = false): T {
    const now = nowIso();
    const id: string | number = stringId
      ? `case-${Date.now()}-${Math.floor(Math.random() * 10000)}`
      : this.seq++;
    const record = { [this.idField]: id, ...data, createdAt: now, updatedAt: now, deletedAt: null } as unknown as T;
    this.items.set(String(id), record);
    return record;
  }

  list(filter?: (r: T) => boolean): T[] {
    const out: T[] = [];
    for (const r of this.items.values()) {
      if ((r as Record<string, unknown>)['deletedAt']) continue;
      if (filter && !filter(r)) continue;
      out.push(r);
    }
    return out;
  }

  get(id: string | number): T | null {
    const r = this.items.get(String(id)) ?? null;
    if (!r || (r as Record<string, unknown>)['deletedAt']) return null;
    return r;
  }

  update(id: string | number, patch: Partial<T>): T | null {
    const current = this.items.get(String(id));
    if (!current || (current as Record<string, unknown>)['deletedAt']) return null;
    const updated = { ...current, ...patch, updatedAt: nowIso() } as T;
    (updated as Record<string, unknown>)[this.idField] = (current as Record<string, unknown>)[this.idField];
    this.items.set(String(id), updated);
    return updated;
  }

  remove(id: string | number): boolean {
    const current = this.items.get(String(id));
    if (!current || (current as Record<string, unknown>)['deletedAt']) return false;
    (current as Record<string, unknown>)['deletedAt'] = nowIso();
    (current as Record<string, unknown>)['updatedAt'] = nowIso();
    return true;
  }
}

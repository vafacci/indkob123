import { neon } from "@neondatabase/serverless";

export type Item = {
  id: string;
  name: string;
  quantity: string | null;
  is_checked: boolean;
  added_by: string;
  created_at: string;
  checked_at: string | null;
};

// Oprettes først når den bruges (så build virker uden DATABASE_URL)
export function db() {
  return neon(process.env.DATABASE_URL!);
}

export async function fetchItems(): Promise<Item[]> {
  const rows = await db()`select * from items`;
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    quantity: r.quantity,
    is_checked: r.is_checked,
    added_by: r.added_by,
    created_at: new Date(r.created_at).toISOString(),
    checked_at: r.checked_at ? new Date(r.checked_at).toISOString() : null,
  }));
}

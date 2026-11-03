"use client";

import { useEffect, useRef, useState } from "react";
import {
  addItem as addItemAction,
  clearChecked as clearCheckedAction,
  listItems,
  logout,
  removeItem as removeItemAction,
  setChecked,
} from "@/app/actions";
import type { Item } from "@/lib/items";

const COLORS = ["bg-sky-500", "bg-pink-500", "bg-amber-500", "bg-violet-500", "bg-emerald-500"];
const POLL_MS = 3000;

// Samme navn giver altid samme farve
function colorFor(name: string) {
  let h = 0;
  for (const c of name.toLowerCase()) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return COLORS[h % COLORS.length];
}

export default function ShoppingList({ user, initialItems }: { user: string; initialItems: Item[] }) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // Tæller ændringer, så en hentning der er startet før en ændring ikke overskriver den
  const changes = useRef(0);
  const pending = useRef(0);

  // ---------- "Realtime": hent listen jævnligt ----------
  useEffect(() => {
    async function refresh() {
      if (document.visibilityState !== "visible" || pending.current > 0) return;
      const startedAt = changes.current;
      try {
        const fresh = await listItems();
        if (changes.current === startedAt && pending.current === 0) setItems(fresh);
      } catch {
        // ignorer midlertidige netværksfejl
      }
    }
    const timer = setInterval(refresh, POLL_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  // Kører en ændring optimistisk: opdater skærmen nu, gem i baggrunden, rul tilbage ved fejl
  async function mutate(apply: () => void, save: () => Promise<unknown>, rollback: () => void, fejl: string) {
    changes.current++;
    pending.current++;
    apply();
    setError(null);
    try {
      await save();
    } catch {
      rollback();
      setError(fejl);
    } finally {
      pending.current--;
      changes.current++;
    }
  }

  function addItem(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const ny: Item = {
      id: crypto.randomUUID(),
      name: trimmed,
      quantity: quantity.trim() || null,
      is_checked: false,
      added_by: user,
      created_at: new Date().toISOString(),
      checked_at: null,
    };
    setName("");
    setQuantity("");
    nameRef.current?.focus();
    mutate(
      () => setItems((p) => [...p, ny]),
      () => addItemAction(ny.id, ny.name, ny.quantity),
      () => setItems((p) => p.filter((i) => i.id !== ny.id)),
      "Kunne ikke tilføje varen. Prøv igen."
    );
  }

  function toggle(item: Item) {
    const is_checked = !item.is_checked;
    const checked_at = is_checked ? new Date().toISOString() : null;
    mutate(
      () => setItems((p) => p.map((i) => (i.id === item.id ? { ...i, is_checked, checked_at } : i))),
      () => setChecked(item.id, is_checked),
      () => setItems((p) => p.map((i) => (i.id === item.id ? item : i))),
      "Kunne ikke opdatere varen."
    );
  }

  function remove(item: Item) {
    mutate(
      () => setItems((p) => p.filter((i) => i.id !== item.id)),
      () => removeItemAction(item.id),
      () => setItems((p) => [...p, item]),
      "Kunne ikke slette varen."
    );
  }

  function clearChecked() {
    const fjernes = items.filter((i) => i.is_checked);
    if (fjernes.length === 0) return;
    mutate(
      () => setItems((p) => p.filter((i) => !i.is_checked)),
      () => clearCheckedAction(),
      () => setItems((p) => [...p, ...fjernes]),
      "Kunne ikke rydde købte varer."
    );
  }

  // ---------- Visning ----------
  const todo = items
    .filter((i) => !i.is_checked)
    .sort((a, b) => b.created_at.localeCompare(a.created_at)); // nyeste øverst
  const bought = items
    .filter((i) => i.is_checked)
    .sort((a, b) => (b.checked_at ?? "").localeCompare(a.checked_at ?? ""));

  return (
    <main className="mx-auto min-h-dvh max-w-md px-4 pb-24 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">🛒 Indkøbsliste</h1>
        <form action={logout}>
          <button className="h-10 rounded-xl px-3 text-sm text-slate-500 active:bg-slate-200 dark:text-slate-400 dark:active:bg-slate-800">
            Log ud ({user})
          </button>
        </form>
      </header>

      <form onSubmit={addItem} className="mb-2 flex gap-2">
        <input
          ref={nameRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tilføj vare…"
          enterKeyHint="done"
          className="h-14 min-w-0 flex-1 rounded-2xl border border-slate-300 bg-white px-4 text-lg outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800"
        />
        <input
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Antal"
          enterKeyHint="done"
          className="h-14 w-24 rounded-2xl border border-slate-300 bg-white px-3 text-lg outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800"
        />
        <button
          type="submit"
          aria-label="Tilføj"
          className="h-14 w-14 rounded-2xl bg-green-600 text-3xl leading-none text-white active:bg-green-700"
        >
          +
        </button>
      </form>

      {error && <p className="mb-2 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <ul className="mt-4 flex flex-col gap-2">
        {todo.length === 0 && (
          <li className="py-8 text-center text-slate-500 dark:text-slate-400">Listen er tom 🎉</li>
        )}
        {todo.map((item) => (
          <Row key={item.id} item={item} onToggle={toggle} onRemove={remove} />
        ))}
      </ul>

      {bought.length > 0 && (
        <section className="mt-8">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Købt ({bought.length})
            </h2>
            <button
              onClick={clearChecked}
              className="h-10 rounded-xl px-3 text-sm font-medium text-red-600 active:bg-red-100 dark:text-red-400 dark:active:bg-red-950"
            >
              Ryd købte
            </button>
          </div>
          <ul className="flex flex-col gap-2">
            {bought.map((item) => (
              <Row key={item.id} item={item} onToggle={toggle} onRemove={remove} />
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

function Row({
  item,
  onToggle,
  onRemove,
}: {
  item: Item;
  onToggle: (i: Item) => void;
  onRemove: (i: Item) => void;
}) {
  return (
    <li className="flex items-center rounded-2xl bg-white shadow-sm dark:bg-slate-800">
      <button
        onClick={() => onToggle(item)}
        className="flex min-h-16 min-w-0 flex-1 items-center gap-3 px-4 text-left"
      >
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm ${
            item.is_checked
              ? "border-green-600 bg-green-600 text-white"
              : "border-slate-300 dark:border-slate-600"
          }`}
        >
          {item.is_checked && "✓"}
        </span>
        <span
          className={`min-w-0 flex-1 truncate text-lg ${
            item.is_checked ? "text-slate-400 line-through dark:text-slate-500" : ""
          }`}
        >
          {item.name}
          {item.quantity && (
            <span className="ml-2 text-base text-slate-500 dark:text-slate-400">{item.quantity}</span>
          )}
        </span>
        <span
          title={item.added_by}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${colorFor(item.added_by)}`}
        >
          {item.added_by[0]?.toUpperCase()}
        </span>
      </button>
      <button
        onClick={() => onRemove(item)}
        aria-label={`Slet ${item.name}`}
        className="h-16 w-14 shrink-0 text-xl text-slate-400 active:text-red-600"
      >
        ✕
      </button>
    </li>
  );
}

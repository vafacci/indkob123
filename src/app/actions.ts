"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getUser } from "@/lib/auth";
import { COOKIE_NAME, createSessionValue } from "@/lib/session";
import { db, fetchItems, type Item } from "@/lib/items";

async function requireUser() {
  const user = await getUser();
  if (!user) throw new Error("Ikke logget ind");
  return user;
}

// ---------- Login ----------
export async function login(_prev: string | null, formData: FormData): Promise<string | null> {
  const name = String(formData.get("name") ?? "").trim().slice(0, 30);
  // Telefoner sætter ofte mellemrum efter ordet og stort begyndelsesbogstav – det ignorerer vi
  const password = String(formData.get("password") ?? "").trim().toLowerCase();
  const expected = (process.env.APP_PASSWORD ?? "").trim().toLowerCase();

  if (!name) return "Skriv dit navn.";
  if (!expected || password !== expected) {
    return "Forkert adgangskode.";
  }

  const store = await cookies();
  store.set(COOKIE_NAME, await createSessionValue(name), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 år
    path: "/",
  });
  redirect("/");
}

export async function logout() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
  redirect("/login");
}

// ---------- Varer ----------
export async function listItems(): Promise<Item[]> {
  await requireUser();
  return fetchItems();
}

export async function addItem(id: string, name: string, quantity: string | null) {
  const user = await requireUser();
  const n = name.trim().slice(0, 200);
  if (!n) return;
  const q = quantity?.trim().slice(0, 50) || null;
  await db()`insert into items (id, name, quantity, added_by) values (${id}, ${n}, ${q}, ${user})`;
}

export async function setChecked(id: string, checked: boolean) {
  await requireUser();
  await db()`update items set is_checked = ${checked}, checked_at = ${checked ? new Date().toISOString() : null} where id = ${id}`;
}

export async function removeItem(id: string) {
  await requireUser();
  await db()`delete from items where id = ${id}`;
}

export async function clearChecked() {
  await requireUser();
  await db()`delete from items where is_checked`;
}

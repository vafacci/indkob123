// Simpelt login: cookien indeholder navnet + en signatur (HMAC), så den ikke kan forfalskes.
// Bruger Web Crypto, så den virker både i middleware (edge) og på serveren.

export const COOKIE_NAME = "session";

async function sign(value: string): Promise<string> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET mangler");
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSessionValue(name: string): Promise<string> {
  const encoded = encodeURIComponent(name);
  return `${encoded}.${await sign(encoded)}`;
}

/** Returnerer navnet hvis cookien er gyldig, ellers null. */
export async function readSessionValue(value: string | undefined): Promise<string | null> {
  if (!value) return null;
  const i = value.lastIndexOf(".");
  if (i < 1) return null;
  const encoded = value.slice(0, i);
  const expected = await sign(encoded);
  const given = value.slice(i + 1);
  if (given.length !== expected.length) return null;
  let diff = 0;
  for (let k = 0; k < given.length; k++) diff |= given.charCodeAt(k) ^ expected.charCodeAt(k);
  if (diff !== 0) return null;
  try {
    return decodeURIComponent(encoded);
  } catch {
    return null;
  }
}

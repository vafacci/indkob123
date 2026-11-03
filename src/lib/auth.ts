import { cookies } from "next/headers";
import { COOKIE_NAME, readSessionValue } from "./session";

/** Navnet på den loggede bruger, eller null. */
export async function getUser(): Promise<string | null> {
  const store = await cookies();
  return readSessionValue(store.get(COOKIE_NAME)?.value);
}

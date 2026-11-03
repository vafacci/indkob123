import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, readSessionValue } from "@/lib/session";

// Sender alle der ikke er logget ind til /login.
export async function middleware(request: NextRequest) {
  const user = await readSessionValue(request.cookies.get(COOKIE_NAME)?.value);
  const erLogin = request.nextUrl.pathname.startsWith("/login");

  if (!user && !erLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|pwa-icon|apple-icon|icon).*)",
  ],
};

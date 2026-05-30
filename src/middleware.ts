import { NextResponse, type NextRequest } from "next/server";

// Basic-auth gate for /admin/*. Compares against BROADCAST_ADMIN_PASSWORD.
// Username is ignored — single-operator setup, browsers remember the
// credentials so the prompt happens once per session.
//
// When BROADCAST_ADMIN_PASSWORD is unset, the gate is open. Local dev runs
// without the env var and gets straight in; never deploy without setting it.

export function middleware(req: NextRequest) {
  const expected = process.env.BROADCAST_ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.next();
  }

  const header = req.headers.get("authorization");
  if (!header || !header.startsWith("Basic ")) {
    return new NextResponse("Auth required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="ClawCast Admin"' },
    });
  }

  const decoded = atob(header.slice("Basic ".length));
  // Format: "user:password" — user portion is ignored.
  const supplied = decoded.includes(":") ? decoded.split(":").slice(1).join(":") : "";
  if (supplied !== expected) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

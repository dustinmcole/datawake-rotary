import { NextRequest, NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const UNCORKED_DOMAIN = "fullertonuncorked.org";

// Public uncorked domain paths rewritten to /_uc/* internal routes
const UNCORKED_PUBLIC_PATHS = ["/", "/about", "/schedule", "/tickets", "/gallery", "/faq", "/contact"];

const isPublicRoute = createRouteMatcher([
  "/",
  "/about(.*)",
  "/programs(.*)",
  "/events(.*)",
  "/join(.*)",
  "/contact(.*)",
  "/uncorked(.*)",
  "/sponsors(.*)",
  "/vendors(.*)",
  "/vendor-interest(.*)",
  "/login(.*)",
  "/register(.*)",
  // Internal uncorked pages served via domain rewrite
  "/_uc(.*)",
  // Public APIs
  "/api/vendor-interest",
  "/api/pages(.*)",
  "/api/membership-inquiries",
  "/api/public(.*)",
  "/api/checkin/session",
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const hostname = req.headers.get("host") ?? "";
  const isUncorkedDomain =
    hostname === UNCORKED_DOMAIN ||
    hostname === `www.${UNCORKED_DOMAIN}`;

  if (isUncorkedDomain) {
    const { pathname } = req.nextUrl;

    // Rewrite public uncorked pages to /_uc/* internal routes
    if (UNCORKED_PUBLIC_PATHS.includes(pathname)) {
      const internalPath = pathname === "/" ? "/_uc" : `/_uc${pathname}`;
      const url = req.nextUrl.clone();
      url.pathname = internalPath;
      return NextResponse.rewrite(url);
    }

    // /sponsors, /vendor-interest, /vendors served directly — no rewrite needed
    return NextResponse.next();
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

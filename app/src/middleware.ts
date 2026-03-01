import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/portal(.*)',
  '/admin(.*)',
  '/uncorked-hub(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Skip rewrites for API, internal next paths, or static files
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.includes('.') ||
    url.pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  // Skip rewrites for shared top-level routes
  if (
    url.pathname.startsWith('/portal') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/uncorked-hub') ||
    url.pathname.startsWith('/login') ||
    url.pathname.startsWith('/register')
  ) {
    return NextResponse.next();
  }

  // Domain-based routing
  if (hostname.includes('fullertonuncorked.org')) {
    url.pathname = `/(uncorked)${url.pathname}`;
    return NextResponse.rewrite(url);
  } else {
    // Default to rotary (e.g., localhost)
    url.pathname = `/(rotary)${url.pathname}`;
    return NextResponse.rewrite(url);
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

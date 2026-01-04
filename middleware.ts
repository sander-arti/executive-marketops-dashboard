import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Temporarily disabled auth middleware to allow deployment
  // TODO: Re-enable after verifying basic deployment works
  return NextResponse.next();

  /* Original auth logic (commented out for debugging):
  try {
    const session = request.cookies.get('sb-fzptyrcduxazplnlmuoh-auth-token');
    const isLoginPage = request.nextUrl.pathname === '/login';

    if (!session && !isLoginPage) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (session && isLoginPage) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('[Middleware] Error:', error);
    return NextResponse.next();
  }
  */
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};

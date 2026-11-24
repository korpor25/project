import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  PENDING_APPROVAL_PATH,
  isAllowedWhilePending,
  isAwaitingApproval,
} from "@/lib/auth/userStatus";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh the session for both Server Components and Route Handlers.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Browsing events is public so search engines can index the listing and each
  // event page — those carry the terms customers actually search for, and the
  // pages already hide prices from signed-out visitors.
  //
  // Acting on an event still needs an account: picking booths off the plan and
  // the booking wizard both stay gated, and the plan is also where per-booth
  // prices are shown.
  const { pathname, search } = request.nextUrl;
  const isEventAction =
    /^\/events\/[^/]+\/(booths|book)(\/|$)/.test(pathname);
  if (isEventAction && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.search = `?next=${encodeURIComponent(pathname + search)}`;
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // An account still waiting on (or refused by) an admin keeps its session but
  // is parked on the waiting page. This is a signpost, not a security control:
  // the session is a real one, so the API has to reject PENDING callers too.
  if (user && isAwaitingApproval(user) && !isAllowedWhilePending(pathname)) {
    const pendingUrl = request.nextUrl.clone();
    pendingUrl.search = "";
    pendingUrl.pathname = PENDING_APPROVAL_PATH;
    return NextResponse.redirect(pendingUrl);
  }

  return response;
}

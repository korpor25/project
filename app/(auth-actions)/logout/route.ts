import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Logout endpoint. POST clears the Supabase session cookies and redirects home.
// We expose this as a route (instead of a server action) so the Navbar form
// works without React 19 server-action wiring on every layout.
export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const origin = new URL(request.url).origin;
  return NextResponse.redirect(`${origin}/`, { status: 303 });
}

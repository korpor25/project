import type { ReactNode } from "react";
import { Footer } from "@/components/shared/Footer";
import { Navbar } from "@/components/shared/Navbar";
import { ContactFAB } from "@/components/shared/ContactFAB";
import { WelcomeModal } from "@/components/shared/WelcomeModal";

export const dynamic = "force-dynamic";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ContactFAB />
      {/* Public pages only — an admin mid-shift does not need the intro clip. */}
      <WelcomeModal />
    </>
  );
}

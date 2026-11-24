import Image from "next/image";
import { fetchEvents } from "@/lib/api/events";
import { mallImage } from "@/lib/mallImages";

// Marble-like gradients — one per card (cycles if more branches than entries)
const MARBLE_TONES = [
  "from-[#e8e4dc] via-[#d4cfc5] to-[#c9c3b8]",
  "from-[#dcd8d0] via-[#ccc6bc] to-[#bfb9ae]",
  "from-[#e2ddd6] via-[#d0cac0] to-[#c4bdb2]",
  "from-[#dbd5cc] via-[#c8c2b8] to-[#bcb5aa]",
  "from-[#e0dbd3] via-[#cecac0] to-[#c2bdb2]",
];

export async function PartnerMalls() {
  const events = await fetchEvents();

  const seen = new Set<string>();
  const branches: string[] = [];
  for (const ev of events) {
    if (ev.branch && ev.branch !== "—" && !seen.has(ev.branch)) {
      seen.add(ev.branch);
      branches.push(ev.branch);
    }
  }

  if (branches.length === 0) return null;

  return (
    <section className="py-20 bg-background border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* header */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
            Our Partners
          </p>
          <h2 className="text-2xl font-bold sm:text-3xl">ห้างพันธมิตร</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            เราให้บริการในห้างชั้นนำทั่วประเทศ
          </p>
          <div className="mx-auto mt-3 h-0.5 w-12 rounded-full bg-primary" />
        </div>

        {/* mall cards */}
        <ul className="flex flex-wrap justify-center gap-5">
          {branches.map((name, i) => {
            const photo = mallImage(name);
            return (
              <li key={name} className="w-[180px]">
                <div className="group overflow-hidden rounded-2xl border border-border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40">
                  <div
                    className={`relative h-28 ${
                      photo
                        ? "bg-muted"
                        : `bg-gradient-to-br ${MARBLE_TONES[i % MARBLE_TONES.length]}`
                    }`}
                  >
                    {photo ? (
                      /* real mall photo */
                      <Image
                        src={photo}
                        alt={name}
                        fill
                        sizes="180px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <>
                        {/* marble vein lines — fallback when no photo yet */}
                        <svg className="absolute inset-0 h-full w-full opacity-20" aria-hidden>
                          <line x1="0" y1="30%" x2="100%" y2="60%" stroke="#9a8c7e" strokeWidth="0.8" />
                          <line x1="20%" y1="0" x2="70%" y2="100%" stroke="#9a8c7e" strokeWidth="0.5" />
                          <line x1="50%" y1="0" x2="100%" y2="80%" stroke="#a09282" strokeWidth="0.6" />
                          <line x1="0" y1="70%" x2="40%" y2="100%" stroke="#9a8c7e" strokeWidth="0.4" />
                        </svg>

                        {/* image slot label */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[10px] uppercase tracking-widest text-stone-400/60">
                            รูปห้าง
                          </span>
                        </div>
                      </>
                    )}

                    {/* name overlay bar */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent px-3 py-2">
                      <p className="text-sm font-semibold text-white leading-tight drop-shadow">
                        {name}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

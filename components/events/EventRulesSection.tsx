import { Ban, Check, ChevronDown, ShieldAlert } from "lucide-react";
import type { EventDetail } from "@/types/domain";
import { DEFAULT_RULES, DEFAULT_PROHIBITED } from "@/lib/rules";

export function EventRulesSection({ event }: { event: EventDetail }) {
  const visibleRules = DEFAULT_RULES.filter(
    (_, i) => !event.hiddenRules.includes(i),
  );
  const visibleProhibited = DEFAULT_PROHIBITED.filter(
    (_, i) => !event.hiddenProhibited.includes(i),
  );

  if (visibleRules.length === 0 && visibleProhibited.length === 0) return null;

  return (
    <section className="mt-8 grid gap-4 sm:mt-10 md:grid-cols-2">
      {visibleRules.length > 0 && (
        <>
          {/* Seven rules stacked is the single tallest block on a phone, and it
              is reference material rather than something you read on the way to
              booking — so it folds away here and stays open from md. */}
          <details className="rounded-xl border border-border bg-card md:hidden">
            <summary className="flex cursor-pointer list-none items-center gap-2 p-5">
              <RulesIcon />
              <h3 className="text-base font-semibold">กฎระเบียบการใช้พื้นที่</h3>
              <span className="ml-auto text-xs text-muted-foreground">
                {visibleRules.length} ข้อ
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform [details[open]_&]:rotate-180" />
            </summary>
            <div className="px-5 pb-5">
              <RulesList rules={visibleRules} />
            </div>
          </details>

          <div className="hidden rounded-xl border border-border bg-card p-5 md:block">
            <div className="mb-4 flex items-center gap-2">
              <RulesIcon />
              <h3 className="text-base font-semibold">กฎระเบียบการใช้พื้นที่</h3>
            </div>
            <RulesList rules={visibleRules} />
          </div>
        </>
      )}

      {visibleProhibited.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2 sm:mb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger-soft text-danger">
              <Ban className="h-4 w-4" />
            </span>
            <h3 className="text-base font-semibold">ประเภทสินค้าที่ไม่อนุญาต</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {visibleProhibited.map((item) => (
              <span
                key={item}
                className="flex items-center gap-1.5 rounded-full border border-danger/30 bg-danger-soft px-3 py-1 text-xs font-medium text-danger"
              >
                <Ban className="h-3 w-3 shrink-0" />
                {item}
              </span>
            ))}
          </div>
          <p className="mt-4 text-[11px] text-muted-foreground">
            * สินค้าและบริการดังกล่าวไม่ได้รับอนุญาตให้จำหน่ายภายในงาน หากฝ่าฝืนถือว่าผิดเงื่อนไขสัญญา
          </p>
        </div>
      )}
    </section>
  );
}

function RulesIcon() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
      <ShieldAlert className="h-4 w-4" />
    </span>
  );
}

/** Shared by the phone accordion and the always-open desktop card. */
function RulesList({ rules }: { rules: readonly string[] }) {
  return (
    <ul className="space-y-2.5">
      {rules.map((rule) => (
        <li key={rule} className="flex items-start gap-2.5 text-sm">
          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-white">
            <Check className="h-2.5 w-2.5" />
          </span>
          <span>{rule}</span>
        </li>
      ))}
    </ul>
  );
}

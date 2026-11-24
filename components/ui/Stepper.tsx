import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepperStep = { label: string };

export function Stepper({
  steps,
  current,
}: {
  steps: StepperStep[];
  /** Zero-based index of the active step. */
  current: number;
}) {
  return (
    <ol className="flex w-full items-center gap-2 sm:gap-3">
      {steps.map((s, i) => {
        const state =
          i < current ? "done" : i === current ? "active" : "todo";
        return (
          <li
            key={s.label}
            className="flex flex-1 items-center gap-2 sm:gap-3"
          >
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                state === "done" && "bg-success text-white",
                state === "active" && "bg-primary text-primary-foreground",
                state === "todo" && "bg-muted text-muted-foreground",
              )}
            >
              {state === "done" ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span
              className={cn(
                "hidden text-sm sm:inline",
                state === "todo" ? "text-muted-foreground" : "font-medium",
              )}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "h-px flex-1",
                  state === "done" ? "bg-success/40" : "bg-border",
                )}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

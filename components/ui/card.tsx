import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-cyan-300/20 bg-slate-900/55 backdrop-blur-xl shadow-[0_20px_80px_rgba(2,132,199,0.18)]",
        className,
      )}
      {...props}
    />
  );
}

import { cn } from "@/lib/utils";
import { getStageStyle } from "@/lib/stages";

export function StageBadge({
  stage,
  className,
}: {
  stage: string;
  className?: string;
}) {
  const style = getStageStyle(stage);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs font-medium leading-4",
        style.badge,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} aria-hidden />
      {stage}
    </span>
  );
}

import { cn } from "@lib/utils";
import type { CSSProperties, ReactNode } from "react";

export interface ScalesProps {
  orientation?: "horizontal" | "vertical" | "diagonal";
  size?: number;
  className?: string;
  color?: string;
}

export const Scales = ({
  orientation = "diagonal",
  size = 10,
  className,
  color,
}: ScalesProps) => {
  const angle = orientation === "horizontal" ? "0deg" : orientation === "vertical" ? "90deg" : "315deg";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full overflow-hidden",
        "[--pattern-scales:rgb(10_10_10_/_0.1)] dark:[--pattern-scales:rgb(255_255_255_/_0.1)]",
        className,
      )}
      style={
        {
          "--scales-size": `${size}px`,
          "--scales-angle": angle,
          ...(color && { "--pattern-scales": color }),
        } as CSSProperties
      }
    >
      <div
        className="h-full w-full"
        style={{
          backgroundImage: "repeating-linear-gradient(var(--scales-angle), var(--pattern-scales) 0, var(--pattern-scales) 1px, transparent 0, transparent 50%)",
          backgroundSize: "var(--scales-size) var(--scales-size)",
        }}
      />
    </div>
  );
};

export interface ScalesContainerProps extends ScalesProps {
  children?: ReactNode;
  containerClassName?: string;
}

export const ScalesContainer = ({
  children,
  orientation = "diagonal",
  size = 10,
  className,
  containerClassName,
  color,
}: ScalesContainerProps) => (
  <div className={cn("relative", containerClassName)}>
    <Scales orientation={orientation} size={size} className={className} color={color} />
    <div className="relative z-10">{children}</div>
  </div>
);

export default Scales;
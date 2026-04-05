import React from "react";
import { cn } from "../../utils/utils";

const Card = React.forwardRef(({ className, elevated = false, featured = false, ...props }, ref) => {
  if (featured) {
    return (
      <div className={cn("rounded-xl bg-gradient-to-br from-accent via-accent-secondary to-accent p-[2px] transition-all duration-300 hover:shadow-accent-lg group", className)}>
        <div 
          ref={ref}
          className="h-full w-full rounded-[calc(12px-2px)] bg-card p-6"
          {...props}
        />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-border bg-card text-foreground transition-all duration-300 group relative overflow-hidden",
        elevated ? "shadow-lg hover:shadow-xl hover:-translate-y-1" : "shadow-md hover:shadow-lg hover:-translate-y-1",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative z-10 p-6">
        {props.children}
      </div>
    </div>
  );
});
Card.displayName = "Card";

export { Card };

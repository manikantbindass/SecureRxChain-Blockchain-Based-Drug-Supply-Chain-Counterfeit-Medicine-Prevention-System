import React from "react";
import { cn } from "../../utils/utils";

function Badge({ className, children, animatedDot = true, ...props }) {
  return (
    <div 
      className={cn(
        "inline-flex items-center gap-3 rounded-full border border-accent/30 bg-accent/5 px-5 py-2",
        className
      )} 
      {...props}
    >
      <span className={cn("h-2 w-2 rounded-full bg-accent", animatedDot && "animate-pulse-slow")} />
      <span className="font-mono text-xs uppercase tracking-[0.15em] text-accent">
        {children}
      </span>
    </div>
  );
}

export { Badge };

import React from 'react';
import { cn } from '../../utils/utils';

const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', asChild = false, ...props }, ref) => {
  const Comp = asChild ? React.Fragment : "button";
  
  const baseStyles = "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background active:scale-[0.98]";
  
  const variants = {
    primary: "bg-gradient-to-r from-accent to-[#4D7CFF] text-white shadow-sm hover:-translate-y-0.5 hover:shadow-accent-lg hover:brightness-110",
    secondary: "bg-muted text-foreground hover:bg-muted/80",
    outline: "border border-border bg-transparent hover:bg-accent/5 hover:border-accent/30 hover:shadow-sm text-foreground",
    ghost: "bg-transparent text-muted-foreground hover:bg-accent/5 hover:text-foreground",
  };
  
  const sizes = {
    default: "h-12 py-2 px-6",
    sm: "h-9 px-3 rounded-md",
    lg: "h-14 px-8 rounded-xl text-base",
    icon: "h-12 w-12",
  };

  return (
    <Comp
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button };

import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {/* <label style={{ fontSize: "0.9rem", fontWeight: 500 }}>{label}</label> */}
      <input
        type={type}
        className={cn(
          // "flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        style={{
          padding: "0.75rem",
          borderRadius: "6px",
          border: "1px solid var(--border)",
          fontSize: "1rem",
          outline: "none",
          width: "100%",
          transition: "border-color 0.2s",
        }}
        ref={ref}
        {...props}
      />
    </div>
  );
});
Input.displayName = "Input";

export { Input };

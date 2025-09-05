import React from "react";

export function Popover({ children }: { children: React.ReactNode }) {
  return <div className="relative inline-block">{children}</div>;
}

export function PopoverTrigger({ children, onClick }: { children: React.ReactNode; onClick?:()=>void }) {
  return (
    <div onClick={onClick} className="cursor-pointer">
      {children}
    </div>
  );
}

export function PopoverContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute bottom-8 right-0 bg-popover border border-border rounded-md shadow-md p-3 z-50">
      {children}
    </div>
  );
}
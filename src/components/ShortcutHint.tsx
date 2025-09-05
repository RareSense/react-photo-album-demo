import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

export default function ShortcutHint() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center justify-end">
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
        <Info className="h-4 w-4 mr-1" /> Shortcuts
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative bg-card text-card-foreground border border-border rounded-xl p-4 w-[360px] shadow-xl">
            <div className="font-semibold text-sm mb-2">Keyboard Shortcuts</div>
            <ul className="text-xs space-y-1">
              <li><kbd className="px-1 py-0.5 bg-muted rounded">← ↑ → ↓</kbd> Move crop rectangle</li>
              <li><kbd className="px-1 py-0.5 bg-muted rounded">Shift</kbd> + Arrows → Faster move</li>
              <li>Drag inside rectangle → Move</li>
              <li>Drag a corner handle → Resize (aspect stays 0.75)</li>
            </ul>
            <div className="mt-3 text-right">
              <Button size="sm" onClick={() => setOpen(false)}>OK</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
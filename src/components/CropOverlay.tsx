import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export type NormRect = { x:number; y:number; w:number; h:number };

type Props = {
  src:string;
  naturalW:number;
  naturalH:number;
  photoW:number;
  photoH:number;
  rect:NormRect;
  setRect:(r:NormRect)=>void;
  onDelete:()=>void;
};

type Handle="nw"|"ne"|"sw"|"se"|"n"|"s"|"e"|"w"|null;
const ASPECT_RATIO = 0.75; // width/height = 0.75 (PORTRAIT - taller than wide)
const MIN_WIDTH = 0.06; // Minimum width (height will be width / 0.75)

export default function CropOverlay({src,naturalW,naturalH,photoW,photoH,rect,setRect,onDelete}:Props){
  const wrapRef=useRef<HTMLDivElement>(null);
  const [dragging,setDragging]=useState(false);
  const [dragStart,setDragStart]=useState<{x:number;y:number}|null>(null);
  const [rectStart,setRectStart]=useState<NormRect|null>(null);
  const [resizing,setResizing]=useState<Handle>(null);
  const [resizeStart,setResizeStart]=useState<{x:number;y:number}|null>(null);
  const [rectResizeStart,setRectResizeStart]=useState<NormRect|null>(null);

  // Ensure rectangle stays within bounds and maintains STRICT 0.75 aspect ratio (PORTRAIT)
  const validateRect = (r: NormRect, preserveSize = false): NormRect => {
    let { x, y, w, h } = r;
    
    if (!preserveSize) {
      // CORRECT 0.75 aspect ratio: width = height * 0.75 (PORTRAIT orientation)
      // Use width as primary dimension to match your Python reference
      w = Math.max(MIN_WIDTH, w);
      h = w / ASPECT_RATIO; // height = width / 0.75 - makes it TALLER
      
      // If height exceeds bounds, use height as primary and adjust width
      if (h > 1) {
        h = 1;
        w = h * ASPECT_RATIO; // width = height * 0.75
      }
      
      // Double-check width bounds
      if (w > 1) {
        w = 1;
        h = w / ASPECT_RATIO;
      }
    }
    
    // Clamp position to keep rectangle fully inside
    x = Math.max(0, Math.min(x, 1 - w));
    y = Math.max(0, Math.min(y, 1 - h));
    
    return { x, y, w, h };
  };

  // Start dragging the rectangle (move without resize)
  const onDownRect=(e:React.MouseEvent)=>{
    e.preventDefault(); 
    e.stopPropagation();
    setDragging(true);
    setDragStart({x:e.clientX, y:e.clientY});
    setRectStart({...rect});
  };

  // Start resizing from any handle
  const startResize=(handle:Handle)=>(e:React.MouseEvent)=>{
    e.preventDefault(); 
    e.stopPropagation();
    setResizing(handle);
    setResizeStart({x:e.clientX, y:e.clientY});
    setRectResizeStart({...rect});
  };

  // Handle mouse movement for drag/resize
  const onMove=(e:React.MouseEvent)=>{
    if (resizing && resizeStart && rectResizeStart) {
      const dx = (e.clientX - resizeStart.x) / photoW;
      const dy = (e.clientY - resizeStart.y) / photoH;
      const newRect = performResize(rectResizeStart, resizing, dx, dy);
      setRect(validateRect(newRect));
      return;
    }
    
    if (dragging && dragStart && rectStart) {
      const dx = (e.clientX - dragStart.x) / photoW;
      const dy = (e.clientY - dragStart.y) / photoH;
      const newRect = {
        x: rectStart.x + dx,
        y: rectStart.y + dy,
        w: rectStart.w, // Preserve original width
        h: rectStart.h  // Preserve original height
      };
      setRect(validateRect(newRect, true));
    }
  };

  // End drag/resize operations
  const endOperation = () => {
    setDragging(false);
    setResizing(null);
    setDragStart(null);
    setResizeStart(null);
    setRectStart(null);
    setRectResizeStart(null);
  };

  // Calculate absolute pixel positions
  const abs = {
    left: rect.x * photoW,
    top: rect.y * photoH,
    width: rect.w * photoW,
    height: rect.h * photoH
  };

  return(
    <div
      ref={wrapRef}
      className="absolute inset-0 outline-none z-10 select-none"
      onMouseMove={onMove} 
      onMouseUp={endOperation} 
      onMouseLeave={endOperation}
      style={{ cursor: dragging ? 'move' : 'default' }}
    >
      {/* Main crop rectangle */}
      <div
        className="absolute ring-2 ring-white/95 rounded-sm cursor-move bg-white/10"
        style={{ 
          left: abs.left, 
          top: abs.top, 
          width: abs.width, 
          height: abs.height 
        }}
        onMouseDown={onDownRect}
      />

      {/* Delete button (RED) */}
      <div className="absolute left-1 top-1 z-30">
        <Button 
          size="icon" 
          className="h-6 w-6 bg-red-600 hover:bg-red-700 text-white border-0 shadow-md"
          onClick={(e) => { 
            e.stopPropagation(); 
            e.preventDefault();
            onDelete(); 
          }}
          title="Delete image"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {/* ALL 8 RESIZE HANDLES - 4 corners + 4 edges */}
      
      {/* Corner handles */}
      <ResizeHandle 
        position={{ left: abs.left - 6, top: abs.top - 6 }}
        cursor="nw-resize"
        onMouseDown={startResize("nw")}
        isCorner={true}
      />
      <ResizeHandle 
        position={{ left: abs.left + abs.width - 6, top: abs.top - 6 }}
        cursor="ne-resize"
        onMouseDown={startResize("ne")}
        isCorner={true}
      />
      <ResizeHandle 
        position={{ left: abs.left - 6, top: abs.top + abs.height - 6 }}
        cursor="sw-resize"
        onMouseDown={startResize("sw")}
        isCorner={true}
      />
      <ResizeHandle 
        position={{ left: abs.left + abs.width - 6, top: abs.top + abs.height - 6 }}
        cursor="se-resize"
        onMouseDown={startResize("se")}
        isCorner={true}
      />

      {/* Edge handles (center of each side) */}
      <ResizeHandle 
        position={{ left: abs.left + abs.width/2 - 6, top: abs.top - 6 }}
        cursor="n-resize"
        onMouseDown={startResize("n")}
        isCorner={false}
      />
      <ResizeHandle 
        position={{ left: abs.left + abs.width/2 - 6, top: abs.top + abs.height - 6 }}
        cursor="s-resize"
        onMouseDown={startResize("s")}
        isCorner={false}
      />
      <ResizeHandle 
        position={{ left: abs.left - 6, top: abs.top + abs.height/2 - 6 }}
        cursor="w-resize"
        onMouseDown={startResize("w")}
        isCorner={false}
      />
      <ResizeHandle 
        position={{ left: abs.left + abs.width - 6, top: abs.top + abs.height/2 - 6 }}
        cursor="e-resize"
        onMouseDown={startResize("e")}
        isCorner={false}
      />
    </div>
  );
}

// Resize handle component - Different styles for corners vs edges
const ResizeHandle: React.FC<{
  position: { left: number; top: number };
  cursor: string;
  onMouseDown: (e: React.MouseEvent) => void;
  isCorner: boolean;
}> = ({ position, cursor, onMouseDown, isCorner }) => (
  <div 
    className={`absolute bg-white border border-gray-600 shadow-sm hover:bg-gray-100 transition-colors ${
      isCorner ? 'rounded-sm' : 'rounded-full'
    }`}
    style={{ 
      left: position.left, 
      top: position.top,
      width: isCorner ? '9px' : '8px',    // Corners match 0.75 ratio visually
      height: isCorner ? '12px' : '8px',  // 9/12 = 0.75 aspect ratio
      cursor: cursor
    }} 
    onMouseDown={onMouseDown}
  />
);

// COMPLETELY REWRITTEN: Proper resize logic that maintains EXACT 0.75 ratio (PORTRAIT)
function performResize(startRect: NormRect, handle: Handle, dx: number, dy: number): NormRect {
  const { x, y, w, h } = startRect;
  
  // Different logic for corner vs edge handles
  switch (handle) {
    // CORNER HANDLES: Maintain 0.75 ratio, use larger movement
    case "se": { // Southeast: grow from top-left anchor
      const movement = Math.max(Math.abs(dx), Math.abs(dy));
      const grow = (dx > 0 || dy > 0) ? movement : -movement;
      const newW = Math.max(MIN_WIDTH, w + grow);
      const newH = newW / ASPECT_RATIO; // height = width / 0.75
      return { x, y, w: newW, h: newH };
    }
    
    case "sw": { // Southwest: grow from top-right anchor  
      const movement = Math.max(Math.abs(dx), Math.abs(dy));
      const grow = (-dx > 0 || dy > 0) ? movement : -movement;
      const newW = Math.max(MIN_WIDTH, w + grow);
      const newH = newW / ASPECT_RATIO;
      return { 
        x: x + (w - newW), // Adjust x to keep right edge fixed
        y, 
        w: newW, 
        h: newH 
      };
    }
    
    case "ne": { // Northeast: grow from bottom-left anchor
      const movement = Math.max(Math.abs(dx), Math.abs(dy));
      const grow = (dx > 0 || -dy > 0) ? movement : -movement;
      const newW = Math.max(MIN_WIDTH, w + grow);
      const newH = newW / ASPECT_RATIO;
      return { 
        x, 
        y: y + (h - newH), // Adjust y to keep bottom edge fixed
        w: newW, 
        h: newH 
      };
    }
    
    case "nw": { // Northwest: grow from bottom-right anchor
      const movement = Math.max(Math.abs(dx), Math.abs(dy));
      const grow = (-dx > 0 || -dy > 0) ? movement : -movement;
      const newW = Math.max(MIN_WIDTH, w + grow);
      const newH = newW / ASPECT_RATIO;
      return { 
        x: x + (w - newW), // Adjust x to keep right edge fixed
        y: y + (h - newH), // Adjust y to keep bottom edge fixed
        w: newW, 
        h: newH 
      };
    }

    // EDGE HANDLES: Maintain 0.75 ratio, resize from specific edge
    case "n": { // North: adjust height, keep bottom fixed
      const newH = Math.max(MIN_WIDTH / ASPECT_RATIO, h - dy);
      const newW = newH * ASPECT_RATIO;
      return {
        x: x + (w - newW) / 2, // Center horizontally
        y: y + (h - newH),     // Move top edge up
        w: newW,
        h: newH
      };
    }

    case "s": { // South: adjust height, keep top fixed
      const newH = Math.max(MIN_WIDTH / ASPECT_RATIO, h + dy);
      const newW = newH * ASPECT_RATIO;
      return {
        x: x + (w - newW) / 2, // Center horizontally
        y,                     // Keep top edge fixed
        w: newW,
        h: newH
      };
    }

    case "w": { // West: adjust width, keep right fixed
      const newW = Math.max(MIN_WIDTH, w - dx);
      const newH = newW / ASPECT_RATIO;
      return {
        x: x + (w - newW),     // Move left edge left
        y: y + (h - newH) / 2, // Center vertically
        w: newW,
        h: newH
      };
    }

    case "e": { // East: adjust width, keep left fixed
      const newW = Math.max(MIN_WIDTH, w + dx);
      const newH = newW / ASPECT_RATIO;
      return {
        x,                     // Keep left edge fixed
        y: y + (h - newH) / 2, // Center vertically
        w: newW,
        h: newH
      };
    }
    
    default:
      return startRect;
  }
}
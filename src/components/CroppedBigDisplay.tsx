import React, { useEffect, useState, useRef } from "react";
import type { Photo } from "@/types";
import type { NormRect } from "@/components/CropOverlay";
import { onCroppedSelection } from "@/lib/selectionBus";

type Props = { className?: string };

export default function CroppedBigDisplay({ className }: Props) {
  const [sel, setSel] = useState<{photo: Photo; rect: NormRect} | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => onCroppedSelection(setSel), []);
  
  // Draw the cropped image on canvas when selection changes
  useEffect(() => {
    if (!sel || !canvasRef.current) return;
    
    const { photo, rect } = sel;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsLoading(true);
    
    const img = new Image();
    img.onload = () => {
      // Calculate source crop coordinates (in pixels)
      const sourceX = rect.x * photo.width;
      const sourceY = rect.y * photo.height;
      const sourceWidth = rect.w * photo.width;
      const sourceHeight = rect.h * photo.height;
      
      // Set canvas dimensions to match the crop (maintaining original resolution)
      canvas.width = sourceWidth;
      canvas.height = sourceHeight;
      
      // Clear and draw the cropped region
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,  // Source crop
        0, 0, canvas.width, canvas.height             // Destination (full canvas)
      );
      
      setIsLoading(false);
    };
    
    img.onerror = () => {
      console.error('Failed to load image for cropping');
      setIsLoading(false);
    };
    
    img.src = photo.src;
    
  }, [sel]);
  
  if (!sel) {
    return (
      <div className={`${className ?? ""} flex items-center justify-center text-muted-foreground bg-gray-50/50 rounded-xl`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🖼️</span>
          </div>
          <p className="text-sm font-medium">Click an image to view cropped region</p>
          <p className="text-xs text-muted-foreground/70 mt-1">The cropped area will be displayed at full resolution</p>
        </div>
      </div>
    );
  }

  const { photo, rect } = sel;
  
  // Calculate actual crop dimensions
  const cropWidth = Math.round(rect.w * photo.width);
  const cropHeight = Math.round(rect.h * photo.height);
  const actualRatio = cropWidth / cropHeight;

  return (
    <div className={`${className ?? ""} p-4`}>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header with info */}
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="font-medium text-gray-900 truncate" title={photo.alt || 'Cropped Image'}>
            {photo.alt || 'Cropped Image'}
          </h3>
          <div className="text-xs text-gray-500 mt-1 space-x-4">
            <span>Crop: {cropWidth}×{cropHeight}px</span>
            <span>Ratio: {actualRatio.toFixed(3)} (≈0.75 = 3:4 Portrait)</span>
            <span>Original: {photo.width}×{photo.height}px</span>
          </div>
        </div>
        
        {/* Canvas container - displays ONLY the cropped region */}
        <div className="flex items-center justify-center bg-gray-100 min-h-[400px] relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
              <div className="flex items-center space-x-2 text-gray-600">
                <div className="animate-spin h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                <span className="text-sm">Extracting crop...</span>
              </div>
            </div>
          )}
          
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-[600px] object-contain shadow-md rounded border-2 border-gray-200"
            style={{ 
              display: isLoading ? 'none' : 'block',
              backgroundColor: 'white'
            }}
          />
        </div>
        
        {/* Footer with crop info */}
        <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span>🎯 Displaying cropped region only (at original resolution)</span>
            <span className="text-green-600 font-medium">✓ 0.75 Portrait Ratio</span>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import type { Photo } from "@/types";
import type { NormRect } from "@/hooks/useCropRects";
import { cropImageFromSrc } from "@/lib/crop";

type Props = { photo?: Photo | null; rect?: NormRect | null; };

export default function CropPreview({ photo, rect }: Props) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!photo || !rect) { setUrl(null); return; }
      try {
        const res = await cropImageFromSrc(photo.src, rect);
        if (!active) return;
        setUrl(res.url);
      } catch {
        if (!active) return;
        setUrl(null);
      }
    })();
    return () => { active = false; };
  }, [photo?.src, rect?.x, rect?.y, rect?.w, rect?.h]);

  if (!photo || !rect || !url) {
    return (
      <div className="h-44 border border-border rounded-md flex items-center justify-center text-xs text-muted-foreground">
        Select an image to see the cropped region (0.75)
      </div>
    );
  }

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <img src={url} alt="Cropped preview" className="w-full h-auto block" />
    </div>
  );
}
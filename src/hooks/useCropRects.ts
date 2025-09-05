import { useCallback, useMemo, useState } from "react";

export type NormRect = { x: number; y: number; w: number; h: number }; // 0..1

function maxRect075(width: number, height: number): { w: number; h: number } {
  const aspect = 0.75;
  const byHeight = { w: height * aspect, h: height };
  const byWidth = { w: width, h: width / aspect };
  return byHeight.w <= width ? byHeight : byWidth;
}

export function initialRectNormalized(photoW: number, photoH: number): NormRect {
  const { w, h } = maxRect075(photoW, photoH);
  const nx = (photoW - w) / 2 / photoW;
  const ny = (photoH - h) / 2 / photoH;
  return { x: nx, y: ny, w: w / photoW, h: h / photoH };
}

export function clampRect(r: NormRect): NormRect {
  const x = Math.max(0, Math.min(1 - r.w, r.x));
  const y = Math.max(0, Math.min(1 - r.h, r.y));
  return { ...r, x, y };
}

export function useCropRects() {
  const [rects, setRects] = useState<Record<string, NormRect>>({});

  const get = useCallback(
    (key: string, photoW: number, photoH: number) => {
      if (rects[key]) return rects[key];
      const init = initialRectNormalized(photoW, photoH);
      setRects(prev => ({ ...prev, [key]: init }));
      return init;
    },
    [rects]
  );

  const set = useCallback((key: string, rect: NormRect) => {
    setRects(prev => ({ ...prev, [key]: clampRect(rect) }));
  }, []);

  const remove = useCallback((key: string) => {
    setRects(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  }, []);

  return useMemo(() => ({ get, set, remove }), [get, set, remove]);
}

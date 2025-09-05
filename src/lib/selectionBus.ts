import type { Photo } from "@/types";
import type { NormRect } from "@/components/CropOverlay";

const EVT = "cropped-select";

export function setCroppedSelection(photo: Photo, rect: NormRect) {
  window.dispatchEvent(new CustomEvent(EVT, { detail: { photo, rect } }));
}

export function onCroppedSelection(cb: (p: {photo: Photo; rect: NormRect}) => void) {
  const h = (e: Event) => cb((e as CustomEvent).detail);
  window.addEventListener(EVT, h as EventListener);
  return () => window.removeEventListener(EVT, h as EventListener);
}
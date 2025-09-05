import React, { useState, useRef, useCallback } from "react";

import { Upload, Search, FolderOpen, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useFileUpload } from "@/hooks/useFileUpload";
import type { Photo, CanvaSidebarProps } from "@/types";
import { cn } from "@/lib/utils";

import CropOverlay, { type NormRect } from "@/components/CropOverlay";
import { useCropRects } from "@/hooks/useCropRects";
import { setCroppedSelection } from "@/lib/selectionBus";

const THUMB_W = 120;
const THUMB_H = THUMB_W / 0.75; // 160px (keeps your 0.75 logic)

type Size = { w: number; h: number };
type Nat = { nw: number; nh: number };

export const CanvaSidebar: React.FC<CanvaSidebarProps> = ({
  className,
  onPhotoSelect,
}) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { uploadFiles, isUploading, uploadErrors, clearErrors } = useFileUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { get, set, remove } = useCropRects();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    clearErrors();
    try {
      const newPhotos = await uploadFiles(files);
      setPhotos((prev) => [...prev, ...newPhotos]);
    } catch (error) {
      console.error("Upload failed:", error);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handlePhotoClick = (index: number) => {
    const photo = photos[index];
    const rect = get(photo.src, photo.width ?? 1, photo.height ?? 1) as NormRect;
    setCroppedSelection(photo, rect);
    onPhotoSelect?.(photo);
  };

  const removePhoto = useCallback((src: string) => {
    setPhotos((prev) => prev.filter((p) => p.src !== src));
  }, []);

  // Caches for measured sizes
  const [renderSizes, setRenderSizes] = useState<Record<string, Size>>({});
  const [naturalSizes, setNaturalSizes] = useState<Record<string, Nat>>({});

  const onImageLoad = useCallback((src: string, naturalW: number, naturalH: number) => {
    if (!naturalW || !naturalH) return;
    // Fit inside 120x160 while keeping aspect ratio
    const scale = Math.min(THUMB_W / naturalW, THUMB_H / naturalH);
    const w = Math.max(1, Math.round(naturalW * scale));
    const h = Math.max(1, Math.round(naturalH * scale));

    setNaturalSizes((m) => (m[src]?.nw === naturalW && m[src]?.nh === naturalH ? m : { ...m, [src]: { nw: naturalW, nh: naturalH } }));
    setRenderSizes((m) => (m[src]?.w === w && m[src]?.h === h ? m : { ...m, [src]: { w, h } }));
  }, []);

  return (
    <div
      className={cn(
        "w-80 h-screen bg-background border-r border-border",
        "overflow-x-hidden overflow-y-auto",
        "flex flex-col shadow-lg",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <Button
          onClick={handleUploadClick}
          disabled={isUploading}
          variant="gradient"
          size="lg"
          className="w-full mb-4 font-semibold"
        >
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? "Uploading..." : "Upload Images"}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Upload image files"
        />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search keywords, tags, color"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {uploadErrors.length > 0 && (
          <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive font-medium">Upload Errors:</p>
            {uploadErrors.map((error, index) => (
              <p key={index} className="text-xs text-destructive">
                {error.file.name}: {error.message}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Tabs + Grid */}
      <div className="p-4 border-b border-border flex-1">
        <Tabs defaultValue="images" className="w-full h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="images" className="flex items-center gap-2">
              <Images className="w-4 h-4" />
              Images
            </TabsTrigger>
            <TabsTrigger value="folders" className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Folders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="images" className="flex-1 flex flex-col">
            {photos.length > 0 ? (
              <div className="flex-1 overflow-y-auto">
                {/* SHOW COMPLETE IMAGE - NO GRAY BACKGROUND */}
                <div className="grid grid-cols-2 gap-4 p-3">
                  {photos.map((photo, index) => {
                    const nat = naturalSizes[photo.src];
                    const size = renderSizes[photo.src];

                    const rect = get(
                      photo.src,
                      (nat?.nw ?? photo.width ?? 1),
                      (nat?.nh ?? photo.height ?? 1)
                    ) as NormRect;

                    const onDelete = () => { removePhoto(photo.src); remove(photo.src); };

                    return (
                      <div
                        key={photo.src}
                        className="relative cursor-pointer group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 bg-transparent"
                        style={size ? { width: size.w, height: size.h } : undefined}
                        onClick={() => handlePhotoClick(index)}
                      >
                        <img
                          src={photo.src}
                          alt={photo.alt || ""}
                          className="block max-w-[120px] max-h-[160px] w-auto h-auto select-none pointer-events-none"
                          draggable={false}
                          onLoad={(e) => {
                            const img = e.currentTarget;
                            const nw = img.naturalWidth || photo.width || 1;
                            const nh = img.naturalHeight || photo.height || 1;
                            onImageLoad(photo.src, nw, nh);
                          }}
                        />

                        {size && nat && (
                          <CropOverlay
                            src={photo.src}
                            naturalW={nat.nw}
                            naturalH={nat.nh}
                            photoW={size.w}
                            photoH={size.h}
                            rect={rect}
                            setRect={(r) => set(photo.src, r)}
                            onDelete={onDelete}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Images className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No images uploaded yet</p>
                <p className="text-xs mt-1">Click "Upload Images" to get started</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="folders" className="mt-4">
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Folder organization</p>
              <p className="text-xs mt-1">Feature coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { 
  Upload, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  ImageIcon, 
  Link as LinkIcon, 
  Loader2, 
  Plus
} from "lucide-react";
import { toast } from "react-hot-toast";

interface MultiImageUploadInputProps {
  name: string;
  label?: string;
  initialImages?: string[];
  onChange?: (images: string[]) => void;
  folder?: string;
  maxImages?: number;
}

export function MultiImageUploadInput({
  name,
  label = "Showcase Screenshots (Carousel Slider)",
  initialImages = [],
  onChange,
  folder = "abcd_agency/ecosystem",
  maxImages = 10,
}: MultiImageUploadInputProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlBox, setShowUrlBox] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialImages && initialImages.length > 0) {
      setImages(initialImages);
    }
  }, [initialImages]);

  const updateImages = (newImages: string[]) => {
    setImages(newImages);
    onChange?.(newImages);
  };

  const processFiles = async (filesList: FileList | File[]) => {
    const files = Array.from(filesList);
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} screenshots allowed in slider.`);
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading(`Uploading ${files.length} screenshot${files.length > 1 ? "s" : ""}...`);

    try {
      // Parallel upload to Cloudinary
      const uploadPromises = files.map(async (file) => {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`"${file.name}" exceeds 5MB limit.`);
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const res = await fetch("/api/upload/cloudinary", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Failed to upload ${file.name}`);
        }

        const data = await res.json();
        return data.secure_url as string;
      });

      const results = await Promise.all(uploadPromises);
      const validUrls = results.filter(Boolean);

      if (validUrls.length > 0) {
        const nextList = [...images, ...validUrls];
        updateImages(nextList);
        toast.success(`Successfully uploaded ${validUrls.length} screenshot${validUrls.length > 1 ? "s" : ""}!`, { id: toastId });
      } else {
        toast.dismiss(toastId);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.message || "Failed to upload screenshots.", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("/")) {
      toast.error("Please enter a valid image URL or local path (e.g. /images/...)");
      return;
    }

    if (images.includes(trimmed)) {
      toast.error("This screenshot is already added.");
      return;
    }

    if (images.length >= maxImages) {
      toast.error(`Maximum ${maxImages} screenshots allowed.`);
      return;
    }

    const nextList = [...images, trimmed];
    updateImages(nextList);
    setUrlInput("");
    setShowUrlBox(false);
    toast.success("Screenshot URL added to slider!");
  };

  const handleRemove = (idxToRemove: number) => {
    const nextList = images.filter((_, idx) => idx !== idxToRemove);
    updateImages(nextList);
    toast.success("Screenshot removed from slider");
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    const copy = [...images];
    const [moved] = copy.splice(fromIndex, 1);
    copy.splice(toIndex, 0, moved);
    updateImages(copy);
  };

  return (
    <div className="space-y-3">
      {/* Hidden input storing newline-separated URLs for form submission */}
      <input type="hidden" name={name} value={images.join("\n")} />

      {/* Top Header with title and dual actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-white">
            {label}
          </label>
          <span className="text-[11px] text-[#737373] dark:text-neutral-400">
            {images.length} of {maxImages} slides · Auto-rotates & zooms in public card slider
          </span>
        </div>

        {/* Dual Option Buttons: Upload Files (Multi) AND Add by URL */}
        <div className="flex items-center gap-2">
          {/* Option 2: Add by URL */}
          <button
            type="button"
            onClick={() => setShowUrlBox(!showUrlBox)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
              showUrlBox
                ? "border-black dark:border-white bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A]"
                : "border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#1A1A1A] text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#262626]"
            }`}
            title="Paste an external image link or local path"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Add by URL</span>
          </button>

          {/* Option 1: Upload Multiple Files from Device */}
          <button
            type="button"
            disabled={isUploading || images.length >= maxImages}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 shadow-xs"
            title="Select multiple image files from your computer"
          >
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            <span>Upload Multiple Files</span>
          </button>
        </div>
      </div>

      {/* Hidden file input with multiple selection enabled */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
        className="hidden"
      />

      {/* URL Input Bar (Toggled when user clicks 'Add by URL') */}
      {showUrlBox && (
        <div className="flex items-center gap-2 p-3 rounded-xl border border-[#0A0A0A] dark:border-white bg-[#F9F9F9] dark:bg-[#161616] animate-in fade-in duration-150">
          <LinkIcon className="w-4 h-4 text-[#737373] shrink-0" />
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddUrl())}
            placeholder="Paste image link: https://res.cloudinary.com/... or /images/ecosystem/..."
            className="flex-1 text-xs font-mono bg-transparent text-[#0A0A0A] dark:text-white px-2 py-1 outline-none placeholder:text-[#737373]"
            autoFocus
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-3 py-1.5 rounded-lg bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] text-xs font-semibold cursor-pointer shrink-0"
          >
            Add to Slider
          </button>
          <button
            type="button"
            onClick={() => setShowUrlBox(false)}
            className="text-xs text-[#737373] hover:text-black dark:hover:text-white px-2 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Drag & Drop Multi-Upload Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-4 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
          isDragOver
            ? "border-black dark:border-white bg-neutral-100 dark:bg-neutral-800 scale-[0.99]"
            : "border-[#E5E5E5] dark:border-[#262626] hover:border-[#0A0A0A] dark:hover:border-neutral-400 bg-white dark:bg-[#141414]"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs">
          <div className="flex items-center gap-2 text-[#0A0A0A] dark:text-white font-semibold">
            <Upload className="w-4 h-4 text-[#737373]" />
            <span>Click to browse or drag & drop multiple files</span>
          </div>
          <span className="text-[#737373] dark:text-neutral-500 hidden sm:inline">|</span>
          <span className="text-[11px] text-[#737373] dark:text-neutral-400">
            JPG, PNG, WebP up to 5MB each · Multi-select enabled
          </span>
        </div>
      </div>

      {/* Gallery of Uploaded Slides */}
      {images.length > 0 ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-3 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#111111]">
            {images.map((url, idx) => (
              <div
                key={`${url}-${idx}`}
                className="group relative flex flex-col rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#171717] overflow-hidden shadow-xs hover:border-neutral-400 dark:hover:border-neutral-600 transition-all"
              >
                {/* Thumbnail Display */}
                <div className="relative aspect-[16/10] bg-neutral-900 overflow-hidden">
                  <Image
                    src={url}
                    alt={`Slide ${idx + 1}`}
                    fill
                    sizes="200px"
                    className="object-cover object-top"
                  />

                  {/* Slide index badge */}
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-black/80 text-white backdrop-blur-xs">
                    Slide #{idx + 1}
                  </div>

                  {/* Primary cover badge */}
                  {idx === 0 && (
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-600 text-white">
                      Cover
                    </div>
                  )}
                </div>

                {/* Action Toolbar */}
                <div className="p-1.5 flex items-center justify-between gap-1 border-t border-[#E5E5E5] dark:border-[#262626] bg-neutral-50 dark:bg-[#141414]">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMove(idx, idx - 1);
                      }}
                      title="Move earlier"
                      className="p-1 rounded text-[#737373] hover:text-black dark:hover:text-white disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMove(idx, idx + 1);
                      }}
                      title="Move later"
                      className="p-1 rounded text-[#737373] hover:text-black dark:hover:text-white disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(idx);
                    }}
                    title="Remove this screenshot"
                    className="p-1 rounded text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

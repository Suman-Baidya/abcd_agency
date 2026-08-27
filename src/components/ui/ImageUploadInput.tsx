"use client";

import { useState, useRef } from "react";
import { Upload, Link as LinkIcon, Image as ImageIcon, Loader2, Check } from "lucide-react";
import { toast } from "react-hot-toast";

interface ImageUploadInputProps {
  name: string;
  label: string;
  defaultValue?: string | null;
  folder?: string;
}

export function ImageUploadInput({ name, label, defaultValue, folder = "abcd_agency/branding" }: ImageUploadInputProps) {
  const [value, setValue] = useState(defaultValue || "");
  const [isUploading, setIsUploading] = useState(false);
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Uploading image...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload/cloudinary", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      const data = await res.json();
      setValue(data.secure_url);
      toast.success("Image uploaded successfully", { id: toastId });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-[#0A0A0A] dark:text-white">{label}</label>
        <div className="flex bg-[#F5F5F5] dark:bg-[#111111] rounded-md p-1">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`text-xs px-2.5 py-1 rounded-sm transition-colors ${
              mode === "upload"
                ? "bg-white dark:bg-[#262626] text-[#0A0A0A] dark:text-white shadow-sm"
                : "text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white"
            }`}
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`text-xs px-2.5 py-1 rounded-sm transition-colors ${
              mode === "url"
                ? "bg-white dark:bg-[#262626] text-[#0A0A0A] dark:text-white shadow-sm"
                : "text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white"
            }`}
          >
            URL
          </button>
        </div>
      </div>

      <input type="hidden" name={name} value={value} />

      {mode === "upload" ? (
        <div className="flex gap-4 items-start">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 border-2 border-dashed border-[#E5E5E5] dark:border-[#262626] hover:border-[#0A0A0A] dark:hover:border-white rounded-md p-4 text-center cursor-pointer transition-colors group flex items-center justify-center flex-col gap-2 min-h-[100px]"
          >
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleUpload}
              disabled={isUploading}
            />
            {isUploading ? (
              <Loader2 className="w-5 h-5 text-[#0A0A0A] dark:text-white animate-spin" />
            ) : (
              <>
                <Upload className="w-5 h-5 text-[#737373] group-hover:text-[#0A0A0A] dark:group-hover:text-white transition-colors" />
                <span className="text-xs text-[#737373] font-medium">Click to upload or drag and drop</span>
              </>
            )}
          </div>
          {value && (
            <div className="w-24 h-24 shrink-0 rounded-md border border-[#E5E5E5] dark:border-[#262626] overflow-hidden bg-[#F5F5F5] dark:bg-[#111111] flex items-center justify-center relative">
              <img src={value} alt="Preview" className="max-w-full max-h-full object-contain p-2" />
              <div className="absolute top-1 right-1 w-5 h-5 bg-[#10B981] rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LinkIcon className="w-4 h-4 text-[#737373]" />
            </div>
            <input
              type="url"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="https://..."
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white transition-shadow"
            />
          </div>
          {value && (
             <div className="w-10 h-10 shrink-0 rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#111111] flex items-center justify-center">
               <img src={value} alt="Preview" className="max-w-full max-h-full object-contain p-1" />
             </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { 
  Share2, 
  Copy, 
  Check, 
  MessageCircle,
  ExternalLink
} from "lucide-react";
import { toast } from "react-hot-toast";

interface BlogShareBarProps {
  title: string;
  slug: string;
}

export function BlogShareBar({ title, slug }: BlogShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/blog/${slug}`;
      setShareUrl(url);
      setCanNativeShare(typeof navigator !== "undefined" && Boolean(navigator.share));
    }
  }, [slug]);

  const handleCopyLink = async () => {
    try {
      if (shareUrl) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: shareUrl,
        });
      } catch (err: any) {
        if (err.name !== "AbortError") {
          toast.error("Could not share");
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareTargets = [
    {
      name: "X (Twitter)",
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      icon: (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      ),
    },
    {
      name: "WhatsApp",
      url: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      icon: <MessageCircle className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3 px-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#111111]/80 backdrop-blur-xs">
      <div className="flex items-center gap-2">
        <Share2 className="w-4 h-4 text-[#737373] dark:text-neutral-400 shrink-0" />
        <span className="text-xs font-semibold text-[#0A0A0A] dark:text-white uppercase tracking-wider text-[11px]">
          Share Article
        </span>
      </div>

      <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
        {/* Native share on mobile */}
        {canNativeShare && (
          <button
            onClick={handleNativeShare}
            aria-label="Share via device menu"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#1A1A1A] hover:bg-[#F5F5F5] dark:hover:bg-[#262626] text-xs font-medium text-[#0A0A0A] dark:text-white transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        )}

        {/* Copy Link Button */}
        <button
          onClick={handleCopyLink}
          aria-label="Copy article link"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
            copied
              ? "border-emerald-600/40 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
              : "border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#1A1A1A] hover:bg-[#F5F5F5] dark:hover:bg-[#262626] text-[#0A0A0A] dark:text-white"
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Link</span>
            </>
          )}
        </button>

        {/* Quick Social Share Buttons */}
        {shareTargets.map((target) => (
          <a
            key={target.name}
            href={target.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${target.name}`}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#1A1A1A] hover:bg-[#0A0A0A] hover:text-white hover:border-[#0A0A0A] dark:hover:bg-white dark:hover:text-[#0A0A0A] dark:hover:border-white text-[#262626] dark:text-neutral-300 transition-all cursor-pointer shadow-2xs"
            title={`Share on ${target.name}`}
          >
            {target.icon}
          </a>
        ))}
      </div>
    </div>
  );
}

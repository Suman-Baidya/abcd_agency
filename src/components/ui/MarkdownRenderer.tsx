import React from "react";
import { marked } from "marked";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content) return null;

  let html = "";
  try {
    html = marked.parse(content, {
      gfm: true,
      breaks: true,
    }) as string;
  } catch (err) {
    console.error("Markdown parse error:", err);
    html = `<p>${content}</p>`;
  }

  return (
    <div
      className={`markdown-prose ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

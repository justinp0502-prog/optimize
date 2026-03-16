"use client";

import { useState } from "react";
import { Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type GroceryExportProps = {
  content: string;
  fileName: string;
};

export function GroceryExport({ content, fileName }: GroceryExportProps) {
  const [status, setStatus] = useState<string | null>(null);

  async function copyToClipboard() {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(content);
      return true;
    }

    const textarea = document.createElement("textarea");
    textarea.value = content;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();

    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copied;
  }

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Optimize grocery list",
          text: content,
          url: window.location.href,
        });
        setStatus("Shared");
        return;
      }

      const copied = await copyToClipboard();
      setStatus(copied ? "Copied" : "Use download instead");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setStatus("Share cancelled");
        return;
      }

      try {
        const copied = await copyToClipboard();
        setStatus(copied ? "Copied" : "Use download instead");
      } catch {
        setStatus("Use download instead");
      }
    }
  }

  function handleDownload() {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    setStatus("Downloaded");
  }

  const helperText = (() => {
    if (status === "Copied") {
      return "Copied to clipboard.";
    }

    if (status === "Use download instead") {
      return "This browser would not share it, so use the download button.";
    }

    if (status) {
      return `${status}.`;
    }

    return "Share on mobile or copy the list on desktop.";
  })();

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download .txt
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{helperText}</p>
    </div>
  );
}

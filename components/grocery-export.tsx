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

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Optimize grocery list",
          text: content,
        });
        setStatus("Shared");
        return;
      }

      await navigator.clipboard.writeText(content);
      setStatus("Copied");
    } catch {
      setStatus("Could not share");
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
      <p className="text-xs text-muted-foreground">
        {status ? `${status}.` : "Send it to your phone, notes app, or print flow in one step."}
      </p>
    </div>
  );
}

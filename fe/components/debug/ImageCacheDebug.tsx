import React from "react";
import { useImageCache } from "@/hooks/useImageCache";

export function ImageCacheDebug() {
  const { getCacheStats, clearCache } = useImageCache();
  const stats = getCacheStats();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm font-mono z-50">
      <h3 className="font-bold mb-2">Cache Stats</h3>
      <div>Total Entries: {stats.totalEntries}</div>
      <div>Memory Entries: {stats.memoryEntries}</div>
      <div>Hit Rate: {stats.cacheHitRate.toFixed(1)}%</div>
      <button
        onClick={clearCache}
        className="mt-2 px-2 py-1 bg-red-600 rounded text-xs hover:bg-red-700"
      >
        Clear Cache
      </button>
    </div>
  );
}

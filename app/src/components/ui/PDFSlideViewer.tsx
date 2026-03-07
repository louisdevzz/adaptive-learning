"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Loader2,
} from "lucide-react";

interface PDFSlideViewerProps {
  url: string;
  className?: string;
}

const PDFSlideViewer = ({ url, className = "" }: PDFSlideViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const renderTaskRef = useRef<any>(null);

  // Load PDF document
  useEffect(() => {
    let cancelled = false;

    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(null);

        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();

        // Fetch PDF through backend proxy to avoid CORS issues with R2
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";
        const proxyUrl = `${API_BASE_URL}/api/upload/proxy?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl, {
          credentials: "include",
          headers: { "x-api-key": API_KEY },
        });
        if (!response.ok) throw new Error("Failed to fetch PDF");
        const arrayBuffer = await response.arrayBuffer();

        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        if (!cancelled) {
          setPdfDoc(pdf);
          setTotalPages(pdf.numPages);
          setCurrentPage(1);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load PDF:", err);
        if (!cancelled) {
          setError("Không thể tải file PDF");
          setLoading(false);
        }
      }
    };

    loadPDF();
    return () => {
      cancelled = true;
    };
  }, [url]);

  // Render current page
  const renderPage = useCallback(
    async (pageNum: number) => {
      if (!pdfDoc || !canvasRef.current || rendering) return;

      try {
        setRendering(true);

        // Cancel previous render
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {}
        }

        const page = await pdfDoc.getPage(pageNum);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Calculate scale to fit container while maintaining aspect ratio
        const container = containerRef.current;
        const containerWidth = container
          ? container.clientWidth
          : window.innerWidth;
        const containerHeight = container
          ? container.clientHeight - 60
          : window.innerHeight - 120; // leave room for controls

        const viewport = page.getViewport({ scale: 1 });
        const scaleX = containerWidth / viewport.width;
        const scaleY = containerHeight / viewport.height;
        const scale = Math.min(scaleX, scaleY);

        const scaledViewport = page.getViewport({ scale });

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        const renderContext = {
          canvasContext: ctx,
          viewport: scaledViewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.error("Failed to render page:", err);
        }
      } finally {
        setRendering(false);
      }
    },
    [pdfDoc, rendering]
  );

  // Render when page changes or PDF loads
  useEffect(() => {
    if (pdfDoc && currentPage > 0) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-render on resize
  useEffect(() => {
    const handleResize = () => {
      if (pdfDoc && currentPage > 0) {
        renderPage(currentPage);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [pdfDoc, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Navigation
  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  const nextPage = useCallback(
    () => goToPage(currentPage + 1),
    [currentPage, goToPage]
  );
  const prevPage = useCallback(
    () => goToPage(currentPage - 1),
    [currentPage, goToPage]
  );

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      // Re-render after fullscreen change
      setTimeout(() => {
        if (pdfDoc && currentPage > 0) {
          renderPage(currentPage);
        }
      }, 100);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [pdfDoc, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if this component or its container is focused/active
      if (!containerRef.current?.contains(document.activeElement) && document.activeElement !== document.body && !isFullscreen) return;

      switch (e.key) {
        case "ArrowRight":
        case " ":
          e.preventDefault();
          nextPage();
          break;
        case "ArrowLeft":
          e.preventDefault();
          prevPage();
          break;
        case "f":
        case "F":
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextPage, prevPage, toggleFullscreen, isFullscreen]);

  if (error) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg ${className}`}>
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className={`relative flex flex-col bg-gray-900 rounded-lg overflow-hidden outline-none ${
        isFullscreen ? "fixed inset-0 z-[9999] rounded-none" : ""
      } ${className}`}
    >
      {/* Slide Area */}
      <div className="flex-1 flex items-center justify-center relative min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
            <p className="text-white/70 text-sm">Đang tải slide...</p>
          </div>
        ) : (
          <>
            <canvas
              ref={canvasRef}
              className={`max-w-full max-h-full transition-opacity duration-200 ${
                rendering ? "opacity-70" : "opacity-100"
              }`}
            />

            {/* Left/Right click areas for navigation */}
            <button
              onClick={prevPage}
              disabled={currentPage <= 1}
              className="absolute left-0 top-0 bottom-[60px] w-1/4 cursor-pointer opacity-0 hover:opacity-100 transition-opacity disabled:cursor-default group"
              aria-label="Slide trước"
            >
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 rounded-full flex items-center justify-center group-hover:bg-black/60 transition-colors">
                <ChevronLeft className="w-6 h-6 text-white" />
              </div>
            </button>
            <button
              onClick={nextPage}
              disabled={currentPage >= totalPages}
              className="absolute right-0 top-0 bottom-[60px] w-1/4 cursor-pointer opacity-0 hover:opacity-100 transition-opacity disabled:cursor-default group"
              aria-label="Slide tiếp"
            >
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 rounded-full flex items-center justify-center group-hover:bg-black/60 transition-colors">
                <ChevronRight className="w-6 h-6 text-white" />
              </div>
            </button>
          </>
        )}
      </div>

      {/* Controls Bar */}
      {!loading && (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800/90 border-t border-gray-700">
          {/* Left: Prev button */}
          <button
            onClick={prevPage}
            disabled={currentPage <= 1}
            className="p-2 text-white/80 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Center: Page indicator */}
          <div className="flex items-center gap-3">
            <span className="text-white/90 text-sm font-medium">
              {currentPage} / {totalPages}
            </span>

            {/* Progress dots for small page counts, bar for large */}
            {totalPages <= 20 ? (
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => goToPage(i + 1)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i + 1 === currentPage
                        ? "bg-primary w-4"
                        : "bg-white/30 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>
            ) : (
              <div className="w-32 h-1.5 bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-200"
                  style={{
                    width: `${(currentPage / totalPages) * 100}%`,
                  }}
                />
              </div>
            )}
          </div>

          {/* Right: Next + Fullscreen */}
          <div className="flex items-center gap-1">
            <button
              onClick={nextPage}
              disabled={currentPage >= totalPages}
              className="p-2 text-white/80 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 text-white/80 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title={isFullscreen ? "Thoát toàn màn hình (ESC)" : "Toàn màn hình (F)"}
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFSlideViewer;

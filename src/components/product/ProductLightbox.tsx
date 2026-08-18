import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
} from "lucide-react";

interface ProductLightboxProps {
  images: string[];
  startIndex: number;
  onClose: () => void;
}

export function ProductLightbox({
  images,
  startIndex,
  onClose,
}: ProductLightboxProps) {
  const [current, setCurrent] = useState(startIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") {
        setIsZoomed(false);
        setCurrent((c) => (c + 1) % images.length);
      }
      if (e.key === "ArrowLeft") {
        setIsZoomed(false);
        setCurrent((c) => (c - 1 + images.length) % images.length);
      }
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [images.length, onClose]);

  const prev = () => {
    setIsZoomed(false);
    setCurrent((c) => (c - 1 + images.length) % images.length);
  };

  const next = () => {
    setIsZoomed(false);
    setCurrent((c) => (c + 1) % images.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[350] flex flex-col bg-black/95 backdrop-blur-2xl selection:bg-primary selection:text-primary-foreground"
      onClick={onClose}
    >
      {/* Top Header Bar */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-white/50 tracking-widest uppercase">
            Image {String(current + 1).padStart(2, "0")} of {String(images.length).padStart(2, "0")}
          </span>
          <span className="hidden sm:inline-block text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-bold">
            HD Preview
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Toggle */}
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-xs font-mono transition-all cursor-pointer"
          >
            {isZoomed ? <ZoomOut size={14} /> : <ZoomIn size={14} />}
            <span className="hidden sm:inline">{isZoomed ? "Reset Zoom" : "Zoom 1.5x"}</span>
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-white/15 bg-white/5 hover:bg-white/15 transition-all duration-200 group cursor-pointer text-white/70 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main Image Area */}
      <div
        className="flex-1 flex items-center justify-center relative overflow-hidden px-4 sm:px-16 py-6"
        onClick={(e) => e.stopPropagation()}
      >
        {images.length > 1 && (
          <button
            onClick={prev}
            aria-label="Previous image"
            className="absolute left-4 sm:left-6 w-12 h-12 rounded-full border border-white/15 bg-black/40 backdrop-blur-md hover:bg-white/20 flex items-center justify-center transition-all duration-200 z-20 cursor-pointer text-white shadow-xl"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
          <AnimatePresence mode="wait">
            <motion.img
              key={`${current}-${isZoomed}`}
              src={images[current]}
              alt={`Preview shot ${current + 1}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: isZoomed ? 1.5 : 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsZoomed(!isZoomed)}
              className={`max-h-full max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-300 ${
                isZoomed ? "cursor-zoom-out max-h-none max-w-none" : "cursor-zoom-in"
              }`}
              style={{
                maxHeight: isZoomed ? "none" : "calc(100vh - 180px)",
              }}
            />
          </AnimatePresence>
        </div>

        {images.length > 1 && (
          <button
            onClick={next}
            aria-label="Next image"
            className="absolute right-4 sm:right-6 w-12 h-12 rounded-full border border-white/15 bg-black/40 backdrop-blur-md hover:bg-white/20 flex items-center justify-center transition-all duration-200 z-20 cursor-pointer text-white shadow-xl"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div
          className="flex items-center justify-center gap-2.5 py-4 px-6 border-t border-white/10 shrink-0 overflow-x-auto z-10 bg-black/40"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => {
                setIsZoomed(false);
                setCurrent(i);
              }}
              className={`relative rounded-xl overflow-hidden shrink-0 transition-all duration-200 cursor-pointer border ${
                i === current
                  ? "border-primary ring-2 ring-primary/40 opacity-100 scale-105"
                  : "border-white/10 opacity-40 hover:opacity-80 scale-100"
              }`}
              style={{ width: 68, height: 46 }}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

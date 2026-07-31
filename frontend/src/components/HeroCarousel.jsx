import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HeroCarousel = () => {
  const [images, setImages] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    axios.get(`${API}/hero-images`).then(r => setImages(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (images.length < 2) return;
    const interval = setInterval(() => {
      setCurrent(c => (c + 1) % images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) return null;

  const goPrev = () => setCurrent(c => (c - 1 + images.length) % images.length);
  const goNext = () => setCurrent(c => (c + 1) % images.length);

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={images[current].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${API}/files/${images[current].storage_path}')` }}
          data-testid={`hero-image-${current}`}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-black/60" />

      {images.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
            aria-label="Previous"
            data-testid="hero-prev-btn"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goNext}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
            aria-label="Next"
            data-testid="hero-next-btn"
          >
            <ChevronRight size={24} />
          </button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2" data-testid="hero-dots">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all ${
                  i === current ? 'w-8 bg-[#D4AF37]' : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${i + 1}`}
                data-testid={`hero-dot-${i}`}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default HeroCarousel;

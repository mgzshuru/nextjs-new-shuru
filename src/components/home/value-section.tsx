'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Target, Activity, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const iconMap: Record<string, React.ReactNode> = {
  Activity: <Activity className="h-6 w-6" />,
  Target: <Target className="h-6 w-6" />,
  Zap: <Zap className="h-6 w-6" />,
  Check: <CheckCircle className="h-6 w-6 text-primary" />,
};

function getIcon(name?: string, defaultIcon?: React.ReactNode) {
  if (!name) return defaultIcon;
  return iconMap[name] || defaultIcon;
}

export function ValueSection({ value }: { value: import('@/strapi/home').StrapiValueBlock }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const points = value.points || [];

  useEffect(() => {
    if (points.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % points.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [points.length]);

  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-background relative overflow-hidden flex flex-col items-center">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 start-0 -translate-y-1/2 -ms-32 h-96 w-96 rounded-full bg-primary/10 blur-[100px] -z-10 gpu-accelerated"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full z-10">
        <div
          className="mx-auto max-w-2xl lg:text-center mb-16 sm:mb-24"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            {value.title}
          </h2>
          {value.introText && (
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-8 text-muted-foreground font-medium">
              {value.introText}
            </p>
          )}
        </div>

        <div className="relative w-full max-w-5xl mx-auto py-8 sm:py-16 min-h-[450px] flex items-center justify-center perspective-1000">
          <AnimatePresence mode="wait">
            {points.length > 0 && (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="w-full max-w-3xl p-10 sm:p-14 md:p-20 bg-card/95 backdrop-blur-none md:bg-background/60 md:backdrop-blur-xl rounded-3xl shadow-2xl border border-border/50 flex flex-col items-center text-center relative overflow-hidden group hover:border-primary/50 transition-colors"
              >
                {/* Subtle Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50 pointer-events-none group-hover:opacity-100 transition-opacity duration-500" />

                <div
                  className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-[2rem] bg-primary/10 mb-8 sm:mb-10 text-primary shadow-lg ring-1 ring-primary/20 group-hover:scale-110 transition-transform duration-500"
                >
                  {getIcon(points[currentIndex].iconName, <CheckCircle className="h-12 w-12 sm:h-14 sm:w-14" />)}
                </div>

                <h3
                  className="relative text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground mb-4 sm:mb-6 transition-colors group-hover:text-primary"
                >
                  {points[currentIndex].title}
                </h3>

                {points[currentIndex].description && (
                  <p
                    className="relative text-base sm:text-xl text-muted-foreground leading-relaxed max-w-2xl"
                  >
                    {points[currentIndex].description}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dots Indicator */}
          {points.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center gap-1">
              {points.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className="group flex h-12 w-12 items-center justify-center focus:outline-none"
                  aria-label={`Show slide ${idx + 1}`}
                >
                  <span
                    className={`h-2.5 rounded-full transition-all duration-300 group-focus-visible:ring-2 group-focus-visible:ring-primary/50 ${
                      idx === currentIndex
                        ? 'w-8 bg-primary'
                        : 'w-2.5 bg-primary/20 group-hover:bg-primary/50'
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

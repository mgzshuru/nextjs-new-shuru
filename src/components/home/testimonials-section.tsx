'use client';

import { useState, useEffect } from 'react';
import { type StrapiTestimonial } from '@/strapi/home';
import { Quote, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function TestimonialsSection({
  section,
  testimonials
}: {
  section: import('@/strapi/home').StrapiTestimonialsSectionBlock,
  testimonials: StrapiTestimonial[]
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!section?.showSection || testimonials.length <= 1 || isHovered) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [section?.showSection, testimonials.length, isHovered]);

  if (!section?.showSection || testimonials.length === 0) return null;

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-accent/5 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">{section.title}</h2>
          {section.introText && (
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-8 text-muted-foreground">{section.introText}</p>
          )}
        </div>
        
        <div 
          className="mx-auto mt-12 sm:mt-16 max-w-4xl relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="overflow-hidden px-4 py-8">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="group relative flex flex-col justify-between rounded-3xl border border-border/50 bg-card p-8 sm:p-10 md:p-14 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 min-h-[300px] overflow-hidden"
              >
                <div className="absolute top-0 end-0 -m-8 h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-primary/5 blur-3xl transition-all duration-300 group-hover:bg-primary/10 gpu-accelerated"></div>
                
                <Quote className="h-12 w-12 text-primary/40 mb-8 transform group-hover:scale-110 group-hover:text-primary/60 transition-all duration-300" />
                
                <p className="text-xl md:text-2xl leading-relaxed text-foreground mb-10 relative z-10 font-medium">"{testimonials[currentIndex].quote}"</p>
                
                <div className="mt-auto flex items-center gap-4 relative z-10">
                  <div>
                    <div className="font-bold text-lg text-foreground">{testimonials[currentIndex].author}</div>
                    {(testimonials[currentIndex].role || testimonials[currentIndex].company) && (
                      <div className="text-sm md:text-base font-medium text-muted-foreground mt-1">
                        {testimonials[currentIndex].role} {testimonials[currentIndex].role && testimonials[currentIndex].company && '•'} <span className="text-primary/80">{testimonials[currentIndex].company}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          {testimonials.length > 1 && (
            <div className="flex justify-center items-center gap-6 mt-8">
              <button 
                onClick={prev} 
                className="h-12 w-12 flex items-center justify-center rounded-full bg-background border border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5 rtl:rotate-180 scale-125" />
              </button>
              
              <div className="flex items-center gap-1">
                {testimonials.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setCurrentIndex(i)} 
                    aria-label={`Go to testimonial ${i + 1}`}
                    className="group flex h-12 w-12 items-center justify-center focus:outline-none" 
                  >
                    <span 
                      className={`h-2.5 rounded-full transition-all duration-300 group-focus-visible:ring-2 group-focus-visible:ring-primary/50 ${i === currentIndex ? 'w-8 bg-primary' : 'w-2.5 bg-primary/20 group-hover:bg-primary/50'}`} 
                    />
                  </button>
                ))}
              </div>
              
              <button 
                onClick={next} 
                className="h-12 w-12 flex items-center justify-center rounded-full bg-background border border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5 rtl:rotate-180 scale-125" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

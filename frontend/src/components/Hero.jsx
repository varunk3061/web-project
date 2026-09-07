"use client";

import { useEffect, useState } from "react";

export default function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // High-resolution browser/web images with promotional content
  const banners = [
    {
      image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1600&q=80",
      alt: "Modern Kitchen & Cookware",
      tag: "🍳 Culinary Essentials",
      title: "Upgrade Your Kitchen Experience",
      description: "Discover premium cookware, smart appliances, and chef-grade kitchen essentials.",
      ctaPrimary: "Shop Kitchen",
      ctaSecondary: "View Recipes",
    },
    {
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80",
      alt: "High-Fidelity Audio & Tech",
      tag: "⚡ New Arrival • 30% Off",
      title: "Immersive Sound. Pure Comfort.",
      description: "Experience studio-grade acoustics and active noise cancellation with our flagship gear.",
      ctaPrimary: "Explore Audio",
      ctaSecondary: "Compare Models",
    },
    {
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=80",
      alt: "Smart Gadgets & Watches",
      tag: "🔥 Trending Tech",
      title: "Intelligent Style for Everyday Life",
      description: "Track your health, manage your day, and look sharp with the latest wearables.",
      ctaPrimary: "Shop Wearables",
      ctaSecondary: "Specifications",
    },
    {
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80",
      alt: "Curated Fashion & Lifestyle",
      tag: "✨ Limited Edition",
      title: "Minimalist Modern Collection",
      description: "Crafted with sustainable materials, tailored for unmatched comfort and style.",
      ctaPrimary: "Browse Collection",
      ctaSecondary: "Lookbook",
    },
  ];

  // Auto-slide every 5 seconds (pauses when user hovers)
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => { //set interval is a function that executes a block of code repeatedly at specified time intervals
      setActiveSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval); //cleanup function to  remove the old timer.means the first slide will displayed for 5 seconds,then the second slide will be diplayed for 5 seconds
  }, [isPaused, banners.length]);

  const handlePrev = () => {
    setActiveSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % banners.length);
  };

  return (
    <section className="bg-gradient-to-b from-gray-50 via-white to-gray-100 px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        {/* Main Carousel Container */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="group relative h-[380px] w-full overflow-hidden rounded-3xl bg-gray-900 shadow-2xl ring-1 ring-gray-200/50 sm:h-[440px] md:h-[500px]"
        >
          {/* Slide Track */}
          <div
            className="flex h-full w-full transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${activeSlide * 100}%)` }}
          >
            {banners.map((slide, index) => (
              <div
                key={index}
                className="relative h-full w-full flex-shrink-0 select-none overflow-hidden"
              >
                {/* Background Image */}
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="h-full w-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105"
                  loading={index === 0 ? "eager" : "lazy"}
                />

                {/* Gradient Overlays for optimal readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20 md:bg-gradient-to-r md:from-black/80 md:via-black/50 md:to-transparent" />

                {/* Hero Content Box */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 md:max-w-2xl md:justify-center md:p-14">
                  {/* Badge */}
                  <span className="mb-3 inline-flex w-fit items-center rounded-full bg-white/20 px-3.5 py-1 text-xs font-semibold tracking-wide text-white backdrop-blur-md ring-1 ring-white/30 sm:text-sm">
                    {slide.tag}
                  </span>

                  {/* Title */}
                  <h2 className="mb-3 text-2xl font-black tracking-tight text-white sm:text-3xl md:text-5xl md:leading-tight">
                    {slide.title}
                  </h2>

                  {/* Description */}
                  <p className="mb-6 line-clamp-2 text-sm text-gray-200 sm:line-clamp-none sm:text-base md:text-lg">
                    {slide.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={slide.link}
                      className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 hover:shadow-blue-500/50 active:scale-95 sm:text-base"
                    >
                      {slide.ctaPrimary}
                      <span className="ml-2">→</span>
                    </a>

                    <a
                      href={slide.link}
                      className="inline-flex items-center justify-center rounded-xl bg-white/15 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md ring-1 ring-white/25 transition hover:bg-white/25 active:scale-95 sm:text-base"
                    >
                      {slide.ctaSecondary}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Previous Arrow */}
          <button
            onClick={handlePrev}
            aria-label="Previous Slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/30 text-xl text-white backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-white hover:text-gray-900 active:scale-95"
          >
            ‹
          </button>

          {/* Next Arrow */}
          <button
            onClick={handleNext}
            aria-label="Next Slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/30 text-xl text-white backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-white hover:text-gray-900 active:scale-95"
          >
            ❯
          </button>

          {/* Slide Counter (Top Right) */}
          <div className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs font-medium tracking-wider text-white backdrop-blur-md">
            {String(activeSlide + 1).padStart(2, "0")} / {String(banners.length).padStart(2, "0")}
          </div>

          {/* Bottom Indicators */}
          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeSlide === index
                    ? "w-8 bg-blue-500 shadow-sm"
                    : "w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
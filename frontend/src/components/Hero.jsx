"use client";

import { useEffect, useState } from "react";

export default function Hero() {

  const [activeSlide, setActiveSlide] = useState(0);

  const banners = [
    {
      image: "/hero/kitchen.png",
      alt: "Kitchen products",
    },
    {
      image: "/hero/fashoin.png",
      alt: "Fashion collection",
    },
    {
      image: "/hero/hero.png",
      alt: "Latest products",
    },
  ];

  // Automatically change banner
  useEffect(() => {

    const interval = setInterval(() => {

      setActiveSlide((previous) =>  //suppose pervious is 0 then (0+1)%3=1 so the banner goes to banner[1]
        (previous + 1) % banners.length
      );

    }, 4000);  //means run function every 4 sec

    return () => clearInterval(interval);

  }, [banners.length]);


  return (
    <section className="bg-gray-50 px-4 py-6 md:px-6">

      <div className="mx-auto max-w-6xl">

        {/* Carousel */}
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-md">

          {/* Image container */}
          <div className="flex h-70 w-full items-center justify-center sm:h-80 md:h-90">

            <img
              src={banners[activeSlide].image}
              alt={banners[activeSlide].alt}
              className="
                h-full
                w-full
                object-contain
                transition-all
                duration-700
                ease-in-out
              "
            />

          </div>


          {/* Previous Button */}
          <button
            onClick={() =>
              setActiveSlide(
                (activeSlide - 1 + banners.length) % banners.length
              )
            }
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              rounded-full
              bg-white/90
              px-3
              py-2
              text-lg
              shadow-md
              transition
              hover:bg-white
            "
          >
            ❮
          </button>


          {/* Next Button */}
          <button
            onClick={() =>
              setActiveSlide(
                (activeSlide + 1) % banners.length
              )
            }
            className="
              absolute
              right-3
              top-1/2
              -translate-y-1/2
              rounded-full
              bg-white/90
              px-3
              py-2
              text-lg
              shadow-md
              transition
              hover:bg-white
            "
          >
            ❯
          </button>


          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">

            {banners.map((_, index) => (

              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                className={`
                  h-2
                  rounded-full
                  transition-all
                  duration-300
                  ${
                    activeSlide === index
                      ? "w-7 bg-blue-600"
                      : "w-2 bg-gray-400"
                  }
                `}
              />

            ))}

          </div>

        </div>

      </div>

    </section>
  );
}
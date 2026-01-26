import { useEffect, useMemo, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function Slider({
  images = [
    "/assets/carousel1.jpg",
    "/assets/carousel2.jpg",
    "/assets/carousel3.jpg",
    "/assets/carousel4.jpg",
    "/assets/carousel5.jpg",
    "/assets/carousel6.jpg",
  ],
  logoSrc = "/assets/logo.png",
  height = 640,
  autoplay = true,
  intervalMs = 3500,
}) {
  const safeImages = useMemo(() => (Array.isArray(images) ? images : []), [images]);
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  const count = safeImages.length;

  const go = (next) => {
    if (!count) return;
    setIndex((prev) => {
      const n = (prev + next) % count;
      return n < 0 ? n + count : n;
    });
  };

  useEffect(() => {
    if (!autoplay || count <= 1) return;

    timerRef.current = setInterval(() => go(1), intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, intervalMs, count]);

  if (!count) return null;

  return (
    <div className="eu-slider" style={{ height }}>
      <div className="eu-slider__brand">
        <img className="eu-slider__logo" src={logoSrc} alt="Euprava logo" />
      </div>

      <div className="eu-slider__stage">
        <img className="eu-slider__img" src={safeImages[index]} alt={`slide-${index + 1}`} />
      </div>

      {count > 1 ? (
        <>
          <button className="eu-slider__nav eu-slider__nav--left" onClick={() => go(-1)} type="button">
            <FiChevronLeft />
          </button>
          <button className="eu-slider__nav eu-slider__nav--right" onClick={() => go(1)} type="button">
            <FiChevronRight />
          </button>

          <div className="eu-slider__dots">
            {safeImages.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`eu-slider__dot ${i === index ? "is-active" : ""}`}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

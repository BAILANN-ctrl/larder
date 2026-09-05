const WORDS = [
  "Nutella",
  "Coca-Cola",
  "Heinz",
  "Lay's",
  "Barilla",
  "Kellogg's",
  "Lindt",
  "Danone",
  "Uncle Ben's",
  "Milka",
];

const IMAGES = [
  "/images/hero-oats.jpg",
  "/images/hero-honey.png",
  "/images/hero-rye.jpg",
  "/images/features-shelf.jpg",
];

export default function Marquee() {
  return (
    <div aria-hidden="true" className="marquee py-8 md:py-10">
      <div className="marquee-track">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0 items-center">
            {WORDS.map((word, i) => (
              <span
                key={`${dup}-${i}`}
                className="flex items-center whitespace-nowrap font-display text-4xl italic text-espresso/15"
              >
                <span className="px-8">{word}</span>
                <img
                  src={IMAGES[i % IMAGES.length]}
                  alt=""
                  className="img-pill h-9 w-9"
                  style={{ filter: "grayscale(0.3)" }}
                />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
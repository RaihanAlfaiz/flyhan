import Image from "next/image";

const logos = [
  "garuda.png",
  "airasia.png",
  "citilink.png",
  "lionair.png",
  "batikair.png",
];

export default function LogoSlider() {
  // Duplicate logos to ensure sufficient width for smooth infinite scroll
  const repeatedLogos = [...logos, ...logos];

  return (
    <div className="w-full flex items-center py-[30px] overflow-hidden">
      <div className="slider flex shrink-0 w-max">
        {[1, 2].map((group) => (
          <div
            key={group}
            className="animate-[slide_30s_linear_infinite] flex gap-[60px] pl-[60px] items-center"
          >
            {repeatedLogos.map((logo, index) => (
              <div
                key={`${group}-${index}`}
                className="flex w-[140px] h-[70px] shrink-0 items-center justify-center"
              >
                <Image
                  src={`/assets/images/logos/${logo}`}
                  className="w-full h-full object-contain opacity-70 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
                  alt="Airline Partner"
                  width={140}
                  height={70}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

import Image from "next/image";

export default function LogoSlider() {
  return (
    <div className="w-full flex items-center py-[50px] overflow-hidden">
      <div className="slider flex shrink-0 w-max">
        {[1, 2, 3].map((group) => (
          <div
            key={group}
            className="animate-[slide_10s_linear_infinite] flex gap-[50px] pl-[50px] items-center"
          >
            {[1, 2, 3, 4, 1, 2, 3, 4].map((num, index) => (
              <div
                key={`${group}-${index}`}
                className="flex w-fit h-[30px] shrink-0"
              >
                <Image
                  src={`/assets/images/logos/logoipsum${num}.png`}
                  className="w-full h-full object-contain"
                  alt="partner logo"
                  width={100}
                  height={30}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";

function FlashSaleCard({
  image,
  title,
  route,
  price,
  oldPrice,
  discount,
}: {
  image: string;
  title: string;
  route: string;
  price: string;
  oldPrice: string;
  discount: string;
}) {
  return (
    <div className="flex flex-col gap-4 min-w-[300px] bg-white rounded-[20px] p-4 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
      <div className="relative w-full h-[200px] rounded-[16px] overflow-hidden">
        <Image src={image} alt={title} fill className="object-cover" />
        <div className="absolute top-4 right-4 bg-red-500 text-white font-bold px-3 py-1 rounded-full text-sm">
          {discount} OFF
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <h3 className="font-bold text-lg text-flysha-black">{title}</h3>
            <p className="text-sm text-gray-400">{route}</p>
          </div>
          <div className="flex flex-col items-end">
            <p className="font-bold text-flysha-light-purple text-lg">
              {price}
            </p>
            <p className="text-xs text-gray-400 line-through">{oldPrice}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FlashSaleSection() {
  const sales = [
    {
      id: 1,
      title: "Bali Vacation",
      route: "Jakarta - Bali",
      price: "$120",
      oldPrice: "$240",
      discount: "50%",
      image: "/assets/images/thumbnail/thumbnail1.png",
    },
    {
      id: 2,
      title: "Tokyo Dreams",
      route: "Singapore - Tokyo",
      price: "$450",
      oldPrice: "$600",
      discount: "25%",
      image: "/assets/images/thumbnail/thumbnail2.png",
    },
    {
      id: 3,
      title: "Paris Romance",
      route: "Dubai - Paris",
      price: "$390",
      oldPrice: "$800",
      discount: "51%",
      image: "/assets/images/thumbnail/thumbnail3.png",
    },
    {
      id: 4,
      title: "New York Business ",
      route: "London - NYC",
      price: "$899",
      oldPrice: "$1200",
      discount: "25%",
      image: "/assets/images/thumbnail/thumbnail4.png",
    },
  ];

  return (
    <section
      id="FlashSale"
      className="container max-w-[1130px] mx-auto pt-[100px]"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h2 className="font-bold text-[32px] md:text-[40px] leading-tight">
            Flash Sale <span className="text-flysha-light-purple">Special</span>
          </h2>
          <p className="text-base text-gray-400">
            Limited time offers for your dream destinations
          </p>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-10 pt-4 px-4 -mx-4 hide-scrollbar snap-x">
          {sales.map((sale) => (
            <FlashSaleCard key={sale.id} {...sale} />
          ))}
        </div>
      </div>
    </section>
  );
}

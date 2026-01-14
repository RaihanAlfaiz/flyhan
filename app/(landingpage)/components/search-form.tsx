"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SearchFormProps {
  cities: { city: string; code: string }[];
}

export default function SearchForm({ cities }: SearchFormProps) {
  const router = useRouter();
  const [departure, setDeparture] = useState(cities[0]?.code || "");
  const [arrival, setArrival] = useState(
    cities[1]?.code || cities[0]?.code || ""
  );
  const [date, setDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (departure) params.set("departure", departure);
    if (arrival) params.set("arrival", arrival);
    if (date) params.set("date", date);

    router.push(`/available-flights?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white text-flysha-black w-full flex justify-between items-center rounded-[20px] p-5"
    >
      <div className="flex gap-[50px] items-center p-5">
        <div className="flex flex-col justify-center gap-[14px]">
          <label htmlFor="departure" className="text-lg">
            Departure
          </label>
          <div className="flex gap-[10px]">
            <div className="flex items-center w-8 h-8 shrink-0">
              <Image
                src="/assets/images/icons/airplane.svg"
                alt="icon"
                width={32}
                height={32}
              />
            </div>
            <select
              name="departure"
              id="departure"
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
              className="font-semibold text-[22px] leading-[26.63px] appearance-none bg-[url('/assets/images/icons/arrow-down.svg')] bg-no-repeat bg-[right_1px] pr-[30px] bg-transparent focus:outline-none"
            >
              {cities.length > 0 ? (
                cities.map((city) => (
                  <option key={`dep-${city.code}`} value={city.code}>
                    {city.city}
                  </option>
                ))
              ) : (
                <option value="">No cities available</option>
              )}
            </select>
          </div>
        </div>
        <hr className="border border-[#EDE8F5] h-[60px]" />
        <div className="flex flex-col justify-center gap-[14px]">
          <label htmlFor="arrival" className="text-lg">
            Arrival
          </label>
          <div className="flex gap-[10px]">
            <div className="flex items-center w-8 h-8 shrink-0">
              <Image
                src="/assets/images/icons/airplane.svg"
                alt="icon"
                width={32}
                height={32}
              />
            </div>
            <select
              name="arrival"
              id="arrival"
              value={arrival}
              onChange={(e) => setArrival(e.target.value)}
              className="font-semibold text-[22px] leading-[26.63px] appearance-none bg-[url('/assets/images/icons/arrow-down.svg')] bg-no-repeat bg-[right_1px] pr-[30px] bg-transparent focus:outline-none"
            >
              {cities.length > 0 ? (
                cities.map((city) => (
                  <option key={`arr-${city.code}`} value={city.code}>
                    {city.city}
                  </option>
                ))
              ) : (
                <option value="">No cities available</option>
              )}
            </select>
          </div>
        </div>
        <hr className="border border-[#EDE8F5] h-[60px]" />
        <div className="flex flex-col justify-center gap-[14px]">
          <label htmlFor="date" className="text-lg">
            Departure Date
          </label>
          <div className="flex gap-[10px]">
            <div className="flex items-center w-8 h-8 shrink-0">
              <Image
                src="/assets/images/icons/calendar.svg"
                alt="icon"
                width={32}
                height={32}
              />
            </div>
            <input
              type="date"
              name="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="relative font-semibold text-[22px] leading-[26.63px] w-[157px] bg-transparent focus:outline-none appearance-none [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0"
            />
          </div>
        </div>
      </div>
      <button
        type="submit"
        className="font-bold text-2xl leading-9 text-flysha-black text-center bg-flysha-light-purple rounded-[18px] p-[12px_30px] flex shrink-0 items-center h-[108px] transition-all duration-300 hover:shadow-[0_10px_20px_0_#B88DFF]"
      >
        Explore Now
      </button>
    </form>
  );
}

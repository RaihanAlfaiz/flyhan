"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

interface Seat {
  id: string;
  seatNumber: string;
  type: string;
  isBooked: boolean | null;
  holdUntil?: Date | string | null;
  heldByUserId?: string | null;
}

interface FlightInfo {
  id: string;
  departureCity: string;
  departureCityCode: string;
  destinationCity: string;
  destinationCityCode: string;
  departureDate: Date | string;
  arrivalDate: Date | string;
  price: number;
  priceEconomy?: number;
  priceBusiness?: number;
  priceFirst?: number;
  plane: {
    id: string;
    name: string;
    code: string;
    image: string;
  };
}

interface SeatSelectorProps {
  seats: Seat[];
  flight: FlightInfo;
  seatType?: string;
  currentUserId?: string;
}

// Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format time
function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// Format date
function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function SeatClassLabel({ type }: { type: string }) {
  return (
    <div className="w-full flex justify-center py-2 mb-2 mt-4">
      <span className="bg-[#3D3952] text-white px-4 py-1 rounded-full text-sm font-semibold capitalize">
        {type.toLowerCase()} Class
      </span>
    </div>
  );
}

export default function SeatSelector({
  seats,
  flight,
  seatType,
  currentUserId,
}: SeatSelectorProps) {
  const router = useRouter();
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check if seat is held by another user (not current user)
  const isSeatHeldByOther = (seat: Seat): boolean => {
    if (!seat.holdUntil) return false;
    const holdExpiry = new Date(seat.holdUntil);
    const now = new Date();
    // Held by someone else and not expired
    return holdExpiry > now && seat.heldByUserId !== currentUserId;
  };

  // Get displayed price based on seat type (or average if needed, though usually per seat)
  const getSeatPrice = (seat: Seat) => {
    switch (seat.type) {
      case "ECONOMY":
        return flight.priceEconomy || flight.price;
      case "BUSINESS":
        return flight.priceBusiness || Math.round(flight.price * 1.5);
      case "FIRST":
        return flight.priceFirst || Math.round(flight.price * 2.5);
      default:
        return flight.price;
    }
  };

  // Calculate total price
  const totalPrice = selectedSeats.reduce(
    (total, seat) => total + getSeatPrice(seat),
    0
  );

  // Group seats by row
  const groupedSeats = seats.reduce((acc, seat) => {
    const rowMatch = seat.seatNumber.match(/^(\d+)/);
    if (rowMatch) {
      const rowNum = rowMatch[1];
      if (!acc[rowNum]) {
        acc[rowNum] = [];
      }
      acc[rowNum].push(seat);
    }
    return acc;
  }, {} as Record<string, Seat[]>);

  const rows = Object.keys(groupedSeats).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );

  const rowsWithMeta = rows.map((rowNum) => {
    const rowSeats = groupedSeats[rowNum];
    const type = rowSeats[0]?.type || "ECONOMY";
    return { rowNum, type, seats: rowSeats };
  });

  // Handle seat selection
  const handleSeatSelect = (seat: Seat) => {
    if (seat.isBooked) return;
    if (isSeatHeldByOther(seat)) return; // Seat is held by another user
    if (seatType && seat.type !== seatType) return;

    // Check if already selected
    const isAlreadySelected = selectedSeats.some((s) => s.id === seat.id);

    if (isAlreadySelected) {
      // Remove from selection
      setSelectedSeats((prev) => prev.filter((s) => s.id !== seat.id));
    } else {
      // Add to selection (Max 4 for now)
      if (selectedSeats.length >= 4) {
        Swal.fire({
          icon: "warning",
          title: "Max Seats Reached",
          text: "You can only select up to 4 seats per booking.",
          confirmButtonColor: "#B88DFF",
        });
        return;
      }
      setSelectedSeats((prev) => [...prev, seat]);
    }
  };

  // Handle continue to book
  const handleContinueToBook = () => {
    if (selectedSeats.length === 0) return;
    setIsLoading(true);

    const seatIds = selectedSeats.map((s) => s.id).join(",");
    router.push(`/passenger-details?flightId=${flight.id}&seatIds=${seatIds}`);
  };

  // Get image URL
  const getImageUrl = () => {
    if (!flight.plane.image) {
      return "/assets/images/thumbnail/airplane-taking-off-sunset-scene-generative-ai 1.png";
    }
    if (flight.plane.image.startsWith("http")) {
      return flight.plane.image;
    }
    if (flight.plane.image.startsWith("/")) {
      return flight.plane.image;
    }
    return `/${flight.plane.image}`;
  };

  const renderSeat = (seat: Seat) => {
    const isAllowed = !seatType || seat.type === seatType;
    const isSelected = selectedSeats.some((s) => s.id === seat.id);
    const isBooked = seat.isBooked === true;
    const isHeldByOther = isSeatHeldByOther(seat);
    const isUnavailable = isBooked || isHeldByOther;

    let buttonClass =
      "relative flex shrink-0 w-[60px] h-[60px] items-center justify-center rounded-[15px] transition-all ";
    let contentClass = "font-bold text-[20px] ";

    if (isUnavailable) {
      buttonClass += "bg-[#3D3952] cursor-not-allowed";
      contentClass += "text-[#797684]";
    } else if (isSelected) {
      buttonClass += "bg-flysha-light-purple ring-2 ring-flysha-light-purple";
      contentClass += "text-flysha-black";
    } else if (!isAllowed) {
      buttonClass += "opacity-30 cursor-not-allowed ring-2 ring-white/20";
      contentClass += "text-white/50";
    } else {
      buttonClass +=
        "ring-2 ring-white hover:ring-flysha-light-purple/50 cursor-pointer";
      contentClass += "text-white";
    }

    return (
      <button
        key={seat.id}
        type="button"
        disabled={isUnavailable || !isAllowed}
        onClick={() => handleSeatSelect(seat)}
        className={buttonClass}
        title={
          isHeldByOther
            ? "This seat is currently being reserved by another customer"
            : undefined
        }
      >
        <span className={contentClass}>{seat.seatNumber}</span>
      </button>
    );
  };

  return (
    <section
      id="Choose-Seat"
      className="container flex flex-col lg:flex-row items-center lg:items-start justify-between max-w-[1000px] pt-10 mx-auto pb-10 min-h-screen gap-10"
    >
      {/* Plane Seat Map */}
      <div className="flex items-end justify-center relative">
        <div className="relative w-[409px]">
          {/* Plane Body & Wings Background */}
          <div className="absolute -left-[259px] bottom-0 w-[927px] -z-10 flex justify-center">
            <Image
              src="/assets/images/background/plane-wings.svg"
              alt="wings"
              width={927}
              height={200}
              className="w-[927px]"
            />
          </div>
          <div className="relative -z-0">
            <Image
              src="/assets/images/background/plane-body.svg"
              alt="plane body"
              width={409}
              height={782}
              className="w-full"
            />
          </div>

          <div className="absolute top-[18px] left-1/2 -translate-x-1/2">
            <Image
              src="/assets/images/background/plane-windshield.svg"
              alt="windshield"
              width={200}
              height={100}
            />
          </div>

          {/* Seats Content */}
          <div className="absolute top-[120px] left-0 right-0 px-[30px] h-[600px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-20">
            {/* Legend */}
            <div className="flex gap-[30px] mb-5 justify-center sticky top-0 bg-flysha-bg-purple/90 backdrop-blur-sm p-2 rounded-full z-10 w-fit mx-auto border border-white/10">
              <div className="flex items-center gap-[6px]">
                <div className="w-[14px] h-[14px] flex shrink-0 rounded-full bg-flysha-light-purple" />
                <span className="font-semibold text-xs">Selected</span>
              </div>
              <div className="flex items-center gap-[6px]">
                <div className="w-[14px] h-[14px] flex shrink-0 rounded-full bg-[#3D3952]" />
                <span className="font-semibold text-xs">Taken</span>
              </div>
              <div className="flex items-center gap-[6px]">
                <div className="w-[14px] h-[14px] flex shrink-0 rounded-full bg-flysha-black border border-white" />
                <span className="font-semibold text-xs">Available</span>
              </div>
            </div>

            {/* Seat Grid */}
            <div className="flex flex-col gap-5">
              {rowsWithMeta.map((row, index) => {
                // Determine if this row starts a new class type compared to the previous row
                const isNewType =
                  index === 0 || rowsWithMeta[index - 1].type !== row.type;

                return (
                  <div key={row.rowNum} className="flex flex-col w-full">
                    {/* Class Label */}
                    {isNewType && <SeatClassLabel type={row.type} />}

                    <div className="seat-row flex justify-between">
                      {/* Left Column */}
                      <div className="seat-col flex gap-[19px]">
                        {["A", "B"].map((colChar) => {
                          const seat = row.seats.find((s) =>
                            s.seatNumber.endsWith(colChar)
                          );
                          if (seat) return renderSeat(seat);
                          return (
                            <div
                              key={`placeholder-${row.rowNum}-${colChar}`}
                              className="w-[60px] h-[60px]"
                            />
                          );
                        })}
                      </div>

                      {/* Right Column */}
                      <div className="seat-col flex gap-[19px]">
                        {["C", "D"].map((colChar) => {
                          const seat = row.seats.find((s) =>
                            s.seatNumber.endsWith(colChar)
                          );
                          if (seat) return renderSeat(seat);
                          return (
                            <div
                              key={`placeholder-${row.rowNum}-${colChar}`}
                              className="w-[60px] h-[60px]"
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="flex flex-col items-center gap-[30px] pb-[30px]">
        <h1 className="font-bold text-[32px] leading-[48px] text-center">
          {flight.departureCity} to {flight.destinationCity}
        </h1>

        <div className="flex flex-col items-center gap-[30px] w-[335px]">
          {/* Flight Times */}
          <div className="flex flex-col gap-[10px] w-full">
            <div className="flex justify-center shrink-0">
              <Image
                src="/assets/images/icons/plane-dotted-curve.svg"
                alt="flight path"
                width={200}
                height={40}
              />
            </div>
            <div className="flex justify-between">
              <div className="flex flex-col gap-[2px] text-center">
                <p className="font-bold text-lg">
                  {formatTime(flight.departureDate)}
                </p>
                <p className="text-sm text-flysha-off-purple">
                  {flight.departureCityCode}
                </p>
              </div>
              <div className="flex flex-col gap-[2px] text-center">
                <p className="font-bold text-lg">
                  {formatTime(flight.arrivalDate)}
                </p>
                <p className="text-sm text-flysha-off-purple">
                  {flight.destinationCityCode}
                </p>
              </div>
            </div>
          </div>

          {/* Airline Info */}
          <div className="flex flex-col gap-4 w-full">
            <div className="flex shrink-0 w-full h-[130px] rounded-[14px] overflow-hidden">
              <img
                src={getImageUrl()}
                className="w-full h-full object-cover"
                alt={flight.plane.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/assets/images/thumbnail/airplane-taking-off-sunset-scene-generative-ai 1.png";
                }}
              />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-[2px]">
                <p className="font-bold text-lg">{flight.plane.name}</p>
                <p className="text-sm text-flysha-grey">
                  {flight.plane.code} • {seatType ? seatType : "All"} Class
                </p>
              </div>
              <div className="flex h-fit">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Image
                    key={star}
                    src="/assets/images/icons/Star.svg"
                    className="w-5 h-5"
                    alt="star"
                    width={20}
                    height={20}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="flex flex-col gap-[10px] w-full">
            <div className="flex justify-between">
              <span className="text-flysha-off-purple">Date</span>
              <span className="font-semibold">
                {formatDate(flight.departureDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-flysha-off-purple">Seat Chosen</span>
              <span className="font-semibold text-right max-w-[50%] truncate">
                {selectedSeats.length > 0
                  ? selectedSeats.map((s) => s.seatNumber).join(", ")
                  : "Select a seat"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-flysha-off-purple">Passenger</span>
              <span className="font-semibold">
                {selectedSeats.length > 0
                  ? `${selectedSeats.length} Person`
                  : "0 Person"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-flysha-off-purple">Total Price</span>
              <span className="font-semibold">
                {formatCurrency(totalPrice)}
              </span>
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinueToBook}
            disabled={selectedSeats.length === 0 || isLoading}
            className={`font-bold rounded-full h-12 w-full transition-all duration-300 flex justify-center items-center ${
              selectedSeats.length > 0
                ? "text-flysha-black bg-flysha-light-purple hover:shadow-[0_10px_20px_0_#B88DFF]"
                : "text-gray-400 bg-gray-600 cursor-not-allowed"
            }`}
          >
            {isLoading ? "Loading..." : "Continue to Book"}
          </button>
        </div>
      </div>
    </section>
  );
}

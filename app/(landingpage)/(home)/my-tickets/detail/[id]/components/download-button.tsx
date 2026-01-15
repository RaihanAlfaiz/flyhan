"use client";

import { useEffect, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { Loader2, Download } from "lucide-react";
import { ETicketPDF } from "../../../components/ticket-pdf";
import {
  type Ticket,
  type Flight,
  type Airplane,
  type FlightSeat,
  type Passenger,
} from "@prisma/client";

// Define the type here to match what is passed (serialized dates usually strings, but we can handle that)
// However, since we're using Prisma types, dates are Date objects.
// When passing from Server Component, we should convert them.
// For simplicity in this specific file, let's assume we receive the raw TicketWithRelations
// and handle Date conversion if needed inside PDF component (but PDF component expects proper types).

// Let's define the Props explicitly based on what we will pass
// We will pass serialized data where Dates are strings to be safe
type SerializedTicket = Omit<Ticket, "bookingDate"> & {
  bookingDate: string;
} & {
  flight: Omit<Flight, "departureDate" | "arrivalDate"> & {
    departureDate: string;
    arrivalDate: string;
    plane: Airplane;
  };
  seat: FlightSeat;
  passenger: Passenger | null;
  customer: { name: string };
};

export default function DownloadButton({
  ticket,
}: {
  ticket: SerializedTicket;
}) {
  const [qrCode, setQrCode] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Generate QR Code
    QRCode.toDataURL(ticket.code)
      .then((url) => setQrCode(url))
      .catch((err) => console.error("QR Gen Error", err));
  }, [ticket.code]);

  if (!isClient || !qrCode) {
    return (
      <button
        disabled
        className="w-full bg-flysha-light-purple/50 text-white rounded-full h-[48px] px-6 font-bold flex items-center justify-center gap-2 cursor-wait"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        Preparing Ticket...
      </button>
    );
  }

  // Cast back to 'any' or proper type for PDF component if needed
  // But PDF component expects Date objects for proper formatting
  // Let's create a "Hydrated" ticket object for the PDF
  const pdfTicket = {
    ...ticket,
    bookingDate: new Date(ticket.bookingDate),
    flight: {
      ...ticket.flight,
      departureDate: new Date(ticket.flight.departureDate),
      arrivalDate: new Date(ticket.flight.arrivalDate),
    },
  };

  return (
    <PDFDownloadLink
      document={<ETicketPDF ticket={pdfTicket as any} qrCodeDataUrl={qrCode} />}
      fileName={`FlyHan_Ticket_${ticket.code}.pdf`}
      className="w-full bg-flysha-light-purple text-flysha-black rounded-full h-[48px] px-6 font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
    >
      {({ blob, url, loading, error }) =>
        loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating PDF...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Download E-Ticket
          </>
        )
      }
    </PDFDownloadLink>
  );
}

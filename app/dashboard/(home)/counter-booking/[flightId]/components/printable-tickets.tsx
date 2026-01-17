"use client";

import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Printer } from "lucide-react";

interface TicketData {
  id: string;
  code: string;
  passenger?: { name: string } | null;
  counterCustomerName?: string | null;
  seat: { seatNumber: string; type: string };
  flight: {
    departureCityCode: string;
    destinationCityCode: string;
    departureCity: string;
    destinationCity: string;
    departureDate: Date;
    plane: { name: string; code: string };
  };
  price: bigint | number;
}

interface Props {
  tickets: TicketData[];
}

export default function PrintableTickets({ tickets }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Match ETicketPDF styles exactly
    printWindow.document.write(`
      <html>
        <head>
          <title>FlyHan - E-Ticket / Boarding Pass</title>
          <style>
            @page { 
              size: A4; 
              margin: 30px; 
            }
            * { 
              margin: 0; 
              padding: 0; 
              box-sizing: border-box; 
            }
            body { 
              font-family: Helvetica, Arial, sans-serif; 
              background: #ffffff; 
              padding: 30px; 
              color: #111827;
            }
            
            /* Header */
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #6100FF;
              padding-bottom: 10px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #6100FF;
            }
            .title {
              font-size: 16px;
              color: #080318;
              text-align: right;
            }
            
            /* Boarding Pass Container */
            .boarding-pass {
              border: 1px solid #e0e0e0;
              border-radius: 8px;
              margin: 10px 0 30px 0;
              page-break-inside: avoid;
            }
            
            /* Top Section - Route */
            .top-section {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 8px 8px 0 0;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .city-block {
              display: flex;
              flex-direction: column;
            }
            .city-block.right {
              align-items: flex-end;
              text-align: right;
            }
            .label {
              font-size: 8px;
              color: #6b7280;
              margin-bottom: 4px;
              text-transform: uppercase;
            }
            .city-code {
              font-size: 24px;
              font-weight: bold;
              color: #6100FF;
            }
            .city-name {
              font-size: 10px;
              color: #4b5563;
            }
            .flight-icon {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            .plane-emoji {
              color: #6100FF;
              font-size: 16px;
            }
            .flight-date {
              font-size: 8px;
              color: #6b7280;
            }
            
            /* Mid Section */
            .mid-section {
              padding: 20px;
              display: flex;
            }
            .info-left {
              width: 70%;
              display: flex;
              flex-direction: column;
              gap: 15px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              width: 100%;
            }
            .info-block {
              display: flex;
              flex-direction: column;
            }
            .value {
              font-size: 12px;
              font-weight: bold;
              color: #111827;
            }
            .value-sub {
              font-size: 9px;
              color: #6b7280;
            }
            
            /* QR Section */
            .qr-section {
              width: 30%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              border-left: 1px solid #e0e0e0;
              padding-left: 10px;
            }
            .qr-code {
              width: 80px;
              height: 80px;
            }
            .scan-text {
              font-size: 8px;
              color: #6b7280;
              margin-top: 5px;
            }
            
            /* Bottom Section */
            .bottom-section {
              background: #080318;
              padding: 10px 15px;
              border-radius: 0 0 8px 8px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .seat-block {
              display: flex;
              flex-direction: column;
            }
            .seat-label {
              font-size: 8px;
              color: #9ca3af;
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            .seat-number {
              font-size: 24px;
              font-weight: bold;
              color: #ffffff;
            }
            .code-block {
              display: flex;
              flex-direction: column;
              text-align: right;
            }
            .code-label {
              font-size: 8px;
              color: #9ca3af;
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            .code-value {
              font-size: 14px;
              font-weight: bold;
              color: #ffffff;
            }
            
            /* Footer Notes */
            .footer {
              margin-top: 20px;
              font-size: 10px;
              color: #6b7280;
            }
            .footer p {
              margin: 2px 0;
              color: #4b5563;
            }
            .footer .notes-title {
              margin-bottom: 5px;
            }
            
            @media print {
              body { padding: 0; }
              .boarding-pass { margin-bottom: 40px; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  return (
    <div>
      {/* Print Button */}
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
      >
        <Printer className="w-5 h-5" />
        Print All Tickets
      </button>

      {/* Hidden printable content - matches ETicketPDF exactly */}
      <div ref={printRef} className="hidden">
        {tickets.map((ticket) => (
          <div key={ticket.id}>
            {/* Header */}
            <div className="header">
              <div className="logo">FLYHAN</div>
              <div className="title">E-Ticket / Boarding Pass</div>
            </div>

            {/* Boarding Pass */}
            <div className="boarding-pass">
              {/* Top Section: Flight Route */}
              <div className="top-section">
                <div className="city-block">
                  <span className="label">Origin</span>
                  <span className="city-code">
                    {ticket.flight.departureCityCode}
                  </span>
                  <span className="city-name">
                    {ticket.flight.departureCity}
                  </span>
                </div>

                <div className="flight-icon">
                  <span className="plane-emoji">✈</span>
                  <span className="flight-date">
                    {formatDate(ticket.flight.departureDate)}
                  </span>
                </div>

                <div className="city-block right">
                  <span className="label">Destination</span>
                  <span className="city-code">
                    {ticket.flight.destinationCityCode}
                  </span>
                  <span className="city-name">
                    {ticket.flight.destinationCity}
                  </span>
                </div>
              </div>

              {/* Mid Section: Detailed Info */}
              <div className="mid-section">
                <div className="info-left">
                  <div className="info-row">
                    <div className="info-block">
                      <span className="label">Passenger</span>
                      <span className="value">
                        {ticket.passenger?.name ||
                          ticket.counterCustomerName ||
                          "Walk-in Customer"}
                      </span>
                    </div>
                    <div className="info-block">
                      <span className="label">Flight</span>
                      <span className="value">{ticket.flight.plane.code}</span>
                      <span className="value-sub">
                        {ticket.flight.plane.name}
                      </span>
                    </div>
                  </div>

                  <div className="info-row" style={{ marginTop: "10px" }}>
                    <div className="info-block">
                      <span className="label">Date</span>
                      <span className="value">
                        {formatDate(ticket.flight.departureDate)}
                      </span>
                    </div>
                    <div className="info-block">
                      <span className="label">Time</span>
                      <span className="value">
                        {formatTime(ticket.flight.departureDate)}
                      </span>
                    </div>
                    <div className="info-block">
                      <span className="label">Class</span>
                      <span className="value">{ticket.seat.type}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: QR Code Area */}
                <div className="qr-section">
                  {/* QR Code contains just the ticket code - matches scan format */}
                  <QRCodeSVG
                    value={ticket.code}
                    size={80}
                    level="H"
                    includeMargin={false}
                  />
                  <span className="scan-text">Scan at Gate</span>
                </div>
              </div>

              {/* Bottom Section: Seat & Code */}
              <div className="bottom-section">
                <div className="seat-block">
                  <span className="seat-label">Seat</span>
                  <span className="seat-number">{ticket.seat.seatNumber}</span>
                </div>
                <div className="code-block">
                  <span className="code-label">Booking Code</span>
                  <span className="code-value">{ticket.code}</span>
                </div>
              </div>
            </div>

            {/* Footer Info */}
            <div className="footer">
              <span className="notes-title">Important Notes:</span>
              <p>
                1. Please arrive at the airport at least 2 hours before
                departure.
              </p>
              <p>
                2. Show this E-Ticket and your valid ID/Passport at the check-in
                counter.
              </p>
              <p>3. Use the QR code above for self check-in where available.</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

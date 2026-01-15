"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image as PdfImage,
} from "@react-pdf/renderer";
import {
  type Ticket,
  type Flight,
  type Airplane,
  type FlightSeat,
  type Passenger,
} from "@prisma/client";

// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#6100FF", // FlyHan Purple
    paddingBottom: 10,
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6100FF",
  },
  title: {
    fontSize: 16,
    color: "#080318",
    textAlign: "right",
  },
  boardingPassContainer: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    marginVertical: 10,
  },
  topSection: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  midSection: {
    padding: 20,
    flexDirection: "row",
  },
  bottomSection: {
    backgroundColor: "#080318",
    padding: 10,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
  },
  valueLarge: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6100FF",
  },
  column: {
    flexDirection: "column",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  qrCode: {
    width: 80,
    height: 80,
  },
  airlineLogo: {
    width: 60,
    height: 40,
    objectFit: "contain",
  },
});

type TicketWithRelations = Ticket & {
  flight: Flight & {
    plane: Airplane;
  };
  seat: FlightSeat;
  passenger: Passenger | null;
  customer: { name: string };
};

interface ETicketPDFProps {
  ticket: TicketWithRelations;
  qrCodeDataUrl: string;
}

export const ETicketPDF = ({ ticket, qrCodeDataUrl }: ETicketPDFProps) => {
  const passengerName = ticket.passenger?.name || ticket.customer.name;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>FLYHAN</Text>
          <Text style={styles.title}>E-Ticket / Boarding Pass</Text>
        </View>

        {/* Boarding Pass */}
        <View style={styles.boardingPassContainer}>
          {/* Top Section: Flight Route */}
          <View style={styles.topSection}>
            <View style={styles.column}>
              <Text style={styles.label}>Origin</Text>
              <Text style={styles.valueLarge}>
                {ticket.flight.departureCityCode}
              </Text>
              <Text style={{ fontSize: 10, color: "#4b5563" }}>
                {ticket.flight.departureCity}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#6100FF", fontSize: 16 }}>✈</Text>
              <Text style={{ fontSize: 8, color: "#6b7280" }}>
                {new Date(ticket.flight.departureDate).toLocaleDateString()}
              </Text>
            </View>

            <View style={[styles.column, { alignItems: "flex-end" }]}>
              <Text style={styles.label}>Destination</Text>
              <Text style={styles.valueLarge}>
                {ticket.flight.destinationCityCode}
              </Text>
              <Text style={{ fontSize: 10, color: "#4b5563" }}>
                {ticket.flight.destinationCity}
              </Text>
            </View>
          </View>

          {/* Mid Section: Detailed Info */}
          <View style={styles.midSection}>
            <View style={{ width: "70%", flexDirection: "column", gap: 15 }}>
              <View style={styles.row}>
                <View style={styles.column}>
                  <Text style={styles.label}>Passenger</Text>
                  <Text style={styles.value}>{passengerName}</Text>
                </View>
                <View style={styles.column}>
                  <Text style={styles.label}>Flight</Text>
                  <Text style={styles.value}>{ticket.flight.plane.code}</Text>
                  <Text style={{ fontSize: 9, color: "#6b7280" }}>
                    {ticket.flight.plane.name}
                  </Text>
                </View>
              </View>

              <View style={[styles.row, { marginTop: 10 }]}>
                <View style={styles.column}>
                  <Text style={styles.label}>Date</Text>
                  <Text style={styles.value}>
                    {new Date(ticket.flight.departureDate).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.column}>
                  <Text style={styles.label}>Time</Text>
                  <Text style={styles.value}>
                    {new Date(ticket.flight.departureDate).toLocaleTimeString(
                      "id-ID",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      }
                    )}
                  </Text>
                </View>
                <View style={styles.column}>
                  <Text style={styles.label}>Class</Text>
                  <Text style={styles.value}>{ticket.seat.type}</Text>
                </View>
              </View>
            </View>

            {/* Right Side: QR Code Area */}
            <View
              style={{
                width: "30%",
                alignItems: "center",
                borderLeftWidth: 1,
                borderLeftColor: "#e0e0e0",
                paddingLeft: 10,
              }}
            >
              <PdfImage src={qrCodeDataUrl} style={styles.qrCode} />
              <Text style={{ fontSize: 8, color: "#6b7280", marginTop: 5 }}>
                Scan at Gate
              </Text>
            </View>
          </View>

          {/* Bottom Section: Seat & Code */}
          <View style={styles.bottomSection}>
            <View style={styles.column}>
              <Text style={[styles.label, { color: "#9ca3af" }]}>Seat</Text>
              <Text style={[styles.valueLarge, { color: "#ffffff" }]}>
                {ticket.seat.seatNumber}
              </Text>
            </View>
            <View style={styles.column}>
              <Text
                style={[styles.label, { color: "#9ca3af", textAlign: "right" }]}
              >
                Booking Code
              </Text>
              <Text style={[styles.value, { color: "#ffffff", fontSize: 14 }]}>
                {ticket.code}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer Info */}
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 10, color: "#6b7280", marginBottom: 5 }}>
            Important Notes:
          </Text>
          <Text style={{ fontSize: 10, color: "#4b5563" }}>
            1. Please arrive at the airport at least 2 hours before departure.
          </Text>
          <Text style={{ fontSize: 10, color: "#4b5563" }}>
            2. Show this E-Ticket and your valid ID/Passport at the check-in
            counter.
          </Text>
          <Text style={{ fontSize: 10, color: "#4b5563" }}>
            3. Use the QR code above for self check-in where available.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

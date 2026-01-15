export function getBookingConfirmationTemplate(data: {
  userName: string;
  bookingCode: string;
  flightCode: string;
  departureCity: string;
  destinationCity: string;
  departureDate: string;
  seatNumber: string;
  price: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background-color: #080318; padding: 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
          .content { padding: 30px; color: #333333; }
          .flight-info { background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed; }
          .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .detail-label { color: #666666; font-size: 14px; }
          .detail-value { font-weight: bold; color: #000000; }
          .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #888888; }
          .btn { display: inline-block; background-color: #7c3aed; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmed! ✈️</h1>
          </div>
          <div class="content">
            <p>Hi ${data.userName},</p>
            <p>Great news! Your flight booking has been successfully confirmed.</p>
            
            <div class="flight-info">
              <div class="detail-row">
                <span class="detail-label">Booking Code</span>
                <span class="detail-value">${data.bookingCode}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Flight</span>
                <span class="detail-value">${data.flightCode}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Route</span>
                <span class="detail-value">${data.departureCity} ➝ ${
    data.destinationCity
  }</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date</span>
                <span class="detail-value">${data.departureDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Seat</span>
                <span class="detail-value">${data.seatNumber}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total Paid</span>
                <span class="detail-value">${data.price}</span>
              </div>
            </div>

            <p>Please arrive at the airport at least 2 hours before departure time.</p>
            
            <div style="text-align: center;">
              <a href="${
                process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
              }/my-tickets" class="btn">View My Tickets</a>
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} FlyHan. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

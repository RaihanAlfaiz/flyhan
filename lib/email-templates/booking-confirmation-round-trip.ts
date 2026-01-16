export function getRoundTripBookingConfirmationTemplate(data: {
  userName: string;
  bookingCode: string;
  departureFlightCode: string;
  departureRoute: string;
  departureDate: string;
  departureSeats: string;
  returnFlightCode: string;
  returnRoute: string;
  returnDate: string;
  returnSeats: string;
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
          .section-title { font-weight: bold; color: #7c3aed; margin-bottom: 10px; font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #888888; }
          .btn { display: inline-block; background-color: #7c3aed; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Round Trip Booking Confirmed! ✈️🔄</h1>
          </div>
          <div class="content">
            <p>Hi ${data.userName},</p>
            <p>Your round trip booking has been successfully confirmed.</p>
            <div style="text-align: center; margin: 20px 0;">
                <span style="font-size: 18px; color: #666;">Booking Reference:</span><br/>
                <span style="font-size: 24px; font-weight: bold; color: #080318;">${
                  data.bookingCode
                }</span>
            </div>
            
            <div class="flight-info">
              <div class="section-title">DEPARTURE FLIGHT</div>
              <div class="detail-row">
                <span class="detail-label">Route</span>
                <span class="detail-value">${data.departureRoute}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Flight</span>
                <span class="detail-value">${data.departureFlightCode}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date</span>
                <span class="detail-value">${data.departureDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Seats</span>
                <span class="detail-value">${data.departureSeats}</span>
              </div>
            </div>

            <div class="flight-info" style="border-left-color: #22c55e;">
              <div class="section-title" style="color: #22c55e;">RETURN FLIGHT</div>
              <div class="detail-row">
                <span class="detail-label">Route</span>
                <span class="detail-value">${data.returnRoute}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Flight</span>
                <span class="detail-value">${data.returnFlightCode}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date</span>
                <span class="detail-value">${data.returnDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Seats</span>
                <span class="detail-value">${data.returnSeats}</span>
              </div>
            </div>

            <div style="text-align: center; margin-top: 20px;">
                <p>Total Paid: <strong>${data.price}</strong></p>
            </div>
            
            <div style="text-align: center;">
              <a href="${
                process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
              }/my-tickets" class="btn">View My Tickets</a>
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} FlyHan. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

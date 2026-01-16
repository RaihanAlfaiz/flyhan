import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { getUser } from "@/lib/auth";

export default async function TermsPage() {
  const { user } = await getUser();

  return (
    <div className="text-white font-sans bg-flysha-black min-h-screen flex flex-col">
      <div className="bg-[url('/assets/images/background/airplane.png')] bg-no-repeat bg-cover bg-top -z-10 absolute top-0 w-full h-[300px]" />
      <div className="bg-gradient-to-b from-[#080318]/80 to-[#080318] absolute top-0 w-full h-[300px] z-0" />

      <div className="relative z-10">
        <Navbar />
      </div>

      <div className="container max-w-[1130px] mx-auto pt-[100px] flex-1 relative z-10 pb-20">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Terms & Conditions
        </h1>

        <div className="bg-flysha-bg-purple p-8 rounded-[20px] space-y-6 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-3">
              1. Introduction
            </h2>
            <p>
              Welcome to FlyHan. By using our website and services, you agree to
              comply with and be bound by the following terms and conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">
              2. Booking & Reservations
            </h2>
            <p>
              All bookings are subject to availability. Prices are subject to
              change without notice until tickets are issued. You must provide
              accurate information during the booking process.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">
              3. Cancellations & Refunds
            </h2>
            <p>
              Cancellation policies vary depending on the ticket type. Refund
              requests must be submitted through our official channels.
              Processing fees may apply.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">
              4. User Conduct
            </h2>
            <p>
              You agree not to use our services for any unlawful purpose. You
              must not attempt to interfere with the proper working of our
              systems.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">
              5. Limitation of Liability
            </h2>
            <p>
              FlyHan shall not be liable for any direct, indirect, incidental,
              or consequential damages resulting from the use or inability to
              use our services.
            </p>
          </section>

          <p className="text-sm text-gray-500 mt-8 pt-4 border-t border-gray-700">
            Last updated: January 2026
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

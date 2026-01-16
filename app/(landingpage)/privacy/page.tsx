import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { getUser } from "@/lib/auth";

export default async function PrivacyPage() {
  const { user } = await getUser();

  return (
    <div className="text-white font-sans bg-flysha-black min-h-screen flex flex-col">
      <div className="bg-[url('/assets/images/background/airplane.png')] bg-no-repeat bg-cover bg-top -z-10 absolute top-0 w-full h-[300px]" />
      <div className="bg-gradient-to-b from-[#080318]/80 to-[#080318] absolute top-0 w-full h-[300px] z-0" />

      <div className="relative z-10">
        <Navbar />
      </div>

      <div className="container max-w-[1130px] mx-auto pt-[100px] flex-1 relative z-10 pb-20">
        <h1 className="text-4xl font-bold mb-8 text-center">Privacy Policy</h1>

        <div className="bg-flysha-bg-purple p-8 rounded-[20px] space-y-6 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-3">
              1. Information We Collect
            </h2>
            <p>
              We collect personal information such as your name, email address,
              passport details, and payment information when you make a booking.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">
              2. How We Use Your Information
            </h2>
            <p>
              We use your data to process bookings, send travel updates, improve
              our services, and comply with legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">
              3. Data Security
            </h2>
            <p>
              We implement industry-standard security measures to protect your
              personal information from unauthorized access, disclosure, or
              misuse.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">4. Cookies</h2>
            <p>
              Our website uses cookies to enhance user experience and analyze
              traffic. You can control cookie preferences in your browser
              settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">
              5. Third-Party Sharing
            </h2>
            <p>
              We may share strictly necessary data with airlines and payment
              processors to fulfill your booking request.
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

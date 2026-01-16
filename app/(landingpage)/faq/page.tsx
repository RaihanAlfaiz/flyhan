import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { getUser } from "@/lib/auth";
import FAQAccordion from "../components/faq-accordion";

export default async function FAQPage() {
  const { user } = await getUser();
  const faqs = [
    {
      q: "How do I book a flight?",
      a: "You can easily book a flight through our homepage. Simply enter your departure and destination cities, select your dates, and proceed with the booking.",
    },
    {
      q: "Can I refund my ticket?",
      a: "Yes, refunds are available for eligible tickets. Please check the fare rules during booking or contact our support team.",
    },
    {
      q: "What is the baggage allowance?",
      a: "Standard baggage allowance is 20kg for checked luggage and 7kg for cabin baggage. Premium classes offer higher allowances.",
    },
    {
      q: "How can I change my flight?",
      a: "You can change your flight details through the 'My Tickets' section in your profile, subject to change fees and seat availability.",
    },
    {
      q: "Do you offer travel insurance?",
      a: "Yes, we partner with leading insurance providers to offer comprehensive travel insurance options during the booking process.",
    },
    {
      q: "How do I check in?",
      a: "Online check-in opens 24 hours before your flight. You can check in via our website or mobile app.",
    },
  ];

  return (
    <div className="text-white font-sans bg-flysha-black min-h-screen flex flex-col">
      <div className="bg-[url('/assets/images/background/airplane.png')] bg-no-repeat bg-cover bg-top -z-10 absolute top-0 w-full h-[500px]" />
      <div className="bg-gradient-to-b from-[#080318]/50 to-[#080318] absolute top-0 w-full h-[500px] z-0" />

      <div className="relative z-10">
        <Navbar />
      </div>

      <div className="container max-w-[800px] mx-auto pt-[100px] flex-1 relative z-10 pb-20">
        <h1 className="text-4xl font-bold mb-4 text-center">
          Frequently Asked Questions
        </h1>
        <p className="text-center text-gray-400 mb-12">
          Have questions? We're here to help.
        </p>

        <FAQAccordion items={faqs} />
      </div>

      <Footer />
    </div>
  );
}

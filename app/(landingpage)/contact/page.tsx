import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { getUser } from "@/lib/auth";
import ContactForm from "./components/contact-form";
import { Mail, MapPin, Phone } from "lucide-react";

export default async function ContactPage() {
  const { user } = await getUser();

  return (
    <div className="text-white font-sans bg-flysha-black min-h-screen flex flex-col">
      <div className="bg-[url('/assets/images/background/airplane.png')] bg-no-repeat bg-cover bg-top -z-10 absolute top-0 w-full h-[500px]" />
      <div className="bg-gradient-to-b from-[#080318]/50 to-[#080318] absolute top-0 w-full h-[500px] z-0" />

      <div className="relative z-10">
        <Navbar />
      </div>

      <div className="container max-w-[1130px] mx-auto pt-[100px] flex-1 relative z-10 pb-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-300">
            Have any questions or need assistance? We are here to help you 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-8">Contact Information</h2>
            <div className="space-y-8">
              <ContactInfo
                icon={<MapPin className="w-6 h-6 text-flysha-light-purple" />}
                title="Headquarters"
                content="123 Aviation Way, Sky City, SC 90210"
              />
              <ContactInfo
                icon={<Phone className="w-6 h-6 text-flysha-light-purple" />}
                title="Phone Number"
                content="+1 (220) 819-96"
              />
              <ContactInfo
                icon={<Mail className="w-6 h-6 text-flysha-light-purple" />}
                title="Email Support"
                content="support@flyhan.com"
              />
            </div>

            <div className="mt-12 bg-flysha-bg-purple/50 p-6 rounded-2xl border border-white/5">
              <h3 className="text-xl font-bold mb-2">Operation Hours</h3>
              <p className="text-gray-400">
                Our support team is available 24/7 to assist you with your
                booking and inquiries.
              </p>
            </div>
          </div>

          <div>
            <ContactForm />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function ContactInfo({ icon, title, content }: any) {
  return (
    <div className="flex items-start gap-4">
      <div className="bg-white/5 p-3 rounded-full border border-white/10">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-lg mb-1">{title}</h3>
        <p className="text-gray-400">{content}</p>
      </div>
    </div>
  );
}

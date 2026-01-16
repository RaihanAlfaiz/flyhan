import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { getUser } from "@/lib/auth";
import Image from "next/image";

export default async function AboutPage() {
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
            About FlyHan
          </h1>
          <p className="text-xl text-gray-300">
            Redefining air travel with premium experiences, affordable budgets,
            and world-class service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6 text-gray-300 leading-relaxed text-lg">
            <h2 className="text-3xl font-bold text-white">Our Mission</h2>
            <p>
              At FlyHan, we believe that flying should be more than just moving
              from point A to point B. It's about the journey, the comfort, and
              the memories created along the way.
            </p>
            <p>
              Our mission is to provide safe, reliable, and delightful air
              travel experiences to everyone, without breaking the bank.
            </p>
          </div>
          <div className="rounded-[30px] overflow-hidden border-4 border-white/10 shadow-2xl skew-y-3 hover:skew-y-0 transition-all duration-500 bg-flysha-light-purple/20 backdrop-blur-sm">
            <div className="h-[300px] flex items-center justify-center text-white font-bold text-2xl bg-gradient-to-br from-flysha-light-purple to-pink-600">
              FlyHan Experience
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard number="1M+" label="Happy Passengers" />
          <StatCard number="50+" label="Global Destinations" />
          <StatCard number="500+" label="Dedicated Crew" />
        </div>
      </div>

      <Footer />
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="bg-flysha-bg-purple p-8 rounded-[20px] text-center border border-white/5 hover:border-flysha-light-purple/50 transition-all">
      <h3 className="text-4xl font-extrabold text-flysha-light-purple mb-2">
        {number}
      </h3>
      <p className="text-gray-400 font-medium">{label}</p>
    </div>
  );
}

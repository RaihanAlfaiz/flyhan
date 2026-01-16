import Image from "next/image";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import ButtonLogout from "../components/button-logout";
import {
  getAllCities,
  getBestSelectives,
  getAllPackages,
  getActiveFlashSales,
} from "../lib/data";
import SearchForm from "../components/search-form";
import BestSelectiveSection from "../components/best-selective-section";
import FlashSaleSection from "../components/flash-sale-section";
import PackagesSection from "../components/packages-section";

import { User } from "lucia";

// Reusable components
function Navbar({ user }: { user: User | null }) {
  return (
    <nav className="container max-w-[1130px] mx-auto flex justify-between items-center pt-[30px]">
      <Link href="/" className="flex items-center shrink-0">
        <Image
          src="/assets/images/logos/logo.svg"
          alt="FlyHan Logo"
          width={120}
          height={40}
          priority
        />
      </Link>
      <ul className="flex gap-[30px] items-center w-fit">
        <li>
          <Link
            href="#FlashSale"
            className="font-medium text-white hover:text-flysha-light-purple transition-colors scroll-smooth"
          >
            Flash Sale
          </Link>
        </li>
        <li>
          <Link
            href="#Discover"
            className="font-medium text-white hover:text-flysha-light-purple transition-colors scroll-smooth"
          >
            Discover
          </Link>
        </li>
        <li>
          <Link
            href="#Packages"
            className="font-medium text-white hover:text-flysha-light-purple transition-colors scroll-smooth"
          >
            Packages
          </Link>
        </li>
        <li>
          <Link
            href="#Stories"
            className="font-medium text-white hover:text-flysha-light-purple transition-colors scroll-smooth"
          >
            Stories
          </Link>
        </li>
        <li>
          <Link
            href="#About"
            className="font-medium text-white hover:text-flysha-light-purple transition-colors scroll-smooth"
          >
            About
          </Link>
        </li>
        {user ? (
          <div className="flex items-center gap-4">
            <Link
              href="/my-tickets"
              className="font-bold text-flysha-black bg-flysha-light-purple rounded-full px-[20px] py-[10px] transition-all duration-300 hover:shadow-[0_10px_20px_0_#B88DFF] text-sm"
            >
              My Tickets
            </Link>

            <Link
              href="/my-packages"
              className="font-bold text-white border-2 border-flysha-light-purple rounded-full px-[20px] py-[10px] transition-all duration-300 hover:bg-flysha-light-purple hover:text-flysha-black text-sm"
            >
              My Packages
            </Link>

            <Link href="/profile/settings" title="Profile Settings">
              <div className="w-[48px] h-[48px] rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-transparent hover:border-flysha-light-purple transition-all">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    className="w-full h-full object-cover"
                    alt="avatar"
                  />
                ) : (
                  <span className="font-bold text-flysha-black">
                    {user.name.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
            </Link>
            <ButtonLogout />
          </div>
        ) : (
          <Link
            href="/signin"
            className="font-bold text-flysha-black bg-flysha-light-purple rounded-full px-[30px] py-[12px] transition-all duration-300 hover:shadow-[0_10px_20px_0_#B88DFF]"
          >
            Sign In
          </Link>
        )}
      </ul>
    </nav>
  );
}

function LogoSlider() {
  return (
    <div className="w-full flex items-center py-[50px] overflow-hidden">
      <div className="slider flex shrink-0 w-max">
        {[1, 2, 3].map((group) => (
          <div
            key={group}
            className="animate-[slide_10s_linear_infinite] flex gap-[50px] pl-[50px] items-center"
          >
            {[1, 2, 3, 4, 1, 2, 3, 4].map((num, index) => (
              <div
                key={`${group}-${index}`}
                className="flex w-fit h-[30px] shrink-0"
              >
                <Image
                  src={`/assets/images/logos/logoipsum${num}.png`}
                  className="w-full h-full object-contain"
                  alt="partner logo"
                  width={100}
                  height={30}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ServiceCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-[30px] w-[220px]">
      <div className="flex shrink-0 w-[70px] h-[70px] rounded-full items-center justify-center bg-flysha-light-purple">
        <Image src={icon} alt={title} width={32} height={32} />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-bold text-2xl leading-[36px]">{title}</p>
        <p className="leading-[30px] text-flysha-off-purple">{description}</p>
      </div>
    </div>
  );
}

function TestimonialCard() {
  return (
    <div className="testi-cards flex flex-col gap-[14px] h-full w-fit bg-flysha-bg-purple p-5 rounded-[20px] overflow-hidden">
      <p className="review leading-[30px] h-[90px] w-[305px]">
        I thought cheaper was not good, well, I personally never had this
        amazing experience. Thank you!!
      </p>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Image
            key={star}
            src="/assets/images/icons/Star.svg"
            className="w-5 h-5"
            alt="star"
            width={20}
            height={20}
          />
        ))}
      </div>
      <div className="flex gap-4 items-center">
        <div className="flex shrink-0 rounded-full w-[50px] h-[50px] overflow-hidden">
          <Image
            src="/assets/images/photos/Group 47.png"
            className="w-full h-full object-cover"
            alt="photo"
            width={50}
            height={50}
          />
        </div>
        <div className="flex flex-col gap-[2px]">
          <p className="font-bold">Jessi Lyio</p>
          <p className="text-sm text-flysha-off-purple">CPO Agolia Modd</p>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer
      id="About"
      className="flex flex-col justify-between mt-[150px] border-t-[6px] border-flysha-light-purple p-[100px_10px_30px]"
    >
      <div className="container max-w-[1130px] mx-auto flex justify-between relative">
        <Image
          src="/assets/images/icons/Ellipse 4.png"
          className="absolute h-[300px] -top-[45px] -left-[20px] z-0"
          alt="decoration"
          width={300}
          height={300}
        />
        <div className="flex shrink-0 h-fit z-10">
          <Image
            src="/assets/images/logos/logo.svg"
            alt="FlyHan Logo"
            width={120}
            height={40}
          />
        </div>
        <div className="flex gap-[100px] z-10">
          <div className="flex flex-col gap-5">
            <p className="font-bold text-lg">Explore</p>
            <Link
              href="#"
              className="font-medium hover:font-semibold hover:text-flysha-light-purple transition-all duration-300"
            >
              Services
            </Link>
            <Link
              href="#"
              className="font-medium hover:font-semibold hover:text-flysha-light-purple transition-all duration-300"
            >
              Testimonials
            </Link>
            <Link
              href="#"
              className="font-medium hover:font-semibold hover:text-flysha-light-purple transition-all duration-300"
            >
              Pricing
            </Link>
            <Link
              href="#"
              className="font-medium hover:font-semibold hover:text-flysha-light-purple transition-all duration-300"
            >
              About
            </Link>
          </div>
          <div className="flex flex-col gap-5">
            <p className="font-bold text-lg">Services</p>
            <Link
              href="#"
              className="font-medium hover:font-semibold hover:text-flysha-light-purple transition-all duration-300"
            >
              Pickup at Home
            </Link>
            <Link
              href="#"
              className="font-medium hover:font-semibold hover:text-flysha-light-purple transition-all duration-300"
            >
              First Lounge Plus
            </Link>
            <Link
              href="#"
              className="font-medium hover:font-semibold hover:text-flysha-light-purple transition-all duration-300"
            >
              Business Room
            </Link>
            <Link
              href="#"
              className="font-medium hover:font-semibold hover:text-flysha-light-purple transition-all duration-300"
            >
              Bentley Power
            </Link>
          </div>
          <div className="flex flex-col gap-5">
            <p className="font-bold text-lg">About</p>
            <Link
              href="#"
              className="font-medium hover:font-semibold hover:text-flysha-light-purple transition-all duration-300"
            >
              Company Profile
            </Link>
            <Link
              href="#"
              className="font-medium hover:font-semibold hover:text-flysha-light-purple transition-all duration-300"
            >
              Our Investors
            </Link>
            <Link
              href="#"
              className="font-medium hover:font-semibold hover:text-flysha-light-purple transition-all duration-300"
            >
              Media Press
            </Link>
            <Link
              href="#"
              className="font-medium hover:font-semibold hover:text-flysha-light-purple transition-all duration-300"
            >
              Careers
            </Link>
          </div>
          <div className="flex flex-col gap-5">
            <p className="font-bold text-lg">Connect</p>
            <Link
              href="#"
              className="font-medium hover:font-semibold hover:text-flysha-light-purple transition-all duration-300 flex items-center gap-[6px]"
            >
              <Image
                src="/assets/images/icons/call.svg"
                alt="icon"
                width={20}
                height={20}
              />
              +1 2208 1996
            </Link>
            <Link
              href="#"
              className="font-medium hover:font-semibold hover:text-flysha-light-purple transition-all duration-300 flex items-center gap-[6px]"
            >
              <Image
                src="/assets/images/icons/dribbble.svg"
                alt="icon"
                width={20}
                height={20}
              />
              buildwithangga
            </Link>
            <Link
              href="#"
              className="font-medium hover:font-semibold hover:text-flysha-light-purple transition-all duration-300 flex items-center gap-[6px]"
            >
              <Image
                src="/assets/images/icons/sms.svg"
                alt="icon"
                width={20}
                height={20}
              />
              team@bwa.com
            </Link>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-[60px] text-[#A0A0AC] text-sm z-10">
        All Rights Reserved. Copyright FlyHan 2024.
      </p>
    </footer>
  );
}

export default async function Home() {
  const { session, user } = await getUser();
  const isLoggedIn = !!session;
  const cities = await getAllCities();
  // Fetch unlimited/latest selectives
  const selectives = await getBestSelectives();
  const packages = await getAllPackages();
  const flashSales = await getActiveFlashSales();

  return (
    <div className="text-white font-sans bg-flysha-black">
      {/* Header Section */}
      <section
        id="Header"
        className="bg-[url('/assets/images/background/airplane.png')] bg-no-repeat bg-cover bg-left-top -z-10"
      >
        <div className="bg-gradient-to-r from-[#080318] to-[rgba(8,3,24,0)] z-0">
          <Navbar user={user} />

          {/* Hero Section */}
          <div className="hero-section container max-w-[1130px] w-full mx-auto flex flex-col gap-[90px] mt-[103px]">
            <div className="title flex flex-col gap-[30px]">
              <h1 className="font-extrabold text-[80px] leading-[90px]">
                Best Flights. <br />
                Cheaper Budget.
              </h1>
              <p className="font-medium text-lg leading-[36px]">
                No more long queue, get more delicious heavy meals. <br />
                Crafted by best talented people around the world.
              </p>
            </div>

            {/* Search Form */}
            <SearchForm cities={cities} />
          </div>

          <LogoSlider />
        </div>
      </section>

      {/* Flash Sale Section */}
      <FlashSaleSection flashSales={flashSales} />

      {/* Services Section */}
      <section
        id="Services"
        className="container max-w-[1130px] mx-auto flex flex-col pt-[100px] gap-[30px]"
      >
        <h2 className="font-bold text-[32px] leading-[48px] text-center">
          We Ensure You <br />
          Fly With Us Forever
        </h2>
        <div className="flex justify-between">
          <ServiceCard
            icon="/assets/images/icons/profile-2user.svg"
            title="Talented Crew"
            description="Our jets protected by metal that can't be destroyed."
          />
          <ServiceCard
            icon="/assets/images/icons/shield-tick.svg"
            title="Safe Guard"
            description="Our jets protected by metal that can't be destroyed."
          />
          <ServiceCard
            icon="/assets/images/icons/crown.svg"
            title="Best Awards"
            description="Our jets protected by metal that can't be destroyed."
          />
          <ServiceCard
            icon="/assets/images/icons/building-3.svg"
            title="Pickup at Home"
            description="Our jets protected by metal that can't be destroyed."
          />
        </div>
      </section>

      {/* Discover Section */}
      <BestSelectiveSection selectives={selectives} />

      {/* Packages Section */}
      <PackagesSection packages={packages} />

      {/* Stories (Testimonials) Section */}
      <section
        id="Stories"
        className="w-full flex flex-col pt-[100px] gap-[30px]"
      >
        <div className="flex flex-col gap-[6px] items-center">
          <h2 className="font-bold text-[32px] leading-[48px] text-center">
            Travel Stories
          </h2>
          <p className="font-medium text-flysha-off-purple">
            Read about experiences from our happy travelers
          </p>
        </div>
        <div className="testimonial-slider w-full overflow-hidden">
          <div className="slider flex shrink-0 w-max">
            {[1, 2, 3].map((group) => (
              <div
                key={group}
                className="animate-[slide_15s_linear_infinite] flex gap-[30px] pl-[30px] items-center h-[228px]"
              >
                {[1, 2, 3, 4].map((card) => (
                  <TestimonialCard key={`${group}-${card}`} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

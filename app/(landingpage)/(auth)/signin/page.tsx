import Image from "next/image";
import Link from "next/link";
import FormSignin from "./components/form-signin";

export default function SigninPage() {
  return (
    <section
      id="Signin"
      className="bg-[url('/assets/images/background/airplane.png')] bg-no-repeat bg-cover bg-left-top -z-10 min-h-screen"
    >
      <div className="bg-gradient-to-r from-[#080318] to-[rgba(8,3,24,0)] z-0 min-h-screen">
        {/* Navbar */}
        <nav
          id="Navbar"
          className="container max-w-[1130px] mx-auto flex justify-between items-center pt-[30px]"
        >
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/assets/images/logos/logo.svg"
              alt="logo"
              width={120}
              height={40}
              priority
            />
          </Link>
          <ul className="flex gap-[30px] items-center w-fit">
            <li>
              <Link
                href="#"
                className="font-medium text-white hover:text-flysha-light-purple transition-colors"
              >
                Flash Sale
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="font-medium text-white hover:text-flysha-light-purple transition-colors"
              >
                Discover
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="font-medium text-white hover:text-flysha-light-purple transition-colors"
              >
                Packages
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="font-medium text-white hover:text-flysha-light-purple transition-colors"
              >
                Stories
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="font-medium text-white hover:text-flysha-light-purple transition-colors"
              >
                About
              </Link>
            </li>
            <Link
              href="/signup"
              className="font-bold text-flysha-black bg-flysha-light-purple rounded-full px-[30px] py-[12px] transition-all duration-300 hover:shadow-[0_10px_20px_0_#B88DFF]"
            >
              Sign Up
            </Link>
          </ul>
        </nav>

        {/* Main Content */}
        <div className="flex flex-col justify-between min-h-[calc(100vh-78px)]">
          <div className="container max-w-[1130px] w-full mx-auto flex flex-col gap-[30px] mt-[53px]">
            {/* Title */}
            <div className="flex flex-col gap-1">
              <h1 className="font-bold text-[32px] leading-[48px] text-white">
                Sign In
              </h1>
              <p className="font-medium text-lg leading-[27px] text-white/80">
                Welcome back! Continue your journey
              </p>
            </div>

            {/* Form Component */}
            <FormSignin />
          </div>

          {/* Company Logos Slider */}
          <div className="w-full flex items-center py-[50px] bottom-0 overflow-hidden">
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
        </div>
      </div>
    </section>
  );
}

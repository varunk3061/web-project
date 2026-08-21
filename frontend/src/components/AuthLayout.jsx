import Image from "next/image";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex">

      {/* Left Side hidden kele karn size jar small zali tar left side hide honar*/}
      <div className="hidden w-1/2 items-center justify-center bg-blue-300 p-10 md:flex">

        <div className="text-center text-white">

          <Image
            src="/logo.png"
            alt="Flipkart Logo"
            width={180}
            height={60}
            className="mx-auto mb-8"
          />


          <h1 className="text-4xl font-bold">
            Shop Smarter
          </h1>


          <p className="mt-4 text-lg text-blue-100">
            Discover amazing products at the best prices.
          </p>


          <Image
            src="/Logo.png"
            alt="Shopping Illustration"
            width={350}
            height={350}
            className="mx-auto mt-10"
          />

        </div>

      </div>


      {/* Right Side */}
      <div className="flex w-full items-center justify-center p-6 md:w-1/2">

        {children}

      </div>


    </div>
  );
}


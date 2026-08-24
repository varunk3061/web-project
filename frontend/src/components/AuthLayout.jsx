export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen">

      {/* Left Side hidden kele karn size jar small zali tar left side hide honar*/}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-linear-to-br from-blue-600 via-blue-700 to-indigo-800 p-10 md:flex">

        {/* decorative shapes */}
        <div className="pointer-events-none absolute -left-16 -top-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-10 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="pointer-events-none absolute right-10 top-1/4 h-24 w-24 rotate-12 rounded-2xl border border-white/20" />
        <div className="pointer-events-none absolute bottom-1/4 left-10 h-16 w-16 -rotate-12 rounded-xl border border-white/20" />

        <div className="relative z-10 text-center text-white">

          <h1 className="text-4xl font-bold">
            Shop Smarter
          </h1>


          <p className="mx-auto mt-4 max-w-xs text-lg text-blue-100">
            Discover amazing products at the best prices.
          </p>


          <div className="mx-auto mt-12 flex max-w-sm items-center justify-center gap-3">

            <div className="h-24 w-16 rounded-xl bg-white/15 backdrop-blur-sm" />
            <div className="h-32 w-20 rounded-xl bg-white/25 backdrop-blur-sm" />
            <div className="h-24 w-16 rounded-xl bg-white/15 backdrop-blur-sm" />

          </div>

        </div>

      </div>


      {/* Right Side */}
      <div className="flex w-full items-center justify-center p-6 md:w-1/2">

        {children}

      </div>


    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-4">


        {/* About */}
        <div>
          <h2 className="mb-4 text-xl font-bold text-white">
            AuraBazar
          </h2>

          <p className="text-sm leading-6">
            Your one-stop destination for shopping fashion,
            electronics, mobiles and more at the best prices.
          </p>
        </div>


        {/* Quick Links */}
        <div>
          <h3 className="mb-4 font-semibold text-white">
            Quick Links
          </h3>

          <ul className="space-y-2 text-sm">
            <li>Home</li>
            <li>Products</li>
            <li>About Us</li>
            <li>Contact</li>
          </ul>
        </div>


        {/* Customer Service */}
        <div>
          <h3 className="mb-4 font-semibold text-white">
            Customer Service
          </h3>

          <ul className="space-y-2 text-sm">
            <li>Help Center</li>
            <li>Returns</li>
            <li>Shipping</li>
            <li>Privacy Policy</li>
          </ul>
        </div>


        {/* Contact */}
        <div>
          <h3 className="mb-4 font-semibold text-white">
            Contact
          </h3>

          <p className="text-sm">
            Email: support@aurabazzar.com
          </p>

          <p className="mt-2 text-sm">
            Phone: +91 0000 00 0000
          </p>
        </div>


      </div>


      {/* Bottom Bar */}
      <div className="border-t border-gray-700 py-4 text-center text-sm">
        © 2026 Aurabazar. All rights reserved.
      </div>


    </footer>
  );
}
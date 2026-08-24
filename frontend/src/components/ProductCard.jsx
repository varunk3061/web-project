import Image from "next/image";
import Link from "next/link";

export default function ProductCard({ product }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* Product Image */}
      <div className="relative h-72 w-full overflow-hidden bg-gray-50">
        <Image
          src={product.imageUrls || "/placeholder.png"}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-contain p-4 transition duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">

        {/* Product Name */}
        <h3 className="truncate text-base font-semibold text-gray-900">
          {product.title}
        </h3>

        {/* Price */}
        <p className="mt-1 text-lg font-bold text-gray-900">
          ₹{
            product.variants && product.variants.length > 0 ? product.variants[0].price: product.price
          }
        </p>

        {/* View Details */}
        <Link
          href={`/products/${product.productUuid}`}
          className="mt-4 block rounded-lg bg-blue-600 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98]"
        >
          View Details
        </Link>

      </div>

    </div>
  );
}

import Image from "next/image";
import Link from "next/link";

export default function ProductCard({ product }) {
  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

      {/* Product Image */}
      <div className="relative h-56 w-full overflow-hidden rounded-xl bg-gray-50">
        <Image
          src={product.imageUrls || "/placeholder.png"}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-contain p-4 transition duration-300 group-hover:scale-105"
        />
      </div>

      {/* Product Name */}
      <h3 className="mt-4 truncate text-lg font-semibold text-gray-900">
        {product.title}
      </h3>

      {/* Price */}
      <p>
        ₹{
          product.variants && product.variants.length > 0 ? product.variants[0].price: product.price
        }
      </p>

      {/* View Details */}
      <Link
        href={`/products/${product.productUuid}`}
        className="mt-4 block rounded-lg bg-blue-600 py-2.5 text-center font-semibold text-white transition hover:bg-blue-700"
      >
        View Details
      </Link>

    </div>
  );
}
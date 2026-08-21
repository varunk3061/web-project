"use client"; //it means this component will be rendered on the client side and not on the server side

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import Image from "next/image"


export default function ProductGrid(){

  const [products,setProducts] = useState([]);

  //it fetches the all products from backend and stores in products state variable. 
  useEffect(()=>{ 

    fetch("http://localhost:8000/products")
      .then((response)=>response.json())
      .then((data)=>{
        setProducts(data);
      })
      .catch((error)=>{
        console.log(error);
      });


  },[]);



  return (

    <section className="py-12">

      <div className="mx-auto max-w-7xl px-6">


        <h2 className="mb-8 text-3xl font-bold">
          Featured Products
        </h2>


        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">


          {
            products.map((product)=>(
              
              <ProductCard
                key={product.productUuid}
                product={product}
              />

            ))
          }


        </div>


      </div>

    </section>

  );

}
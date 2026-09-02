"use client"; //it means this component will be rendered on the client side and not on the server side

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";



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

    <section className="bg-gray-50 py-14">

      <div className="mx-auto max-w-7xl px-6">


        <div className="mb-8 flex items-end justify-between">

          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Products
            </h2>
            
          </div>

        </div>


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

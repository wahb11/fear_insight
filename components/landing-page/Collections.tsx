"use client"

import React from "react"

import { motion} from "framer-motion"
import { CollectionsProductCard } from "./CollectionsProductCard"
import { useAllProducts } from "@/hooks/useAllProducts"


export default function Collections() {
     const { data, isLoading, error } = useAllProducts()
     const products = data? data.filter(product => product.featured) : [];
   
     if(isLoading){
        return <div>Loading...</div>
     }
        if(error){
        return <div className="text-center text-stone-300">Error loading products</div>
    }
  return (
   <section id="products" className="py-20 px-4 relative bg-stone-900">
             <div className="container mx-auto">
               <motion.div
                 initial={{ opacity: 0, y: 100 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.4 }}
                 viewport={{ once: true }}
                 className="text-center mb-16"
               >
                 <motion.h2
                   className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-stone-100 to-stone-500 bg-clip-text text-transparent"
                   initial={{ opacity: 0, scale: 0.5 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   transition={{ duration: 0.4 }}
                   viewport={{ once: true }}
                 >
                   Featured products (description to be changed)
                 </motion.h2>
   
                 <motion.div
                   className="w-24 h-1 bg-gradient-to-r from-stone-700 to-stone-900 mx-auto mb-6"
                   initial={{ width: 0 }}
                   whileInView={{ width: 96 }}
                   transition={{ duration: 0.4, delay: 0.15 }}
                   viewport={{ once: true }}
                 />
   
                 <motion.p
                   className="text-xl text-stone-400 max-w-2xl mx-auto"
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.4, delay: 0.2 }}
                   viewport={{ once: true }}
                 >
                   Premium streetwear designed with purpose and crafted with precision. Each piece tells a story of faith,
                   courage, and divine inspiration.
                 </motion.p>
               </motion.div>
   
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {products && products.map((product, index) => (
                   <CollectionsProductCard
                     product={product}
                     index={index}
                   />
                 ))}
               </div>
             </div>
           </section>
   
  )
}

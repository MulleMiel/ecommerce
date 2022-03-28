import React,  { useEffect, useState } from 'react';
import './Homepage.css';
import Product from '../Product/Product';


export default function Homepage() {
  const [products, setProducts] = useState([]);

  const getProducts = async () => {
    const res = await fetch(`/api/products`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if(res.ok){
      const products = await res.json();
      setProducts(products);
      return;
    }
  }

  useEffect(() => {
    getProducts();
  }, []);
  
  return(
    <div>
      <section id="products">
        { products.map(product => 
        <Product product={product} key={product.id} />) 
        }
      </section>
    </div>
  );
}
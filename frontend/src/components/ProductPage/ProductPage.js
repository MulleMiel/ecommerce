import React,  { useEffect, useState } from 'react';
import { 
  useParams
} from 'react-router-dom';
import './ProductPage.css';
import { useAuth } from '../../providers/auth';
import { useCart } from '../../providers/cart';

import { NumberInput } from '../partials/form';

export default function ProductPage() {
  const auth = useAuth();
  const cart = useCart();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);

  const [isLoading, setIsLoading ] = useState(false);

  const getProduct = async () => {
    const res = await fetch(`/api/products/${id}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if(res.ok){
      const product = await res.json();
      setProduct(product);
      return;
    }
  }

  const onChangeHandler  = (e) => {
    const input = e.target;
    const qty = input.value;
    if(!isNaN(qty) && qty > 0){
      setQty(qty);
    }
  }

  const onAddHandler  = () => {
    setQty(qty + 1);
  }

  const onSubHandler  = () => {
    if(qty > 1){
      setQty(qty - 1);
    }
  }

  const onAddToCartHandler  = async () => {
    setIsLoading(true);
    await cart.addItems(id, qty);
    setIsLoading(false);
  }

  useEffect(() => {
    getProduct();
  }, []);

  if(!product){
    return null;
  }
  
  return(
    <div>
      <section id="product">
        <div className='image-wrapper'>
          <div className="image">
            <img src={product.image} title={product.name} alt={product.name}/>
          </div>
        </div>
        <div className="info">
          <h1>{product.name}</h1>
          <div className="add-to-cart">
            <div className="price">{ product.price / 100}</div>
            { auth.user.loggedIn && <div className="buttons">
              <NumberInput qty={qty} onChangeHandler={onChangeHandler} onAddHandler={onAddHandler} onSubHandler={onSubHandler}/>
              <button className={ `add-to-cart-button btn ${isLoading && 'loading'}` } onClick={onAddToCartHandler}>Add to cart<div className='loader-anim'></div></button></div>
            }
          </div>
          <div className="description" dangerouslySetInnerHTML={{ __html: product.description }}></div>
        </div>
      </section>
    </div>
  );
}
import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setCart] = useState(null);

  const reset = async () => {
    setCart(null);
  }
  
  const getCart = async (callback = () => {}) => {
    const res = await fetch(`/api/carts/mine/`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if(res.ok){
      const data = await res.json();
      setCart(data.items);
      callback(data.items);
    }
  }

  const addItems = async (id, qty) => {
    const res = await fetch(`/api/carts/mine/items`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productId: parseInt(id),
        qty
      })
    });
    if(res.ok){
      const data = await res.json();
      setCart(data.items);
    }
  }

  const updateItem = async (index, qty) => {
    const item = items[index];
    const res = await fetch(`/api/carts/mine/items/${item.cartitemid}`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        qty
      })
    });
    if(res.ok){
      const data = await res.json();
      items[index].qty = data.qty;
      setCart([...items]);
    }
  }

  const removeItem = async (index, callback = () => {}) => {
    const item = items[index];
    const res = await fetch(`/api/carts/mine/items/${item.cartitemid}`, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if(res.ok){
      const data = await res.json();
      items.splice(index, 1);
      setCart([...items]);
      callback(data.id);
    }
  }

  const checkout = async (callback) => {
    
    const res = await fetch(`/api/carts/mine/checkout`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cartId: items[0].cartid,
      })
    });
    if(res.ok){
      if(res.redirected) return callback(res.url);
    }
    callback(null)
  }

  const value = { items, reset, getCart, addItems, updateItem, removeItem, checkout };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
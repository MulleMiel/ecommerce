import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setCart] = useState(null);
  
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
      const { cartid, productid, id, qty } = await res.json();
      const itemIndex = items?.findIndex(item => item.productid === productid);
      if(itemIndex !== -1){
        items[itemIndex].qty = qty;
        setCart([...items]);
      } else {
        setCart([...items, {
          cartitemid: id,
          id: cartid,
          productid,
          qty
        }]);
      }
    }
  }

  const value = { items, getCart, addItems };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
import { createContext, useContext, useState } from 'react';

const OrdersContext = createContext();

export function OrdersProvider({ children }) {
  const [items, setOrders] = useState(null);

  const getOrders = async (callback = () => {}) => {
    const res = await fetch(`/api/orders`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if(res.ok){
      const data = await res.json();
      setOrders(data);
      callback(data);
    }
  }

  const getOrder = async (orderId, callback = () => {}) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if(res.ok){
      const data = await res.json();
      callback(data);
    }
  }

  const value = { items, getOrders, getOrder };

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  return useContext(OrdersContext);
}
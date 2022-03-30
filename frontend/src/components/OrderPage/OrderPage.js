import './OrderPage.css';
import React, { useEffect, useState } from 'react';
import { 
  Link,
  useParams
} from 'react-router-dom';
import { useAuth } from '../../providers/auth';
import { useOrders } from '../../providers/order';


export default function OrderPage() {
  const auth = useAuth();
  const orders = useOrders();
  const [order, setOrder] = useState();
  const { orderId } = useParams();

  useEffect(() => {
    orders.getOrder(orderId, (data) => {
      setOrder(data);
    });
  }, []);

  if(!auth.user) return null;
  if(!order) return null;

  return(
    <div id="order">
       <h1>Order #{order.id}</h1>
       <table id="order-details">
        <tbody>
          <tr>
            <td>Status: </td>
            <td>{ order.status }</td>
          </tr>
          <tr>
            <td>Total amount: </td>
            <td>{ order.total / 100}</td>
          </tr>
          <tr>
            <td>Placed on: </td>
            <td>{ new Date(order.created).toLocaleDateString() }</td>
          </tr>
        </tbody>
       </table>
       <table id='order-items'>
         <tbody>
          <tr className='item'>
            <th>Nr.</th>
            <th>Name</th>
            <th>Price</th>
            <th>Amount</th>
          </tr>
          { order.items?.length ?
          order.items.map(item => <OrderItem key={item.id} item={item} />)
          : <tr><td colSpan="100"><p>No orders items found.</p></td></tr> }
         </tbody>
       </table>
    </div>
  );
}

function OrderItem ({ item }) {
  const { productid, name, price, qty } = item;
  return (
    <tr className='item'>
      <td>{ productid }</td>
      <td>{ name }</td>
      <td>{ price / 100 }</td>
      <td>{ qty }</td>
      <td><Link className='btn' to={ `/product/${productid}` }>View</Link></td>
    </tr>
  )
}
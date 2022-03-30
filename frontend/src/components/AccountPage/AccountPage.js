import './AccountPage.css';
import React, { useEffect } from 'react';
import { 
  Link
} from 'react-router-dom';
import { useAuth } from '../../providers/auth';
import { useOrders } from '../../providers/order';

export default function Account() {
  const auth = useAuth();
  const orders = useOrders();

  useEffect(() => {
    orders.getOrders();
  }, []);

  if(!auth.user) return;

  return(
    <div id="account">
       <h1>Account</h1>
       <div className='account-title'>{ auth.user.firstname } { auth.user.lastname }</div>
       <h2>Orders</h2>
       <table id='orders'>
         <tbody>
          <tr className='item'>
            <th>Nr.</th>
            <th>Date</th>
            <th>Status</th>
            <th>Total</th>
            <th></th>
          </tr>
          { orders.items?.length ?
          orders.items.map(item => <Order key={item.id} item={item} />)
          : <tr><td colSpan="100"><p>No orders found.</p></td></tr> }
         </tbody>
       </table>
    </div>
  );
}

function Order ({ item }) {
  const { id, created, status, total } = item;
  return (
    <tr className='item'>
      <td>{ id }</td>
      <td>{ new Date(created).toLocaleDateString() }</td>
      <td>{ status }</td>
      <td>{ total / 100 }</td>
      <td><Link className='btn' to={ `/account/order/${id}` }>View</Link></td>
    </tr>
  )
}
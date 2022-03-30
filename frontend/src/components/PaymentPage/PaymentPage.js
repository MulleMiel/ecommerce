import './PaymentPage.css';
import { useAuth } from '../../providers/auth';

export default function PaymentPage() {
  const auth = useAuth();
  const query = new URLSearchParams(window.location.search);

  if(!auth.user) return;

  if(query.get("success")){
    return (
      <div id="payment">
         <h1>Order placed!</h1>
         <p>You will receive an email confirmation.</p>
      </div>
    );
  }

  if(query.get("canceled")){
    return (
      <div id="payment">
         <h1>Order canceled</h1>
         <p>Continue to shop around and checkout when you're ready.</p>
      </div>
    );
  }

  return null;
}
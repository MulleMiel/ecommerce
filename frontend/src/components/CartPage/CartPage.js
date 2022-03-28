import './CartPage.css';
import { useEffect, useState } from 'react';
import { 
  Link
} from 'react-router-dom';

import { useAuth } from '../../providers/auth';
import { useCart } from '../../providers/cart';

import { NumberInput } from '../partials/form';
import { SaveIcon, TrashCan } from '../partials/icons';

export default function CartPage() {
  const auth = useAuth();
  const cart = useCart();

  const [subtotals, setSubtotals] = useState([]);

  useEffect(() => {
    cart.getCart((items) => {
      const initialSubtotals = items.map(item => item.qty);
      setSubtotals(initialSubtotals);
    });
  }, []);

  // our onChange handler will update the index of "subtotals"
  // with the passed new value
  const onChange = (newValue, i) => {
    setSubtotals(oldSubtotals => {
      const newSubtotals = [...oldSubtotals];
      newSubtotals[i] = newValue;
      return newSubtotals;
    });
  }

  let total = 0;
  for (let i = 0; i < subtotals.length; i++) {
    total += subtotals[i] * cart.items[i].price;
  }

  if(!auth.user) return;

  return(
    <div id="account">
      <h1>Cart</h1>
      <div id="cart">
        { cart.items.length ? cart.items.map((item, index) => {
          if(item.price && subtotals.length) {
            return <CartItem key={ item.id } item={item} onChange={onChange} index={index} lQty={subtotals[index]} />;
          }
        }) : <p>No items found in your cart.</p> }
        <div className='total-price'>Total amount: { total / 100 }</div>
      </div>
    </div>
  );
}

function CartItem ({ item, onChange, index, lQty }) {
  const { productid, image, name, qty, price } = item;

  const onChangeHandler  = (e) => {
    const input = e.target;
    const nQty = input.value;
    if(!isNaN(nQty) && nQty > 0){
      onChange(nQty, index);
    }
  }

  const onAddHandler  = () => {
    onChange(lQty + 1, index);
  }

  const onSubHandler  = () => {
    if(lQty > 1){
      onChange(lQty - 1, index);
    }
  }

  return (
    <div className="item">
      <Link to={`/product/${productid}`} className='image'>
        <img src={image} alt={name} />
      </Link>
      <div className='info'>
        <h3 className='title'>{ name }</h3>
        <div className='price item-single-price'>{price / 100}</div>
      </div>
      <NumberInput qty={lQty} onChangeHandler={onChangeHandler} onAddHandler={onAddHandler} onSubHandler={onSubHandler}/>
      <div className='price item-total-price'>{ Math.round(price * lQty) / 100 }</div>
      <button className={`btn ${ qty === lQty ? 'disabled' : ''}`}><SaveIcon /></button>
      <button className='btn'><TrashCan /></button>
    </div>
  )
}
import './CartPage.css';
import { useEffect, useState } from 'react';
import { 
  Link, useLocation
} from 'react-router-dom';

import { useAuth } from '../../providers/auth';
import { useCart } from '../../providers/cart';

import { NumberInput } from '../partials/form';
import { SaveIcon, TrashCan } from '../partials/icons';

export default function CartPage() {
  const auth = useAuth();
  const cart = useCart();
  const location = useLocation();

  const [subtotals, setSubtotals] = useState([]);

  useEffect(() => {
    if(cart.items){
      const initialSubtotals = cart.items.map(item => item.qty);
      setSubtotals(initialSubtotals);
    }
  }, [cart.items]);

  const onChange = (newValue, i) => {
    setSubtotals(oldSubtotals => {
      const newSubtotals = [...oldSubtotals];
      newSubtotals[i] = newValue;
      return newSubtotals;
    });
  }

  const onSave = (index) => {
    cart.updateItem(index, subtotals[index]);
  }

  const onRemove = (index) => {
    cart.removeItem(index, () => {
      setSubtotals(oldSubtotals => {
        const newSubtotals = [...oldSubtotals];
        newSubtotals.splice(index, 1);
        return newSubtotals;
      });
    });
  }

  // const onCheckoutHandler = () => {
  //   cart.checkout((redirectLink) => {
  //     window.location.replace(redirectLink);
  //   });
  // }

  let total = 0;
  if(cart?.items?.length === subtotals.length){
    total = subtotals.reduce((prevSubtotal, currentSubtotal, currentIndex) => {
      return prevSubtotal + currentSubtotal * cart.items[currentIndex].price;
    }, 0);
  }
  
  if(!auth.user) return;

  return(
    <div id="cart-page">
      <h1>Cart</h1>
      <div id="cart">
        { cart.items?.length ? cart.items.map((item, index) => {
          if(item.price && subtotals.length) {
            return <CartItem 
            key={ item.id } 
            item={item} 
            onChange={onChange} 
            onSave={onSave} 
            onRemove={onRemove} 
            index={index} 
            lQty={subtotals[index]} />;
          }
          return null;
        }) : <p>No items found in your cart.</p> }
        { cart.items?.length &&
          <div className='buttons'>
            <div className='total-price'>Total amount: { total / 100 }</div>
            <form action="/api/carts/mine/checkout" method="POST">
              <input type="hidden" name="cartId" value={cart.items[0].cartid}/>
              <button type="submit" className='btn'>
                Checkout
              </button>
            </form>
          </div>
        }
      </div>
    </div>
  );
}

function CartItem ({ item, index, lQty, onChange, onSave, onRemove }) {
  const { id, image, name, qty, price } = item;

  const onChangeHandler  = (e) => {
    const input = e.target;
    const nQty = input.value;
    if(!isNaN(nQty) && nQty > 0){
      onChange(nQty, index);
    }
  }

  const onAddHandler = () => {
    onChange(lQty + 1, index);
  }

  const onSubHandler = () => {
    if(lQty > 1){
      onChange(lQty - 1, index);
    }
  }

  const onSaveHandler = () => {
    onSave(index);
  }

  const onRemoveHandler = () => {
    onRemove(index);
  }

  return (
    <div className="item">
      <Link to={`/product/${id}`} className='image'>
        <img src={image} alt={name} />
      </Link>
      <div className='info'>
        <h3 className='title'>{ name }</h3>
        <div className='price item-single-price'>{price / 100}</div>
      </div>
      <NumberInput qty={lQty} onChangeHandler={onChangeHandler} onAddHandler={onAddHandler} onSubHandler={onSubHandler}/>
      <div className='price item-total-price'>{ Math.round(price * lQty) / 100 }</div>
      <button onClick={onSaveHandler} className={`btn ${ qty === lQty ? 'disabled' : ''}`}><SaveIcon /></button>
      <button onClick={onRemoveHandler} className='btn'><TrashCan /></button>
    </div>
  )
}
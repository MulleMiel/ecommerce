import './forms.css';
import { PlusSign, MinusSign } from './icons';

export function NumberInput ({ qty, onChangeHandler, onAddHandler, onSubHandler }) {
  return (
    <div className="number-input">
      <input type="number" min="0" value={qty} onChange={onChangeHandler}/>
      <button className="button btn add" onClick={onAddHandler}><PlusSign /></button>
      <button className="button btn sub" onClick={onSubHandler}><MinusSign /></button>
    </div>
  )
}
import './Product.css'
import { 
  useNavigate
} from 'react-router-dom';

export default function Product ({ product }) {
  const { id, name, price, image } = product;
  const navigate = useNavigate();

  const onClickHandler = (e) => {
    e.preventDefault();
    navigate(`/product/${id}`);
  }

  return (
    <div className="product">
      <div className="inner" onClick={onClickHandler}>
        <div className="image">
          <img src={image} title={name} alt={name}/>
        </div>
        <div className="info">
          <h3>{name}</h3>
          <div className="price">{ price / 100}</div>
        </div>
      </div>
    </div>
  );
}
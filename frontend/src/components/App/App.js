import React, { useEffect } from 'react';
import './App.css';
import { 
  Route, 
  Routes, 
  useNavigate,
  useLocation,
  Outlet,
  Link
} from 'react-router-dom';

import { AuthProvider, PreventWhenAuth, RequireAuth, useAuth } from '../../providers/auth';
import { CartProvider, useCart } from '../../providers/cart';


// PAGES
import LoginPage from '../LoginPage/LoginPage';
import RegisterPage from '../RegisterPage/RegisterPage';
import Homepage from '../Homepage/Homepage';
import ProductPage from '../ProductPage/ProductPage';
import AccountPage from '../AccountPage/AccountPage';
import CartPage from '../CartPage/CartPage';

import { ShoppingBasket, UserIcon } from '../partials/icons';

function App() {

  return (
    <div className="wrapper">
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Homepage />}/>
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/login" element={
                <PreventWhenAuth>
                  <LoginPage />
                </PreventWhenAuth>
              } />
              <Route path="/register" element={
                <PreventWhenAuth>
                  <RegisterPage />
                </PreventWhenAuth>
              } />
              <Route path="/account" element={
                <RequireAuth>
                  <AccountPage />
                </RequireAuth>
                } />
              <Route path="/cart" element={
                <RequireAuth>
                  <CartPage />
                </RequireAuth>
                } />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </div>
  );
}

function Layout() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const cart = useCart();

  useEffect(() => {
    auth.check(() => {
      cart.getCart();
    });
  }, []);

  if(auth.user === null) return null;

  return (
    <div>
      <header>
        <div className="logo">
          <img src="https://svgsilh.com/svg/2027989.svg" alt="Plants"/> Plants
        </div>
        <nav>
          { location.pathname !== "/" && <Link to="/">Overview</Link> }
          { auth.user.loggedIn && <Link to="/account"><UserIcon />&nbsp;{ auth.user.firstname[0] + "." }</Link> }
          { cart?.items?.length > 0 && <Link to="/cart"><ShoppingBasket /><div className='amount'>{cart.items.length}</div></Link> }
          { auth.user.loggedIn && <Link to="/logout" onClick={() => { auth.signout(() => navigate("/")) }}>Logout</Link> }
          { !auth.user.loggedIn && <Link to="/login">Login</Link> }
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer></footer>
    </div>
  );
}

export default App;
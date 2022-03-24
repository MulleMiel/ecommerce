import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './LoginPage.css';
import { useAuth } from "../App/App";

export default function LoginPage() {
  let navigate = useNavigate();
  let location = useLocation();
  let auth = useAuth();
  const [ email, setEmail ] = useState();
  const [ password, setPassword ] = useState();
  const [ error, setError ] = useState();

  let from = location.state?.from?.pathname || "/";

  const handleSubmit = async e => {
    e.preventDefault();

    auth.signin({ email, password }, (error, user) => {

      if(!user) {
        return setError(error);
      }
      
      navigate(from, { replace: true });
    });
  }

  const handleGoogleClick = async e => {
    e.preventDefault();

    auth.signinGoogle((error, user) => {

      if(!user) {
        return setError(error);
      }
      
      navigate(from, { replace: true });
    });
  }

  return(
    <div className="login-wrapper">
      <h1>Please Log In</h1>
      <form onSubmit={handleSubmit}>
        <label>
          <p>Username</p>
          <input name="email" type="email" onChange={e => setEmail(e.target.value)} />
        </label>
        <label>
          <p>Password</p>
          <input name="password" type="password" onChange={e => setPassword(e.target.value)} />
        </label>
        <div>
          <button type="submit">Submit</button>
        </div>
        <p className='error'>{error}</p>
      </form>
      {/* <p>No account? Register <Link to="/register">here</Link>. Or login via: <button onClick={handleGoogleClick}>Google</button></p> */}
      <p>No account? Register <Link to="/register">here</Link>. Or login via: <a href="/auth/google">Google</a>, <a href="/auth/facebook">Facebook</a></p>
    </div>
  )
}
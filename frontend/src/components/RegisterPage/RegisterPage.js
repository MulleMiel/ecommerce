import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './RegisterPage.css';
import { useAuth } from '../../providers/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [ email, setEmail ] = useState();
  const [ password, setPassword ] = useState();
  const [ firstname, setFirstname ] = useState();
  const [ lastname, setLastname ] = useState();
  const [ error, setError ] = useState();

  const handleSubmit = async e => {
    e.preventDefault();

    auth.register({ email, password, firstname, lastname }, (error) => {

      if(error) {
        return setError(error);
      }
      
      navigate("/login", { replace: true });
    });
  }

  return(
    <div className="login-wrapper">
      <h1>Create account</h1>
      <form onSubmit={handleSubmit}>
        <label>
          <p>Email</p>
          <input name="email" type="email" onChange={e => setEmail(e.target.value)} />
        </label>
        <label>
          <p>Firstname</p>
          <input name="surname" type="text" onChange={e => setFirstname(e.target.value)} />
        </label>
        <label>
          <p>Lastname</p>
          <input name="lastname" type="text" onChange={e => setLastname(e.target.value)} />
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
      <p>Own an account? Login <Link to="/login">here</Link>.</p>
    </div>
  )
}
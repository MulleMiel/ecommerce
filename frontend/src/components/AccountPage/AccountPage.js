import './AccountPage.css';
import React from 'react';
import { useAuth } from '../../providers/auth';

export default function Account() {
  const auth = useAuth();

  if(!auth.user) return;

  return(
    <div id="account">
       <h1>Account</h1>
       <div className='account-title'>{ auth.user.firstname } { auth.user.lastname }</div>
    </div>
  );
}
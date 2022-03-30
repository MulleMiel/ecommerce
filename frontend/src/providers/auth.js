import { createContext, useContext, useState } from 'react';
import { 
  Navigate, 
  useLocation,
} from 'react-router-dom';

import { localAuth, googleAuth } from "../api/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  
  const signin = async (creds, callback) => {
    return localAuth.signin(creds, (error, foundUser) => {
      if(!error) setUser(foundUser);
      if(foundUser === null){
        setUser({ loggedIn: false });
        callback(error, foundUser);
        return 
      }
      foundUser.loggedIn = true;
      setUser(foundUser);
      callback(error, foundUser);
    });
  };

  const signout = (callback) => {
    return localAuth.signout(() => {
      setUser({ loggedIn: false });
      callback();
    });
  };

  const register = (creds, callback) => {
    return localAuth.register(creds, (error) => {
      callback(error);
    });
  };

  const check = (callback) => {
    return localAuth.check((foundUser) => {
      if(foundUser === null){
        return setUser({ loggedIn: false });
      }
      if(foundUser) foundUser.loggedIn = true;
      setUser(foundUser);
      callback(foundUser);
    });
  };

  const signinGoogle = async (callback) => {
    return googleAuth.signin((error, foundUser) => {
      if(!error) setUser(foundUser);
      callback(error, foundUser);
    });
  };

  const value = { user, signin, signout, register, check, signinGoogle };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function RequireAuth({ children }) {
  const auth = useAuth();
  const location = useLocation();

  if(auth.user === null) return null;
  if (!auth.user.loggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export function PreventWhenAuth({ children }) {
  const auth = useAuth();

  if(auth.user === null) return null;
  if (auth.user.loggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
}
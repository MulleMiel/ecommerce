import React, { useEffect } from 'react';
import './App.css';
import { 
  Route, 
  Routes, 
  Navigate, 
  useNavigate,
  useLocation,
  Outlet,
  Link
} from 'react-router-dom';
import { localAuth, googleAuth } from "../../api/auth";
import LoginPage from '../LoginPage/LoginPage';
import RegisterPage from '../RegisterPage/RegisterPage';
import Homepage from '../Homepage/Homepage';
import AccountPage from '../AccountPage/AccountPage';

function App() {

  return (
    <div className="wrapper">
      <AuthProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Homepage />}/>
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
            </Route>
          </Routes>
      </AuthProvider>
    </div>
  );
}

function Layout() {
  const auth = useAuth();

  return (
    <div>
      <AuthStatus />

      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
          { auth.user && 
            <li>
              <Link to="/account">My Account</Link>
            </li>
          }
      </ul>

      <Outlet />
    </div>
  );
}

const AuthContext = React.createContext();

function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null);
  
  const signin = async (creds, callback) => {
    return localAuth.signin(creds, (error, foundUser) => {
      if(!error) setUser(foundUser);
      callback(error, foundUser);
    });
  };

  const signout = (callback) => {
    return localAuth.signout(() => {
      setUser(null);
      callback();
    });
  };

  const register = (creds, callback) => {
    return localAuth.register(creds, (error, newUser) => {
      callback(error, newUser);
    });
  };

  const check = () => {
    return localAuth.check(foundUser => {
      setUser(foundUser);
    });
  };

  const signinGoogle = async (callback) => {
    return googleAuth.signin((error, foundUser) => {
      if(!error) setUser(foundUser);
      callback(error, foundUser);
    });
  };

  useEffect(() => {
    check();
  }, []);

  const value = { user, signin, signout, register, check, signinGoogle };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return React.useContext(AuthContext);
}

function AuthStatus() {
  const auth = useAuth();
  const navigate = useNavigate();

  if(!auth.user){
    return <Link to="/login">Login</Link>
  }

  return (
    <p>
      Welcome {auth.email}!{" "}
      <button
        onClick={() => {
          auth.signout(() => navigate("/"));
        }}
      >
        Sign out
      </button>
    </p>
  );
}

function RequireAuth({ children }) {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function PreventWhenAuth({ children }) {
  const auth = useAuth();

  if (auth.user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default App;
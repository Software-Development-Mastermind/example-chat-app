import React, { useState, useEffect } from 'react';
import './css/App.css';
import ChatRoom from './components/chatroom/ChatRoom';
import LoginSignup from './components/login-signupPage/LoginSignup';
import io from 'socket.io-client';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';

const socket = io('http://localhost:5000/');

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState([]);
  const [username, setUsername] = useState([]);
  const [accessToken, setAccessToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const setAuth = (boolean) => {
    setIsAuthenticated(boolean);
  };

  const verifyToken = async () => {
    try {
      const response = await fetch('users/verify-token', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${JSON.parse(
            localStorage.getItem('accessToken')
          )}`,
        },
      });

      const isVerified = await response.json();

      if (isVerified === true) {
        setIsAuthenticated(true)
        fetch('/users/login/activeusers').then((res) => res.json()).then(data => console.log(data))
      } else {
        setIsAuthenticated(false);
      }
        
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  return (
    <div className='App'>
      <Router>
        <div className='container'>
          <Switch>
            <Route
              exact
              path='/'
              render={(props) =>
                !isAuthenticated ? (
                  <LoginSignup
                    {...props}
                    onUserSubmit={setUser}
                    onUsernameSubmit={setUsername}
                    handleLoggedin={setIsLoggedIn}
                    getAccessToken={setAccessToken}
                    setAuth={setAuth}
                  />
                ) : (
                  <Redirect to='/chatroom' />
                )
              }
            />

            <Route
              exact
              path='/chatroom'
              render={(props) =>
                isAuthenticated ? (
                  <ChatRoom
                    {...props}
                    username={username}
                    user={user}
                    handleLoggedIn={setIsLoggedIn}
                    accessToken={accessToken}
                    setAuth={setAuth}
                  />
                ) : (
                  <Redirect to='/' />
                )
              }
            />
          </Switch>
        </div>
      </Router>
    </div>
  );
};

export default App;

// const displayPage =
// isLoggedIn === true ? (
//   <ChatRoom
//     username={username}
//     user={user}
//     handleLoggedIn={setIsLoggedIn}
//     accessToken={accessToken}
//   />
// ) : (
//   <LoginSignup
//     onUserSubmit={setUser}
//     onUsernameSubmit={setUsername}
//     handleLoggedin={setIsLoggedIn}
//     getAccessToken={setAccessToken}
//   />
// );

"use client"
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, push, set, update } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import Card from '@mui/material/Card';
const firebaseConfig = {
  apiKey: "AIzaSyD-u7omp9QnRMQtmb8QPvQZuz791p1StnY",
  authDomain: "t-clone-45bd0.firebaseapp.com",
  projectId: "t-clone-45bd0",
  storageBucket: "t-clone-45bd0.appspot.com",
  messagingSenderId: "728057167367",
  appId: "1:728057167367:web:f16f41071c4c754183f4a2",
  measurementId: "G-YXW45GRDC0",
  databaseURL: "https://t-clone-45bd0-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

const MovieFixed = () => {
  const [movies, setMovies] = useState([]);
  const [newMovieTitle, setNewMovieTitle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [editprofile, SetEditprofile] = useState(true);

  const [view, setView] = useState("list");

  const handleNavChange = (event, nextView) => {
    setView(nextView);
  };

  

  useEffect(() => {
    const reviewsRef = ref(database, `users/${user?.uid}/movies`);
  
    const handleData = (snapshot) => {
      if (snapshot.exists()) {
        const movieData = snapshot.val();
        const movieList = Object.keys(movieData).map((key) => ({
          id: key,
          ...movieData[key],
        }));
        setMovies(movieList);
        console.log(movieList);
      } else {
        setMovies([]);
      }
    };
  
    onValue(reviewsRef, handleData);
  
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
  
      if (user) {
        const userReviewsRef = ref(database, `users/${user.uid}/movies`);
        onValue(userReviewsRef, handleData);
  
        const userRef = ref(database, `users/${user.uid}`);
        onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setName(userData.name || '');
            setAge(userData.age || '');
            console.log(userData.movies);
            console.log(movies);
          }
        });
      }
    });
  
    return () => {
      onValue(reviewsRef, handleData);
      unsubscribe();
    };
  }, [database, user]);
  

  const handleSignIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        setUser(user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(`Error: ${errorCode}`, errorMessage);
        handleCreateUser();
      });
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log('Signed out successfully');
      })
      .catch((error) => {
        console.error('Error signing out:', error.message);
      });
  };

  const handleCreateUser = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log('User created successfully:', user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(`Error creating user: ${errorCode}`, errorMessage);
      });
  };

  const handleSaveProfile = () => {
    const user = auth.currentUser;
  
    if (user) {
      const userRef = ref(database, `users/${user.uid}`);
  
      update(userRef, { name, age }) // Use update instead of set
        .then(() => {
          console.log('Profile updated successfully');
          SetEditprofile(true);
        })
        .catch((error) => {
          console.error('Error updating profile:', error.message);
        });
    } else {
      alert('Please sign in to edit your profile.');
    }
  };
  

  const handleEditProfile = () => {
    SetEditprofile(false);
  };

  return (
    
    <div>
      {user ? (
        <div>
          <div className='main-heading'>
            <h1 className='main-welcome'>Welcome, {user.email}!</h1>
          </div>

          {editprofile ? (
            
        <Card variant="outlined" className='position-left'>
           
              {/* <div className='main-profile'>
                <div className='main-profile-item'>
                  <span className='profile-main'>{name}</span>
                </div>
                <Link href="/favlist">
                <div className='main-profile-item'>
                <p className='profile-main'>
                  Faviorite Movies
                </p>
                </div></Link>
               
                <div className='main-profile-item'>
                <p className='profile-main'>
                    Notes
                </p>
                </div>
                <div className='main-profile-item'>
                <p className='profile-main'>
                    Stories
                </p>
                </div>
                <div className='main-profile-item'>
                <p className='profile-main'>
                    Watch List
                </p>
                </div>
                <div className='main-profile-item'>
                <p className='profile-main'>
                    Notes
                </p>
                </div>
                <div className='main-profile-item'>
                <p className='profile-main'>
                    Notes
                </p>
                </div>
                <div className='main-profile-item'>
                <p className='profile-main'>
                    Notes
                </p>
                </div>
                <div className='main-profile-item'>
                <p className='profile-main'>
                    Notes
                </p>
                </div>
                
             
              </div> */}
              <div >
              <ToggleButtonGroup
      orientation="vertical"
      fullWidth
      value={view}
      exclusive
      onChange={handleNavChange}
    >
      <ToggleButton value="list" aria-label="list">
      <div>
          <span>{name}</span>
      </div>
      </ToggleButton>
      <ToggleButton value="module" aria-label="module">
      <Link href="/favlist">
          <div>
                <p>
                  Faviorite Movies
                </p>
                </div>
                </Link>
      </ToggleButton>
      <ToggleButton value="module" aria-label="module">
      <Link href="/watchlist">
          <div>
                <p>
                  Watch List
                </p>
                </div>
                </Link>
      </ToggleButton>
      <ToggleButton value="module" aria-label="module">
      <Link href="/dairy">
          <div>
                <p>
                  Dairy
                </p>
                </div>
                </Link>
      </ToggleButton>
      <ToggleButton value="quilt" aria-label="quilt">
      <Link href="/searchmovie">
                <p>Search Movies</p>
              </Link>
      </ToggleButton>
      <ToggleButton value="quilt" aria-label="quilt">
      <Link href="/searchuser">
                <p>Search Users</p>
              </Link>
      </ToggleButton>
      <ToggleButton value="quilt" aria-label="quilt">
                <p>
                   About App
                </p>
      </ToggleButton>
      <ToggleButton value="quilt" aria-label="quilt">
      <p onClick={handleEditProfile}>Edit Profile</p>
      </ToggleButton>
      <ToggleButton value="quilt" aria-label="quilt">
      <p onClick={handleSignOut}>Logout</p>
      </ToggleButton>
    </ToggleButtonGroup>
                </div>
           
            </Card>
          ) : (
            <div>
              <div className='main-profile'>
                <div>
                  <label className='color-red'>Name:</label>
                  <input
                    type="text"
                    className='form-input'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className='color-red'>Age:</label>
                  <input
                    type="number"
                    className='form-input'
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleSaveProfile}
                className='main-form-button'
              >
                Save Profile
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h1 className='main-welcome'>Login</h1>
          <form className='main-form'>
            <div>
              <label className='color-red'>Email:</label>
              <input
                type="email"
                className='form-input'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className='color-red'>Password:</label>
              <input
                type="password"
                className='form-input'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={handleSignIn}
              className='main-form-button'
            >
              Sign In
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default MovieFixed;

"use client"
import Link from 'next/link';
import { useState, useEffect} from 'react';
import { getDatabase, ref, onValue, push, set, update } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';

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
  const [view, setView] = useState('list');
  const [isWideScreen, setIsWideScreen] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth > 768); // Adjust the breakpoint as needed
    };

    // Initial check on mount
    handleResize();

    // Listen for window resize events
    window.addEventListener('resize', handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleNavChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
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
  }, [database, user,auth]);
  

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
    setOpen(!open)
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

  return (
    
    <div>
      {user ? (
        <div>
          <div className='main-heading'>
            <h1 className='main-welcome'><span>Mo</span><span style={{ color: 'red' }}>view</span></h1>
            {!isWideScreen && (
           <IconButton
           color="inherit"
           edge="start"
           onClick={() => setOpen(!open)}
           sx={{display: { xs: 'block', sm: 'none' } }}
         >
           {open ? <CloseIcon style={{ color: 'red' }} /> : <MenuIcon style={{ color: '#2e7ad1' }}/>}
         </IconButton>
        )}
          </div>
 
            
          <Card variant="outlined" className={`position-left${isWideScreen ? '' : ' open'}`}>
      <div>

        {/* Use conditional rendering based on screen width */}
        {(isWideScreen || open) && (
          <ToggleButtonGroup
            orientation="vertical"
            fullWidth
            value={view}
            exclusive
            onChange={handleNavChange}
          >
            <ToggleButton value="list" aria-label="list">
              <Link href="/">
                <p onClick={() => setOpen(!open)}>Your Profile</p>
              </Link>
            </ToggleButton>
            <ToggleButton value="module" aria-label="module">
              <Link href="/favlist">
                <p onClick={() => setOpen(!open)}>Favorite Movies</p>
              </Link>
            </ToggleButton>
            <ToggleButton value="module" aria-label="module">
              <Link href="/watchlist">
                <p onClick={() => setOpen(!open)}>Watch List</p>
              </Link>
            </ToggleButton>
            <ToggleButton value="module" aria-label="module">
              <Link href="/dairy">
                <p onClick={() => setOpen(!open)}>Dairy</p>
              </Link>
            </ToggleButton>
            <ToggleButton value="quilt" aria-label="quilt">
            <Link href="/storyideas">
              <p onClick={() => setOpen(!open)}>Story Ideas</p>
              </Link>
            </ToggleButton>
            <ToggleButton value="quilt" aria-label="quilt">
              <Link href="/movielist">
                <p onClick={() => setOpen(!open)}>Your Reviews</p>
              </Link>
            </ToggleButton>
            <ToggleButton value="quilt" aria-label="quilt">
              <Link href="/searchmovie">
                <p onClick={() => setOpen(!open)}>Search Movies</p>
              </Link>
            </ToggleButton>
            <ToggleButton value="quilt" aria-label="quilt">
              <Link href="/searchuser">
                <p onClick={() => setOpen(!open)}>Search Users</p>
              </Link>
            </ToggleButton>
            <ToggleButton value="quilt" aria-label="quilt">
            <Link href="/about">
              <p onClick={() => setOpen(!open)}>About App</p>
              </Link>
            </ToggleButton>
            <ToggleButton value="quilt" aria-label="quilt">
              <p onClick={handleSignOut} >Logout</p>
            </ToggleButton>
          </ToggleButtonGroup>
        )}
      </div>
    </Card>
        </div>
      ) : (
        <div>
          <h1 className='main-welcome'>MovieW</h1>
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
            <Link href="/" >
            <Button sx={{ m: 2}} 
           variant="contained"
              type="button"
              onClick={handleSignIn}
            >
              Sign In
            </Button>
            </Link>
            
          </form>
        </div>
      )}
    </div>
  );
};

export default MovieFixed;

"use client"
// Import statements...
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, push, set } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

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

const MovieReviewPage = () => {
  const [movies, setMovies] = useState([]);
  const [newMovieTitle, setNewMovieTitle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');

  useEffect(() => {
    const reviewsRef = ref(database, 'reviews');

    const handleData = (snapshot) => {
      if (snapshot.exists()) {
        const movieData = snapshot.val();
        const movieList = Object.keys(movieData).map((key) => ({
          id: key,
          ...movieData[key],
        }));
        setMovies(movieList);
      } else {
        setMovies([]);
      }
    };

    onValue(reviewsRef, handleData);

    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);

      if (user) {
        const userRef = ref(database, `users/${user.uid}`);
        onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setName(userData.name || '');
            setAge(userData.age || '');
          }
        });

        const userMoviesRef = ref(database, `users/${user.uid}/movies`);
        onValue(userMoviesRef, (snapshot) => {
          if (snapshot.exists()) {
            const userMoviesData = snapshot.val();
            const userMoviesList = Object.keys(userMoviesData).map((key) => ({
              id: key,
              ...userMoviesData[key],
            }));
            setMovies(userMoviesList);
          } else {
            setMovies([]);
          }
        });
      }
    });

    return () => {
      onValue(reviewsRef, handleData);
      unsubscribe();
    };
  }, [database]);

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

  const addMovie = () => {
    if (newMovieTitle) {
      const user = auth.currentUser;

      if (user) {
        const userMoviesRef = ref(database, `users/${user.uid}/movies`);

        const newMovieData = {
          title: newMovieTitle,
          review: null,
        };

        const newMovieRef = push(userMoviesRef);
        set(newMovieRef, newMovieData);

        setNewMovieTitle('');
      } else {
        alert('Please sign in to add a movie.');
      }
    } else {
      alert('Please provide a title.');
    }
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

  const handleEditProfile = () => {
    const user = auth.currentUser;

    if (user) {
      const userRef = ref(database, `users/${user.uid}`);

      set(userRef, { name, age })
        .then(() => {
          console.log('Profile updated successfully');
        })
        .catch((error) => {
          console.error('Error updating profile:', error.message);
        });
    } else {
      alert('Please sign in to edit your profile.');
    }
  };

  return (
    <div>
      {user ? (
        <div>
          <div className='main-heading'>
            <h1 className='main-welcome'>Welcome, {user.email}!</h1>
            <br />
          
            <br />
            <div>
              <Link href="/searchuser">
                <p>Search Users</p>
              </Link>
              <br />
              <button onClick={handleSignOut}>Logout</button>
            </div>
          </div>

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
          <button type="button" onClick={handleEditProfile} className='main-form-button'>
              Save Profile
            </button>

          <form className='main-form'>
            <div>
              <label className='color-red'>Title:</label>
              <input
                className='form-input'
                type="text"
                value={newMovieTitle}
                onChange={(e) => setNewMovieTitle(e.target.value)}
              />
            </div>
            <button type="button" onClick={addMovie} className='main-form-button'>
              Add Movie
            </button>
          </form>

          <div className='movies-list'>
            {movies.length > 0 ? (
              <ul>
                {movies.map((movie) => (
                  <li key={movie.id}>
                    <Link href={`/movie/${movie.id}`}>{movie.title}</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div>No movies found.</div>
            )}
          </div>
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
            <button type="button" onClick={handleSignIn} className='main-form-button'>
              Sign In
            </button>
          </form>

          <button type="button" onClick={handleCreateUser} className='main-form-button'>
            Create User
          </button>
        </div>
      )}
    </div>
  );
};

export default MovieReviewPage;


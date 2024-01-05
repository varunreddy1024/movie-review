"use client"
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, push, set } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

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

const MovieReviewPage = () => {
  const [movies, setMovies] = useState([]);

  const [newMovieTitle, setNewMovieTitle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [editprofile, SetEditprofile] = useState(true);
  const [searchResults, setSearchResults] = useState({});


  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('movies',movies)
        if(movies.length>0){
          let movieNewData={};
          for(var i=0;i<movies.length; i++){
            console.log('loading',i);
            const response = await fetch(`https://omdbapi.com/?i=${movies[i].imdbID}&apikey=8643ded5`);
            if (!response.ok) {
              console.log(`HTTP error! Status: ${response.status}`);
              continue;
            }
            let data = await response.json();
            movieNewData[movies[i].imdbID]= data;
            setSearchResults(movieNewData)
          }
        setSearchResults(movieNewData);
        console.log('movie Data',movieNewData);
        }else{
          console.log('movie length less tahn 0')
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
fetchData();
  }, [movies]);
  

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
  }, [ user]);
  useEffect(() => {  
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        const userReviewsRef = ref(database, `users/${user.uid}/movies`);

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
      unsubscribe();
    };
  }, [ auth]);
  

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

  console.log('intial movies',movies );
  return (
    <div>
      {user ? (
        <Card variant="outlined"  className='movies-list-main'>

          <h2 className='color-red-bold'>Your Recent Reviews:</h2>

          <ul>
            {movies.map((movie) => (
              <li key={movie.imdbID}>
                <Link href={`/movie/${movie.imdbID}`}>
                  <div className='review-main'>
                    <div className='review-list-poster'>
                      <img
                        src={movie.poster}
                        alt={`${movie.title} Poster`}
                        style={{ width: '75px', height: '110px' }}
                      />
                    </div>
                    <div className='review-list-main'>
                      <p className='review-name'>{movie.title}</p>
                      <p>Review: {movie.review.trim().slice(0,200)}{movie.review.length > 200 && '...'}</p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
       <div>
        <p>Login First</p>
       </div>
      )}
    </div>
  );
};

export default MovieReviewPage;

"use client"
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, push, set } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';

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
  const [favorites, setFavorites] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [reviewStatus, setReviewStatus] = useState({});
  const [movieReviews, setMovieReviews] = useState({});

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);

      if (user) {
        const userRef = ref(database, `users/${user.uid}`);
        const favoritesRef = ref(database, `users/${user.uid}/favorites`);
        const watchlistRef = ref(database, `users/${user.uid}/watchlist`);
        const reviewStatusRef = ref(database, `users/${user.uid}/reviewStatus`);
        const movieReviewsRef = ref(database, 'movies');

        const handleFavoritesData = (snapshot) => {
          if (snapshot.exists()) {
            const favoritesData = snapshot.val();
            setFavorites(Object.values(favoritesData));
          } else {
            setFavorites([]);
          }
        };

        const handleWatchlistData = (snapshot) => {
          if (snapshot.exists()) {
            const watchlistData = snapshot.val();
            setWatchlist(Object.values(watchlistData));
          } else {
            setWatchlist([]);
          }
        };

        const handleReviewStatusData = (snapshot) => {
          if (snapshot.exists()) {
            const reviewStatusData = snapshot.val();
            setReviewStatus(reviewStatusData);
          } else {
            setReviewStatus({});
          }
        };

        const handleMovieReviewsData = (snapshot) => {
          if (snapshot.exists()) {
            const movieReviewsData = snapshot.val();
            setMovieReviews(movieReviewsData);
          } else {
            setMovieReviews({});
          }
        };

        const favoritesUnsubscribe = onValue(favoritesRef, handleFavoritesData);
        const watchlistUnsubscribe = onValue(watchlistRef, handleWatchlistData);
        const reviewStatusUnsubscribe = onValue(reviewStatusRef, handleReviewStatusData);
        const movieReviewsUnsubscribe = onValue(movieReviewsRef, handleMovieReviewsData);

        return () => {
          favoritesUnsubscribe();
          watchlistUnsubscribe();
          reviewStatusUnsubscribe();
          movieReviewsUnsubscribe();
        };
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user, database]);


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


  console.log('intial movies',movies );

  const addToWatchlist = (movie) => {
    if (user) {
      const updatedWatchlist = watchlist.includes(movie.imdbID)
        ? watchlist.filter((id) => id !== movie.imdbID)
        : [...watchlist, movie.imdbID];

      set(ref(database, `users/${user.uid}/watchlist`), updatedWatchlist);
      setWatchlist(updatedWatchlist);
    }
  };

  const addToFavorites = (movie) => {
    if (user) {
      const updatedFavorites = favorites.includes(movie.imdbID)
        ? favorites.filter((id) => id !== movie.imdbID)
        : [...favorites, movie.imdbID];

      set(ref(database, `users/${user.uid}/favorites`), updatedFavorites);
      setFavorites(updatedFavorites);
    }
  };


  return (
    <div>
      {user && (
        <Card variant="outlined"  className='movies-list-main'>

          <h2 className='color-red-bold'>Your Recent Reviews:</h2>

          <ul>
            {movies.map((movie) => (
              <li key={movie.imdbID}>
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
                      <Link href={`/movie/${movie.imdbID}`}>
                        <Button sx={{ m: 1 ,
                          '@media (max-width: 600px)': {
                              fontSize: '10px', // Adjust the font size for smaller screens
                              padding: '3px 5px', // Adjust padding for smaller screens
                          }, }} variant="contained">
                          {movieReviews[movie.imdbID] ? 'Edit Review' : 'Add Review'}
                        </Button>
                      </Link>
                      <Button
                        sx={{ m: 1,
                          '@media (max-width: 600px)': {
                              fontSize: '10px', // Adjust the font size for smaller screens
                              padding: '3px 5px', // Adjust padding for smaller screens
                          }, }}
                        variant="contained"
                        onClick={() => addToFavorites(movie)}
                      >
                        {favorites.includes(movie.imdbID)
                          ? 'Remove Fav'
                          : 'Add to Fav'}
                      </Button>
                      <Button
                        sx={{ m: 1 ,
                          '@media (max-width: 600px)': {
                              fontSize: '10px', // Adjust the font size for smaller screens
                              padding: '3px 5px', // Adjust padding for smaller screens
                          }, }}
                        variant="contained"
                        onClick={() => addToWatchlist(movie)}
                      >
                        {watchlist.includes(movie.imdbID)
                          ? 'Remove Wlist'
                          : 'Add to Wlist'}
                      </Button>
                    </div>
                  </div>
              </li>
            ))}
          </ul>
        </Card>
      ) }
    </div>
  );
};

export default MovieReviewPage;
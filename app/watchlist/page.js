"use client";
import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, set, push } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import Link from 'next/link';
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


const WatchSearch = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [user, setUser] = useState(null);
  const [watchlistMovies, setWatchlistMovies] = useState([]);
  const [newMovie, setNewMovie] = useState(''); 
  const [watchlistResults, setWatchlistResults] = useState({});
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
        console.log('movies', watchlistMovies)
        if (watchlistMovies.length > 0) {
          let movieNewData = {};
          for (var i = 0; i < watchlistMovies.length; i++) {
            console.log('loading', watchlistMovies[i]);
            const response = await fetch(`https://omdbapi.com/?i=${watchlistMovies[i]}&apikey=8643ded5`);
            if (!response.ok) {
              console.log(`HTTP error! Status: ${response.status}`);
              continue;
            }
            let data = await response.json();
            movieNewData[watchlistMovies[i]] = data;
          }
          setWatchlistResults(movieNewData);
          console.log('movie Data:::', movieNewData);
        } else {
          console.log('movie length less than 0')
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [watchlistMovies]);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => {
      unsubscribe();
    };
  }, [auth]);

  useEffect(() => {
    if (user) {
      const watchlistRef = ref(database, `users/${user.uid}/watchlist`);

      const handleData = (snapshot) => {
        if (snapshot.exists()) {
          const watchlistData = snapshot.val();
          setWatchlistMovies(Object.values(watchlistData));
          console.log("Firebase Watchlist Data:", Object.values(watchlistData));
        } else {
          setWatchlistMovies([]);
        }
      };

      const unsubscribe = onValue(watchlistRef, handleData);

      return () => {
        // Unsubscribe the listener when the component is unmounted
        unsubscribe();
      };
    }
  }, [user]);


  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
  
    // If the search term is empty, clear the results
    if (!term) {
      setSearchResults([]);
      return;
    }
  
    // Filter the watchlistMovies based on the search term
    setSearchResults(
      watchlistMovies.filter(
        (movieId) =>
          watchlistResults[movieId].Title.toLowerCase().includes(term)
      )
    );
  };
  

  return (
    <Card variant="outlined" className='movies-list-main'>
      <div className='main-form'>
        <div style={{
          float: 'right',
          display: 'flex',
          flexDirection: 'row',
          width: '95%',
          alignItems: 'center',
          justifyContent: 'flex-end',
          margin: 'auto',
          marginTop: '5px'
        }}>
          <TextField
            id="outlined-controlled"
            label="Search"
            value={searchTerm}
            onChange={handleSearch}
            style={{ float: 'right' }}
          />
        </div>
      </div>

      <div>
        <ul>
          {searchResults.map((movieId) => (
            <li key={movieId}>
              <div className='review-main'>
                <div className='review-list-poster'>
                  <img
                    src={watchlistResults[movieId].Poster}
                    alt={`${watchlistResults[movieId].Title} Poster`}
                    style={{ width: '75px', height: '110px' }}
                  />
                </div>
                <div className='review-list-main'>
                  <p className='review-name'>{watchlistResults[movieId] && watchlistResults[movieId].Title}</p>
                  <p>Director: {watchlistResults[movieId].Director}, Actor: {watchlistResults[movieId].Actors}</p>
                  <Link href={`/movie/${watchlistResults[movieId].imdbID}`}>
                        <Button sx={{ m: 1 ,
                          '@media (max-width: 600px)': {
                              fontSize: '10px', // Adjust the font size for smaller screens
                              padding: '3px 5px', // Adjust padding for smaller screens
                          }, }} variant="contained">
                          {movieReviews[watchlistResults[movieId].imdbID] ? 'Edit Review' : 'Add Review'}
                        </Button>
                      </Link>
                      <Button
                        sx={{ m: 1 ,
                          '@media (max-width: 600px)': {
                              fontSize: '10px', // Adjust the font size for smaller screens
                              padding: '3px 5px', // Adjust padding for smaller screens
                          }, }}
                        variant="contained"
                        onClick={() => addToFavorites(watchlistResults[movieId])}
                      >
                        {favorites.includes(watchlistResults[movieId].imdbID)
                          ? 'Remove Fav'
                          : 'Add to Fav'}
                      </Button>
                      <Button
                        sx={{ m: 1,
                          '@media (max-width: 600px)': {
                              fontSize: '10px', // Adjust the font size for smaller screens
                              padding: '3px 5px', // Adjust padding for smaller screens
                          }, }}
                        variant="contained"
                        onClick={() => addToWatchlist(watchlistResults[movieId])}
                      >
                        {watchlist.includes(watchlistResults[movieId].imdbID)
                          ? 'Remove Wlist'
                          : 'Add to Wlist'}
                      </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <ul>
        {Object.values(watchlistResults).map((movie) => (
          <li key={movie.imdbID}>
            <Link href={`/movie/${movie.imdbID}`}>
              <div className='review-main'>
                <div className='review-list-poster'>
                  <img
                    src={movie && movie.Poster}
                    alt={movie && `${movie.Title} Poster`}
                    style={{ width: '75px', height: '110px' }}
                  />
                </div>
                <div className='review-list-main'>
                  <p className='review-name'>{movie && movie.Title}</p>
                  <p>Director: {movie.Director}, Actor: {movie.Actors}</p>
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
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default WatchSearch;

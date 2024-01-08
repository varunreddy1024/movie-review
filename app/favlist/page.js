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

const MovieSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [user, setUser] = useState(null);
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [favResults, setFavResults] = useState({});
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
  }, [user,auth, database]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        if (favoriteMovies.length > 0) {
          let movieNewData = {};
          for (var i = 0; i < favoriteMovies.length; i++) {
            const response = await fetch(
              `https://omdbapi.com/?i=${favoriteMovies[i]}&apikey=8643ded5`
            );
            if (!response.ok) {
              console.log(`HTTP error! Status: ${response.status}`);
              continue;
            }
            let data = await response.json();
            movieNewData[favoriteMovies[i]] = data;
          }
          setFavResults(movieNewData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [favoriteMovies]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);

      if (user) {
        const favoritesRef = ref(database, `users/${user.uid}/favorites`);

        const handleData = (snapshot) => {
          if (snapshot.exists()) {
            const favoritesData = snapshot.val();
            setFavoriteMovies(Object.values(favoritesData));
          } else {
            setFavoriteMovies([]);
          }
        };

        const unsubscribe = onValue(favoritesRef, handleData);

        return () => {
          unsubscribe();
        };
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user, auth]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
  
    // If the search term is empty, clear the results
    if (!term) {
      setSearchResults([]);
      return;
    }
  
    // Filter the favoriteMovies based on the search term
    setSearchResults(
      favoriteMovies.filter(
        (movieId) => favResults[movieId].Title.toLowerCase().includes(term)
      )
    );
  };

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
    <>
      {user ? (
        <Card variant="outlined" className="movies-list-main">
          <div className="main-form">
            <div
              style={{
                float: 'right',
                display: 'flex',
                flexDirection: 'row',
                width: '95%',
                alignItems: 'center',
                justifyContent: 'flex-end',
                margin: 'auto',
                marginTop: '5px',
              }}
            >
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
                  <div className="review-main">
                    <div className="review-list-poster">
                      <img
                        src={favResults[movieId].Poster}
                        alt={`${favResults[movieId].Title} Poster`}
                        style={{ width: '75px', height: '110px' }}
                      />
                    </div>
                    <div className="review-list-main">
                      <p className="review-name">{favResults[movieId] && favResults[movieId].Title}</p>
                      <p>Director: {favResults[movieId].Director}, Actor: {favResults[movieId].Actors}</p>
                      <Link href={`/movie/${favResults[movieId].imdbID}`}>
                        <Button sx={{ m: 1 ,
        '@media (max-width: 600px)': {
            fontSize: '10px', // Adjust the font size for smaller screens
            padding: '3px 5px', // Adjust padding for smaller screens
        },}} variant="contained">
                          {movieReviews[favResults[movieId].imdbID] ? 'Edit Review' : 'Add Review'}
                        </Button>
                      </Link>
                      <Button
                        sx={{ m: 1,
                          '@media (max-width: 600px)': {
                              fontSize: '10px', // Adjust the font size for smaller screens
                              padding: '3px 5px', // Adjust padding for smaller screens
                          }, }}
                        variant="contained"
                        onClick={() => addToFavorites(favResults[movieId])}
                      >
                        {favorites.includes(favResults[movieId].imdbID)
                          ? 'Remove Fav'
                          : 'Add to Fav'}
                      </Button>
                      <Button
                        sx={{ m: 1 ,
                          '@media (max-width: 600px)': {
                              fontSize: '12px', // Adjust the font size for smaller screens
                              padding: '5px 10px', // Adjust padding for smaller screens
                          },}}
                        variant="contained"
                        onClick={() => addToWatchlist(favResults[movieId])}
                      >
                        {watchlist.includes(favResults[movieId].imdbID)
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
            {Object.values(favResults).map((movie) => (
              <li key={movie.imdbID}>
                  <div className="review-main">
                    <div className="review-list-poster">
                      <img
                        src={movie && movie.Poster}
                        alt={movie && `${movie.Title} Poster`}
                        style={{ width: '75px', height: '110px' }}
                      />
                    </div>
                    <div className="review-list-main">
                      <p className="review-name">{movie && movie.Title}</p>
                      <p>Director: {movie.Director}, Actor: {movie.Actors}</p>
                      <Link href={`/movie/${movie.imdbID}`}>
                        <Button sx={{ m: 1 ,
                          '@media (max-width: 600px)': {
                              fontSize: '12px', // Adjust the font size for smaller screens
                              padding: '5px 10px', // Adjust padding for smaller screens
                          }, }} variant="contained">
                          {movieReviews[movie.imdbID] ? 'Edit Review' : 'Add Review'}
                        </Button>
                      </Link>
                      <Button
                        sx={{ m: 1 ,
                          '@media (max-width: 600px)': {
                              fontSize: '12px', // Adjust the font size for smaller screens
                              padding: '5px 10px', // Adjust padding for smaller screens
                          }, }}
                        variant="contained"
                        onClick={() => addToFavorites(movie)}
                      >
                        {favorites.includes(movie.imdbID)
                          ? 'Remove Fav'
                          : 'Add to Fav'}
                      </Button>
                      <Button
                        sx={{ m: 1  ,
                          '@media (max-width: 600px)': {
                              fontSize: '12px', // Adjust the font size for smaller screens
                              padding: '5px 10px', // Adjust padding for smaller screens
                          },}}
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
      ) : (
        <h2>Login To Access</h2>
      )}
    </>
  );
};

export default MovieSearch;

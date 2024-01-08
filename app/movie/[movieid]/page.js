"use client";
import { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, set, get,push } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';

import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

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

const MovieDetailsPage = ({ params }) => {
  const [movie, setMovie] = useState(null);
  const [newMovieReview, setNewMovieReview] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [user, setUser] = useState(null);
  const [searchResults, setSearchResults] = useState({});
  const [recentReviews, setRecentReviews] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [watchlist, setWatchlist] = useState(new Set());
  

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => {
      unsubscribeAuth();
    };
  }, [auth]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://omdbapi.com/?i=${params.movieid}&apikey=8643ded5`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let data = await response.json();
        console.log(data);
        setSearchResults(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData().then(() => {
      console.log(searchResults);
    });
  }, [params.movieid]);

  useEffect(() => {
    if (user) {
      const movieRef = ref(database, `users/${user.uid}/movies/${params.movieid}`);

      const handleData = (snapshot) => {
        if (snapshot.exists()) {
          const movieData = snapshot.val();
          setMovie(movieData);
          setNewMovieReview(movieData.review || '');
        } else {
          setMovie(null);
          setNewMovieReview('');
        }
      };

      onValue(movieRef, handleData);

      return () => {
        onValue(movieRef, handleData);
      };
    }
  }, [params.movieid, database, user]);

  useEffect(() => {
  const fetchRecentReviews = async () => {
    try {
      const moviesReviewsRef = ref(database, `movies/${params.movieid}`);
      const snapshot = await get(moviesReviewsRef);

      if (snapshot.exists()) {
        const reviewsData = snapshot.val();
        setRecentReviews(reviewsData || {}); // Ensure reviewsData is an object
      } else {
        setRecentReviews({});
      }
    } catch (error) {
      console.error('Error fetching recent reviews:', error);
    }
  };

  fetchRecentReviews();
}, [params.movieid, database]);

  

  const saveReview = () => {
    if (user) {
      if (newMovieReview.trim() !== '') {
        const reviewsRef = ref(database, `users/${user.uid}/movies/${params.movieid}/review`);
        set(reviewsRef, newMovieReview);

        const movieRef = ref(database, `users/${user.uid}/movies/${params.movieid}`);
        const newMovieData = {
          title: searchResults.Title,
          imdbID: searchResults.imdbID,
          review: newMovieReview,
          poster: searchResults.Poster,
        };
        set(movieRef, newMovieData);

        const moviesRef = ref(database, `movies/${params.movieid}/${user.uid}`);
        set(moviesRef, newMovieReview);

        setIsEditMode(false);
      } else {
        alert('Please provide a non-empty review.');
      }
    }
  };


  const addToWatchlist = (movie) => {
    if (user) {
      // Check if the movie is already in watchlist
      if (!watchlist.has(movie.imdbID)) {
        // Update the Firebase watchlist with only the imdbID
        push(ref(database, `users/${user.uid}/watchlist`), movie.imdbID);
        setWatchlist(new Set(watchlist).add(movie.imdbID));
      }
    }
  };

  const addToFavorites = (movie) => {
    if (user) {
      // Check if the movie is already in favorites
      if (!favorites.has(movie.imdbID)) {
        // Update the Firebase favorites list with only the imdbID
        push(ref(database, `users/${user.uid}/favorites`), movie.imdbID);
        setFavorites(new Set(favorites).add(movie.imdbID));
      }
    }
  };

  return (
    <Card variant="outlined" className='movies-list-main'>
      <div>
        <div className='flex-row'>
          <div className='movie-review-img'>
            <img
              src={searchResults.Poster}
              alt={`${searchResults.Title} Poster`}
              style={{ width: '300px', height: '300px' }}
            />
           
          </div>
          <div className='movie-details'>
            <h2><b>{searchResults.Title}</b></h2>
            <p><b>Plot: </b>{searchResults.Plot}</p>
            <p><b>Director: </b>{searchResults.Director}</p>
            <p><b>Cast: </b>{searchResults.Actors}</p>
            <p><b>Runtime: </b>{searchResults.Runtime}</p>
            <p><b>IMDB: </b>{searchResults.imdbRating}</p>
          </div>
        </div>

        <div>
          {isEditMode ? (
            <>
            <div>
              <TextField sx={{ m: 2, width: '80ch',
                          '@media (max-width: 600px)': {
                              width:'30ch' // Adjust padding for smaller screens
                          }, }} variant="standard"
                label="Edit Your Review"
                multiline
                type="text"
                value={newMovieReview}
                onChange={(e) => setNewMovieReview(e.target.value)}
                placeholder="Your Review"
              />
              
            </div>
            <Button sx={{ m: 1,
                          '@media (max-width: 600px)': {
                              fontSize: '10px', // Adjust the font size for smaller screens
                              padding: '3px 5px', // Adjust padding for smaller screens
                          }, }} variant="contained"  onClick={saveReview}>Save Review</Button>
            </>
          ) : movie ? (
            <div>

            <TextField sx={{ m: 2,width: '80ch',
                          '@media (max-width: 600px)': {
                              width:'30ch' // Adjust padding for smaller screens
                          }, }}  variant="standard"
              id="outlined-read-only-input"
              label={"Review by You"}
              defaultValue={newMovieReview}
              InputProps={{
                readOnly: true,
              }}
            />
            <Button sx={{ m: 1,
                          '@media (max-width: 600px)': {
                              fontSize: '10px', // Adjust the font size for smaller screens
                              padding: '3px 5px', // Adjust padding for smaller screens
                          }, }} variant="contained"  onClick={() => setIsEditMode(true)}>
            Edit Review
            </Button>
                  <Button sx={{ m: 1,
                          '@media (max-width: 600px)': {
                              fontSize: '10px', // Adjust the font size for smaller screens
                              padding: '3px 5px', // Adjust padding for smaller screens
                          }, }}variant="contained"
                    onClick={() => addToFavorites(searchResults)}
                  >
                    Add to Fav
                  </Button>
                  <Button sx={{ m: 1,
                          '@media (max-width: 600px)': {
                              fontSize: '10px', // Adjust the font size for smaller screens
                              padding: '3px 5px', // Adjust padding for smaller screens
                          }, }} variant="contained"
                    onClick={() => addToWatchlist(searchResults)}
                  >
                    Add to Wlist
                  </Button>
                  </div>
          ) : (
            <div>
              <p>No review yet.</p>
              <Button sx={{ m: 1,
                          '@media (max-width: 600px)': {
                              fontSize: '10px', // Adjust the font size for smaller screens
                              padding: '3px 5px', // Adjust padding for smaller screens
                          }, }} variant="contained" onClick={() => setIsEditMode(true)}>
                Add Review
              </Button>
              <Button sx={{ m: 1,
                          '@media (max-width: 600px)': {
                              fontSize: '10px', // Adjust the font size for smaller screens
                              padding: '3px 5px', // Adjust padding for smaller screens
                          }, }} variant="contained"
                        onClick={() => addToFavorites(searchResults)}
                      >
                        Add to Fav
                      </Button>
                      <Button sx={{ m: 1,
                          '@media (max-width: 600px)': {
                              fontSize: '10px', // Adjust the font size for smaller screens
                              padding: '3px 5px', // Adjust padding for smaller screens
                          }, }} variant="contained"
                        onClick={() => addToWatchlist(searchResults)}
                      >
                        Add to Wlist
                      </Button>
            </div>
          )}
        </div>

        <div className='recent-reviews'>
  <b>Recent Reviews for {searchResults.Title}:</b>
  {Object.entries(recentReviews).map(([uid, review], index) => (
    <div key={index} className='review'>    
    <Link href={`/user/${uid}`}>
    <TextField sx={{ m: 2, width: '80ch',
                          '@media (max-width: 600px)': {
                              width:'30ch' // Adjust padding for smaller screens
                          }, }} variant="standard"
              id="outlined-read-only-input"
              label={"Review by " +uid}
              value={review}
              InputProps={{
                readOnly: true,
              }}
            /> 
      </Link>
    </div>
  ))}
        </div>



      </div>
    </Card>
  );
};

export default MovieDetailsPage;

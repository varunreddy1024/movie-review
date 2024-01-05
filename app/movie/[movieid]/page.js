"use client";
import { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, set, get } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';


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

const MovieDetailsPage = ({ params }) => {
  const [movie, setMovie] = useState(null);
  const [newMovieReview, setNewMovieReview] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [user, setUser] = useState(null);
  const [searchResults, setSearchResults] = useState({});
  const [recentReviews, setRecentReviews] = useState([]);

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
          `https://omdbapi.com/?i=${params.movieid}&apikey=8643ded5&plot=full`
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
            <p>{searchResults.Title}</p>
            <p>Runtime: {searchResults.Runtime}</p>
            <p>IMDB: {searchResults.imdbRating}</p>
            <p>Awards: {searchResults.Awards}</p>
          </div>
          <div className='movie-details'>
            <p>Plot: {searchResults.Plot}</p>
            <p>Director: {searchResults.Director}</p>
            <p>Cast: {searchResults.Actors}</p>
            <p>
              Genre: {searchResults.Genre}, Language: {searchResults.Language}, Country: {searchResults.Country}
            </p>
          </div>
        </div>

        <div className='review-details'>
          {isEditMode ? (
            <div>
              <textarea
                value={newMovieReview}
                onChange={(e) => setNewMovieReview(e.target.value)}
                placeholder="Your Review"
                style={{ color: 'black', width: '95%', minHeight: '300px', margin: '10px' }}
              />
              <button onClick={saveReview}>Save Review</button>
            </div>
          ) : movie ? (
            <div>
              <p>Review by {user.uid}</p>
              <p>{newMovieReview}</p>
              <button className='main-form-button' onClick={() => setIsEditMode(true)}>
                Edit Review
              </button>
            </div>
          ) : (
            <div>
              <p>No review yet.</p>
              <button className='main-form-button' onClick={() => setIsEditMode(true)}>
                Add Review
              </button>
            </div>
          )}
        </div>

        <div className='recent-reviews'>
  <h3>Recent Reviews for {searchResults.Title}</h3>
  {Object.entries(recentReviews).map(([uid, review], index) => (
    <div key={index} className='review'>
      <p>Review by: {uid}</p>
      <p>{review}</p>
    </div>
  ))}
        </div>



      </div>
    </Card>
  );
};

export default MovieDetailsPage;

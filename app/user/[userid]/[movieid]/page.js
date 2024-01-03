"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

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
        setSearchResults(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData().then(() => {
      console.log(searchResults);
    }); // Call the async function inside useEffect
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
        };
        set(movieRef, newMovieData);

        setIsEditMode(false);
      } else {
        alert('Please provide a non-empty review.');
      }
    }
  };

  

  return (
    <div>
        <div>
          
          <div className='flex-row'>
  <div className='movie-review-img' style={{ backgroundImage: `url(${searchResults.Poster})` }}>
  </div>
  <div className='movie-details'>
  <h1 className='main-welcome'>{searchResults.Title}</h1>
    <p>Released: {searchResults.Released}, Runtime: {searchResults.Runtime}</p>
    
    
    <p>IMDB: {searchResults.imdbRating}</p>
    <p>Awards: {searchResults.Awards}</p>
    {isEditMode ? (
            <div>
              <textarea
                value={newMovieReview}
                onChange={(e) => setNewMovieReview(e.target.value)}
                placeholder="Your Review"
                style={{ color: 'black', width: '90%', minHeight: '100px', margin: '10px'}}
              />
              <button onClick={saveReview}>Save Review</button>
            </div>
          ) : (
            <div>
              <p>{newMovieReview}</p>
              <button onClick={() => setIsEditMode(true)}><Link href={`/movie/${searchResults.imdbID}`}>Review This Movie</Link></button>
            </div>
          ) }
  </div>
  <div>
  <p>Plot: {searchResults.Plot}</p>
  <p>Director: {searchResults.Director}</p>
    <p>Cast: {searchResults.Actors}</p>
    <p>Genre: {searchResults.Genre}, Language: {searchResults.Language}, Country: {searchResults.Country}</p>
  </div>
</div>


    
        
        </div>
      
    </div>
  );
};

export default MovieDetailsPage;

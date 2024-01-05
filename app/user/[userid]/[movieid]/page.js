"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, set } from 'firebase/database';
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
    }); 
  }, [params.movieid]);

  useEffect(() => {
    if (user) {
      const movieRef = ref(database, `users/${params.userid}/movies/${params.movieid}`);

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
          <p>Genre: {searchResults.Genre}, Language: {searchResults.Language}, Country: {searchResults.Country}</p>
          </div>


          </div>

          <div className='review-details'>
          
          <div>
          <p>Review by {params.userid}</p>
          <p>{newMovieReview}</p>
          <button className='main-form-button'><Link href={`/movie/${searchResults.imdbID}`}>Review This Movie</Link></button>
          </div>
          
          </div>

          </div>

          </Card>
  );
};

export default MovieDetailsPage;

"use client"

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

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => {
      unsubscribeAuth();
    };
  }, [auth]);

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

  const addReview = () => {
    setIsEditMode(true);
  };

  const saveReview = () => {
    if (user) {
      if (newMovieReview.trim() !== '') {
        const reviewsRef = ref(database, `users/${user.uid}/movies/${params.movieid}/review`);
        set(reviewsRef, newMovieReview);
        setIsEditMode(false);
      } else {
        alert('Please provide a non-empty review.');
      }
    }
  };

  return (
    <div>
      {movie ? (
        <div>
          <h1 className='main-welcome'>{movie.title}</h1>
          <p>{movie.description}</p>
          {isEditMode ? (
            <div>
              <textarea
                value={newMovieReview}
                onChange={(e) => setNewMovieReview(e.target.value)}
                placeholder="Your Review"
                style={{ color: 'black', width: '90%', minHeight: '100px',margin:'10px'}}
              />
              <button onClick={saveReview}>Save Review</button>
            </div>
          ) : movie.review ? (
            <div>
              <h2>Movie Review:</h2>
              <p>{movie.review}</p>
              <button onClick={() => setIsEditMode(true)}>Edit Review</button>
            </div>
          ) : (
            <div>
              <p>No reviews yet.</p>
              <button onClick={addReview}>Add Review</button>
            </div>
          )}
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default MovieDetailsPage;

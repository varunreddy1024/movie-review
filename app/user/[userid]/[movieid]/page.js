"use client";

import { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
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
  const [review, setReview] = useState(null);
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
      const movieRef = ref(database, `users/${params.userid}/movies/${params.movieid}/review`);

      const handleData = (snapshot) => {
        if (snapshot.exists()) {
          const movieReview = snapshot.val();
          setReview(movieReview);
        } else {
          setReview(null);
        }
      };

      onValue(movieRef, handleData);

      return () => {
        onValue(movieRef, handleData);
      };
    }
  }, [params.movieid, database, user]);

  return (
    <div>
      {review ? (
        <div>
          <h1 className='main-welcome'>Movie Review</h1>
          <p>{review}</p>
        </div>
      ) : (
        <div>No review available.</div>
      )}
    </div>
  );
};

export default MovieDetailsPage;

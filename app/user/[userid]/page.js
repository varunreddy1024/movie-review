"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getDatabase, ref, onValue } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import Link from 'next/link';

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

const User = ({ params }) => {
  const [userData, setUserData] = useState(null);
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (params.userid) {
        const database = getDatabase();
        const userRef = ref(database, `users/${params.userid}`);

        onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const user = snapshot.val();
            const moviesArray = Object.keys(user.movies || {}).map((movieId) => ({
              id: movieId,
              ...user.movies[movieId],
            }));
            setMovies(moviesArray);
            setUserData(user);
          } else {
            setUserData(null);
            setMovies([]);
          }
        });
      }
    };

    fetchUserData();
  }, [params.userid]);

  return (
    <div className='movies-list-main'>
      {userData ? (
        <div>
          <p>{userData.name}</p>
          <p>Age: {userData.age}</p>
          <h2 className='color-red-bold'>Movies List:</h2>
          {movies.length > 0 ? (
            <ul>
              {movies.map((movie) => (
                <li key={movie.id}>
                  <Link href={`/user/${params.userid}/${movie.id}`}>
                    <div className='review-main'>
                      <div className='review-list-poster'>
                        <img
                          src={movie.poster}
                          alt={`${movie.title} Poster`}
                          style={{ width: '75px', height: '110px'}}
                        />
                      </div>
                      <div className='review-list-main'>
                        <p>{movie.title}</p>
                        <p>{movie.review}</p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div>No movies found.</div>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default User;

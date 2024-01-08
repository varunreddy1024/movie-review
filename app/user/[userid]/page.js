"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
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


const User = ({ params }) => {
  const [userData, setUserData] = useState(null);
  const [movies, setMovies] = useState([]);
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
    <>

    {user ? (<Card variant="outlined" className='movies-list-main'>
      {userData ? (
        <Card sx={{ p:2,}}>
          <p>Name: <b>{userData.name}</b></p>
          <p>Age: <b>{userData.age}</b></p>
          <h2 className='color-red-bold'>Movies List:</h2>
          {movies.length > 0 ? (
            <ul>
              {movies.map((movie) => (
                <li key={movie.id}>
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
                      <Link href={`/user/${params.userid}/${movie.id}`}>
                        <Button sx={{ m: 1 ,
        '@media (max-width: 600px)': {
            fontSize: '10px', // Adjust the font size for smaller screens
            padding: '3px 5px', // Adjust padding for smaller screens
        },}} variant="contained">
                          See Full Review
                        </Button>
                      </Link>
                    </div>
                </li>
              ))}
            </ul>
          ) : (
            <div>No movies found.</div>
          )}
        </Card>
      ) : (
        <p>Loading...</p>
      )}
    </Card>) : (
      <h2>Login To Acess</h2>
    )}
  </>
  );
};

export default User;

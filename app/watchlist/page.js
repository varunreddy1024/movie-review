"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getDatabase, ref, onValue, set, push } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import Link from 'next/link';

import TextField from '@mui/material/TextField';
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

const WatchSearch = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [user, setUser] = useState(null);
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [newMovie, setNewMovie] = useState(''); 
  const [favResults, setFavResults] = useState({});


  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('movies',favoriteMovies)
        if(favoriteMovies.length>0){
          let movieNewData={};
          for(var i=0;i<favoriteMovies.length; i++){
            console.log('loading',favoriteMovies[i]);
            const response = await fetch(`https://omdbapi.com/?i=${favoriteMovies[i]}&apikey=8643ded5`);
            if (!response.ok) {
              console.log(`HTTP error! Status: ${response.status}`);
              continue;
            }
            let data = await response.json();
            movieNewData[favoriteMovies[i]]= data;
          }
        setFavResults(movieNewData);
        console.log('movie Data:::',movieNewData);
        }else{
          console.log('movie length less than 0')
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
fetchData();
  }, [favoriteMovies]);

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
      const favoritesRef = ref(database, `users/${user.uid}/watchlist`);
  
      const handleData = (snapshot) => {
        if (snapshot.exists()) {
          const favoritesData = snapshot.val();
          setFavoriteMovies(Object.values(favoritesData));
          console.log("Firebase Favorites Data:", Object.values(favoritesData));
        } else {
          setFavoriteMovies([]);
        }
      };
  
      const unsubscribe = onValue(favoritesRef, handleData);
  
      return () => {
        // Unsubscribe the listener when the component is unmounted
        unsubscribe();
      };
    }
  }, [user]);
  
  

  const addToWatchlist = (movie) => {
    if (user) {
      const favoritesRef = ref(database, `users/${user.uid}/watchlist`);

      // Check if the movie is already in favorites
      if (!favoriteMovies.some((favMovie) => favMovie.id === movie.imdbID)) {
        // Update the local state
        setFavoriteMovies([...favoriteMovies, movie]);

        // Update the Firebase favorites list with only the imdbID
        push(favoritesRef, movie.imdbID);
      }
    }
  };

  const handleSearch = async (e) => {
    setSearchTerm(e.target.value);
    const search = e.target.value.trim();
    if(search ===''){
        setSearchResults([]);
        return false;
    }
    try {
      const response = await fetch(
        `https://omdbapi.com/?s=${search}&apikey=8643ded5`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      setSearchResults(data.Search || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    
    <Card variant="outlined"  className='movies-list-main'>

<div className='main-form'>
        {/* <input
          className='form-input'
          type="text"
          placeholder='Search Movie'
          value={searchTerm}
          onChange={handleSearch}
        /> */}
        <div style={{float:'right', 
    display: 'flex',
    flexDirection: 'row',
    width: '95%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    margin: 'auto',
    marginTop: '5px'}}>  
               <TextField
        id="outlined-controlled"
        label="Search"
        value={searchTerm}
        onChange={handleSearch}
        style={{float:'right'}}
      /></div>

        {/* <button className='main-form-button'>
          Search
        </button> */}
      </div>

      <div>
        <ul>
          {searchResults.map((movie) => (
            <li key={movie.imdbID}>
              <div className='review-main'>
                <div className='review-list-poster'>
                  <img
                    src={movie.Poster}
                    alt={`${movie.Title} Poster`}
                    style={{ width: '75px', height: '110px' }}
                  />
                </div>
                <div className='review-list-main'>
                  <p className='review-name'>{movie.Title}</p>
                  <p>{movie.Year}</p>
                  <p>{movie.Type}</p>
                  <button className='mini-form-button' onClick={() => addToWatchlist(movie)}>
                    Add to WatchList
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>


 <ul>
  {Object.values(favResults).map((movie) => (
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
            <p>Director: {movie.Director}</p>
            <p>Actor: {movie.Actors}</p>
            <p>Year: {movie.Year}
            </p>
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
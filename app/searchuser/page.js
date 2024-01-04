"use client"
// UserSearch.js
import { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
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
const database = getDatabase(app);


const UserSearch = () => {
  const [searchedUserName, setSearchedUserName] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    if (searchedUserName) {
      try {
        const usersRef = ref(database, 'users');
        const snapshot = await get(usersRef);

        if (snapshot.exists()) {
          const userData = snapshot.val();
          const results = [];

          if (userData) {
            // Iterate over user nodes
            Object.keys(userData).forEach((userId) => {
              const user = userData[userId];

              // Check if the user's name contains the search term
              if (user && user.name && user.name.toLowerCase().includes(searchedUserName.toLowerCase())) {
                results.push({
                  userId,
                  name: user.name,
                  age: user.age || 'N/A',
                  movies: user.movies || [], // Assuming movies is an array
                });
              }
            });
          }

          setSearchResults(results);
          console.log(results);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error searching users:', error.message);
      }
    } else {
      alert('Please enter a user name to search.');
    }
  };

  return (
    <div className='movies-list-main'>
      <form className='main-form'>
        <label className='color-red'>Name:</label>
        <input className='form-input'
          type="text"
          value={searchedUserName}
          onChange={(e) => setSearchedUserName(e.target.value)}
        />
        <button type="button" onClick={handleSearch} className='main-form-button'>
          Search
        </button>
      </form>

      {searchResults.length > 0 ? (
        <div>
          <h3>Search Results</h3>
           {searchResults.map((result) => (
            <div key={result.userId}>
              <Link href={`/user/${result.userId}`}>
                <div>
                  <p>{result.name}</p>
                </div>
              </Link>
              <p>{result.age}</p>
              <hr />
            </div>
          ))}
        </div>
      ) : (
        <p>No user found.</p>
      )}
    </div>
  );
};

export default UserSearch;

"use client"
import React, { useState } from 'react';
import Link from 'next/link';

const MovieSearch = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);

 
    const handleSearch = async () => {
        try {
          const response = await fetch(
            `https://omdbapi.com/?s=${searchTerm}&apikey=8643ded5`
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
    <div className='movies-list-main'>
      <div className='main-form'>
            <input
              className='form-input'
              type="text"
              placeholder='Search Movie'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className='main-form-button' onClick={handleSearch}>
              Search
            </button>
          </div>

          <div>
  <ul>
    {searchResults.map((movie) => (
      <li key={movie.imdbID}>
        <Link href={`/movie/${movie.imdbID}`}>
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
              <p>{movie.imdbID}</p>
            </div>
          </div>
        </Link>
      </li>
    ))}
  </ul>
</div>

    </div>
  );
};

export default MovieSearch;

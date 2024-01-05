"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';

const MovieSearch = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);

 
    const handleSearch = async (e) => {
      setSearchTerm(e.target.value);
      const search = e.target.value.trim();
      if(search ===''){
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
    <Card variant="outlined" className='movies-list-main'>
      <div className='main-form'>

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

    </Card>
  );
};

export default MovieSearch;

// components/AboutApp.js
import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

const AboutApp = () => {
  return (
    <Card variant="outlined" className='movies-list-main'>
      <CardContent>
        <Typography variant="h4" component="div" gutterBottom>
          About Cinephile's Diary Hub
        </Typography>
        <Typography variant="body1" paragraph>
          Welcome to Cinephile's Diary Hub, your go-to platform for managing your movie reviews, diary entries, and more. This application is designed to cater to film enthusiasts who not only want to keep track of their favorite movies but also share their thoughts and ideas in a digital diary.
        </Typography>
        <Typography variant="body1" paragraph>
          Features:
        </Typography>
        <ul>
          <li>
            <Typography variant="body1">
              <strong>Movie Reviews:</strong> Write and manage reviews for your favorite movies.
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              <strong>Diary Entries:</strong> Keep a digital diary to jot down your thoughts, story ideas, and more.
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              <strong>Profile Management:</strong> Customize your profile and keep track of your watchlist and favorites.
            </Typography>
          </li>
        </ul>
        <Typography variant="body1" paragraph>
          We hope you enjoy using Cinephile's Diary Hub to enhance your movie-watching and creative experiences!
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Created by Bokka Varun Reddy
        </Typography>
      </CardContent>
    </Card>
  );
};

export default AboutApp;


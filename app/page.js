"use client"
import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const firebaseConfig = {
  apiKey: 'AIzaSyD-u7omp9QnRMQtmb8QPvQZuz791p1StnY',
  authDomain: 't-clone-45bd0.firebaseapp.com',
  projectId: 't-clone-45bd0',
  storageBucket: 't-clone-45bd0.appspot.com',
  messagingSenderId: '728057167367',
  appId: '1:728057167367:web:f16f41071c4c754183f4a2',
  measurementId: 'G-YXW45GRDC0',
  databaseURL: 'https://t-clone-45bd0-default-rtdb.firebaseio.com',
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

const MovieFixed = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState(' ');
  const [age, setAge] = useState(' ');
  const [editProfile, setEditProfile] = useState(true);
  const [favGenre, setFavGenre] = useState([]);
  const [favMovies, setFavMovies] = useState([]);
  const [favDirectors, setFavDirectors] = useState([]);
  const [favActors, setFavActors] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);

      if (user) {
        const userRef = ref(database, `users/${user.uid}`);
        onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setName(userData.name || ' ');
            setAge(userData.age || ' ');
            setFavGenre(userData.favGenre || []);
            setFavMovies(userData.favMovies || []);
            setFavDirectors(userData.favDirectors || []);
            setFavActors(userData.favActors || []);
          }
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [database, user, auth]);

  const handleSaveProfile = () => {
    const user = auth.currentUser;

    if (user) {
      const userRef = ref(database, `users/${user.uid}`);

      update(userRef, {
        name,
        age,
        favGenre,
        favMovies,
        favDirectors,
        favActors,
      })
        .then(() => {
          console.log('Profile updated successfully');
          setEditProfile(true);
        })
        .catch((error) => {
          console.error('Error updating profile:', error.message);
        });
    } else {
      alert('Please sign in to edit your profile.');
    }
  };

  const handleEditProfile = () => {
    setEditProfile(false);
  };

  const handleAddToList = async (listName) => {
    const newItem = prompt(`Enter a new item for ${listName}:`);
    if (newItem) {
      try {
        const user = auth.currentUser;
        const userRef = ref(database, `users/${user.uid}`);

        switch (listName) {
          case 'favMovies':
            await update(userRef, { favMovies: [...favMovies, newItem] });
            setFavMovies([...favMovies, newItem]);
            break;
          case 'favGenre':
            await update(userRef, { favGenre: [...favGenre, newItem] });
            setFavGenre([...favGenre, newItem]);
            break;
          case 'favDirectors':
            await update(userRef, { favDirectors: [...favDirectors, newItem] });
            setFavDirectors([...favDirectors, newItem]);
            break;
          case 'favActors':
            await update(userRef, { favActors: [...favActors, newItem] });
            setFavActors([...favActors, newItem]);
            break;
          default:
            break;
        }
      } catch (error) {
        console.error('Error updating list:', error.message);
      }
    }
  };

  return (
    <>
      {user && (
        <Card variant="outlined" className="movies-list-main" sx={{ p: 3 }}>
          {editProfile ? (
            <div>
              <Typography variant="h4" gutterBottom>
                Your Profile
              </Typography>
              <TextField
                fullWidth
                label="Name"
                value={name}
                InputProps={{
                  readOnly: true,
                }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Age"
                value={age}
                InputProps={{
                  readOnly: true,
                }}
                sx={{ mb: 2 }}
              />
              <Button variant="contained" onClick={handleEditProfile} sx={{ mb: 2 }}>
                Edit Profile
              </Button>

              <TextField
                fullWidth
                multiline
                label="Favorite Movies"
                value={favMovies.join(', ')}
                InputProps={{
                  readOnly: true,
                }}
                sx={{ mb: 2 }}
              />
              <Button variant="contained" onClick={() => handleAddToList('favMovies')} sx={{ mb: 2 }}>
                Add New
              </Button>

              <TextField
                fullWidth
                multiline
                label="Favorite Directors"
                value={favDirectors.join(', ')}
                InputProps={{
                  readOnly: true,
                }}
                sx={{ mb: 2 }}
              />
              <Button variant="contained" onClick={() => handleAddToList('favDirectors')} sx={{ mb: 2 }}>
                Add New
              </Button>

              <TextField
                fullWidth
                multiline
                label="Favorite Actors"
                value={favActors.join(', ')}
                InputProps={{
                  readOnly: true,
                }}
                sx={{ mb: 2 }}
              />
              <Button variant="contained" onClick={() => handleAddToList('favActors')} sx={{ mb: 2 }}>
                Add New
              </Button>

              <TextField
                fullWidth
                multiline
                label="Favorite Genre"
                value={favGenre.join(', ')}
                InputProps={{
                  readOnly: true,
                }}
                sx={{ mb: 2 }}
              />
              <Button variant="contained" onClick={() => handleAddToList('favGenre')} sx={{ mb: 2 }}>
                Add New
              </Button>
            </div>
          ) : (
            <div>
              <Typography variant="h4" gutterBottom>
                Edit Your Profile
              </Typography>
              <TextField
                fullWidth
                label="Edit Your Name"
                multiline
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Edit Your Age"
                multiline
                value={age}
                onChange={(e) => setAge(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                multiline
                label="Edit Favorite Movies"
                value={favMovies}
                onChange={(e) => setFavMovies(e.target.value.split(','))}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                multiline
                label="Edit Favorite Directors"
                value={favDirectors}
                onChange={(e) => setFavDirectors(e.target.value.split(','))}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                multiline
                label="Edit Favorite Actors"
                value={favActors}
                onChange={(e) => setFavActors(e.target.value.split(','))}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                multiline
                label="Edit Favorite Genre"
                value={favGenre}
                onChange={(e) => setFavGenre(e.target.value.split(','))}
                sx={{ mb: 2 }}
              />
              <Button variant="contained" onClick={handleSaveProfile} sx={{ mb: 2 }}>
                Save Profile
              </Button>
            </div>
          )}
        </Card>
      )}
    </>
  );
};

export default MovieFixed;

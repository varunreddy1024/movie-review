"use client"

import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, push, update, remove } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import DeleteIcon from '@mui/icons-material/Delete';
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

const Movieidea = () => {
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState('');
  const [entry, setEntry] = useState('');
  const [customDate, setCustomDate] = useState('');
  const [storyideasEntries, setstoryideasEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editEntryId, setEditEntryId] = useState(null);

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
      const storyideasRef = ref(database, `users/${user.uid}/storyideas`);

      const handleData = (snapshot) => {
        if (snapshot.exists()) {
          const storyideasData = snapshot.val();
          const storyideasList = Object.keys(storyideasData).map((key) => ({
            id: key,
            ...storyideasData[key],
          }));
          setstoryideasEntries(storyideasList);
        } else {
          setstoryideasEntries([]);
        }
      };

      const unsubscribestoryideas = onValue(storyideasRef, handleData);

      return () => {
        unsubscribestoryideas();
      };
    }
  }, [user, database, showForm, editMode]);

  const handleSaveEntry = () => {
    if (!title.trim()) {
        alert('Logline cannot be empty. Please provide a logline.');
        return;
      }
    if (user) {
        const storyideasRef = editEntryId
        ? ref(database, `users/${user.uid}/storyideas/${editEntryId}`)
        : ref(database, `users/${user.uid}/storyideas`);
      

      if (editMode && editEntryId) {
        // Update the existing entry
        update(storyideasRef, {
          title,
          entry,
          customDate,
        });
        setEditMode(false);
        setEditEntryId(null);
      } else {
        // Push the new entry to the database
        push(storyideasRef, {
          title,
          entry,
          customDate,
        });
      }

      // Clear the form fields after saving the entry
      setTitle('');
      setEntry('');
      setCustomDate('');
      setShowForm(false);
    }
  };

  const handleEditEntry = (entryId) => {
    const entryToEdit = storyideasEntries.find((entry) => entry.id === entryId);
    if (entryToEdit) {
      setTitle(entryToEdit.title);
      setEntry(entryToEdit.entry);
      setCustomDate(entryToEdit.customDate);
      setEditMode(true);
      setEditEntryId(entryId);
      setShowForm(true);
    }
  };

  const handleDeleteEntry = (entryId) => {
    if (user) {
      const storyideasRef = ref(database, `users/${user.uid}/storyideas/${entryId}`);
  
      // Remove the entry from the database
      remove(storyideasRef);
    }
  };

  return (
    <Card variant="outlined" className='movies-list-main'>
      {showForm ? (
        <>
          <div>
            <TextField
          sx={{ m: 2, width: '30ch' }}
          id="standard-multiline-flexible"
          label="LogLine"
          multiline
          maxRows={4}
          variant="filled"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
            />
            <input style={{
              margin: '20px',
              height:'56px'}}
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
            />
          </div>
          <div>
              <TextField sx={{ m: 2, width: '75ch' ,
                          '@media (max-width: 600px)': {
                            width: '30ch'
                          }, }} variant="standard"
          label="Write"
          multiline
          type="text"
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
            />
          </div>
          <Button sx={{ m: 2}} variant="outlined" onClick={handleSaveEntry}>{editMode ? 'Update Idea' : 'Save Idea'}</Button>
        </>
      ) : (
        <Button sx={{ m: 2}}  variant="outlined" onClick={() => setShowForm(true)}>{editMode ? 'Edit Entry' : 'New Idea'}</Button>
      )}

      <h2 style={{
    margin: '20px'}}>Your Story Entries</h2>
      <div className='storyideas-main'>
      <ul>
        {storyideasEntries.map((entry) => (
            <div className='dairy-item-main'>
          <li key={entry.id}>
            <strong>{entry.title}</strong> - {entry.customDate}
            <p>{entry.entry}</p>
            <Button sx={{ m: 1}} variant="outlined" size="medium" onClick={() => handleEditEntry(entry.id)}>Edit</Button>
            <Button sx={{ m: 1 }} variant="outlined" startIcon={<DeleteIcon />} onClick={() => handleDeleteEntry(entry.id)}>Delete</Button>
          </li>
          </div>
        ))}
        
      </ul>
      </div>
    </Card>
  );
};

export default Movieidea;

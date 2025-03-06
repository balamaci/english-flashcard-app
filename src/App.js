import React, { useState, useEffect } from 'react';
import { Button, Card, CardContent, Typography, Box, TextField } from '@mui/material';
import VolumeUp from '@mui/icons-material/VolumeUp'; // Correct import
import './App.css';

function App() {
  const [words, setWords] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [numWords, setNumWords] = useState(5);
  const [sessionWords, setSessionWords] = useState([]);
  const [showTranslation, setShowTranslation] = useState(false);

  // Load words from JSON on mount
  useEffect(() => {
    fetch('/words.json')
      .then((response) => response.json())
      .then((data) => setWords(data))
      .catch((error) => console.error('Error loading words:', error));
  }, []);

  // Start a new session
  const startSession = () => {
    const selectedWords = pickRandomWords(words, numWords);
    setSessionWords(selectedWords);
    setCurrentCard(selectedWords[0]);
    setShowTranslation(false); // Reset translation visibility
  };

  // Pick random words based on frequency
  const pickRandomWords = (wordList, count) => {
    const weightedList = [];
    wordList.forEach((word) => {
      for (let i = 0; i < word.frequency; i++) {
        weightedList.push(word);
      }
    });
    const shuffled = weightedList.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).reduce((unique, item) => {
      return unique.some((w) => w.english === item.english)
        ? unique
        : [...unique, item];
    }, []);
  };

  // Move to next card
  const nextCard = () => {
    const currentIndex = sessionWords.indexOf(currentCard);
    const nextIndex = (currentIndex + 1) % sessionWords.length;
    setCurrentCard(sessionWords[nextIndex]);
    setShowTranslation(false); // Hide translation for new card
  };

  // Play audio if available
  const playAudio = (audioPath) => {
    if (audioPath) {
      const audio = new Audio(audioPath);
      audio.play();
    }
  };

  return (
    <Box className="App" sx={{ textAlign: 'center', padding: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Control for number of words */}
      <Box sx={{ mb: 3 }}>
        <TextField
          label="Number of Words"
          type="number"
          value={numWords}
          onChange={(e) => setNumWords(Math.min(words.length, Math.max(1, e.target.value)))}
          inputProps={{ min: 1, max: words.length }}
          sx={{ mr: 2, width: 120 }}
          size="small"
        />
        <Button variant="contained" color="primary" onClick={startSession}>
          Start Session
        </Button>
      </Box>

      {/* Flashcard display */}
      {currentCard ? (
        <Card sx={{ maxWidth: 450, margin: '0 auto', padding: 2, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h2" component="div" sx={{ mb: 3, fontWeight: 'bold' }}>
              {currentCard.english}
            </Typography>
            {showTranslation && (
              <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
                {currentCard.romanian}
              </Typography>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button variant="outlined" color="secondary" onClick={() => setShowTranslation(true)}>
                Answer
              </Button>
              {currentCard.audio && (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<VolumeUp />}
                  onClick={() => playAudio(currentCard.audio)}
                >
                  Play
                </Button>
              )}
              <Button variant="contained" color="primary" onClick={nextCard}>
                Next Card
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Typography variant="body1" color="text.secondary">
          Press "Start Session" to begin!
        </Typography>
      )}
    </Box>
  );
}

export default App;

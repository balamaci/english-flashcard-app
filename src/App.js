import React, { useState, useEffect } from 'react';
import { Button, Card, CardContent, Typography, Box, TextField } from '@mui/material';
import VolumeUp from '@mui/icons-material/VolumeUp';
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
    setCurrentCard(selectedWords.length > 0 ? selectedWords[0] : null);
    setShowTranslation(false); // Reset translation visibility
  };

  // Pick random unique words based on frequency
  const pickRandomWords = (wordList, count) => {
    if (!wordList || wordList.length === 0) return [];
    
    // Create a copy of the word list to avoid modifying the original
    const availableWords = [...wordList];
    
    // Create an array to store the selected unique words
    const selectedWords = [];
    
    // Continue selecting words until we have enough or run out of words
    while (selectedWords.length < count && availableWords.length > 0) {
      // Create weighted list based on frequency
      const weightedList = [];
      availableWords.forEach((word, index) => {
        // Add the word to the weighted list multiple times based on its frequency
        for (let i = 0; i < word.frequency; i++) {
          weightedList.push(index); // Store the index in the availableWords array
        }
      });
      
      // If no words with frequency > 0, break to avoid infinite loop
      if (weightedList.length === 0) break;
      
      // Select a random word from the weighted list
      const randomIndex = Math.floor(Math.random() * weightedList.length);
      const selectedWordIndex = weightedList[randomIndex];
      const selectedWord = availableWords[selectedWordIndex];
      
      // Add the selected word to our results
      selectedWords.push(selectedWord);
      
      // Remove the selected word from the available words to ensure uniqueness
      availableWords.splice(selectedWordIndex, 1);
    }
    
    return selectedWords;
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
          onChange={(e) => setNumWords(Math.min(words.length, Math.max(1, parseInt(e.target.value) || 1)))}
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

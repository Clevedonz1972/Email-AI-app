import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';

// Cat image URL
const CAT_IMAGE_URL = '/assets/asti-cat.gif';

// Generate a dynamic keyframes animation based on random values
const createWalkAnimation = (startHeight: number, midHeight: number, endHeight: number) => keyframes`
  /* First journey - left to right */
  0% {
    transform: translate(-150px, ${startHeight}px) scale(0.8);
    opacity: 0;
  }
  3% {
    opacity: 1;
    transform: translate(0, ${startHeight}px) scale(0.8);
  }
  10% {
    transform: translate(calc(20vw - 100px), ${startHeight - 20}px) scale(0.9);
  }
  20% {
    transform: translate(calc(40vw - 100px), ${startHeight + 10}px) scale(0.85);
  }
  30% {
    transform: translate(calc(60vw - 100px), ${startHeight - 15}px) scale(0.95);
  }
  40% {
    transform: translate(calc(80vw - 100px), ${startHeight + 5}px) scale(0.9);
  }
  45% {
    transform: translate(calc(100vw), ${startHeight - 10}px) scale(0.85);
    opacity: 1;
  }
  48% {
    transform: translate(calc(100vw + 150px), ${startHeight - 10}px) scale(0.85);
    opacity: 0;
  }
  
  /* Gentle transition between journeys - maintain animation */
  49% {
    transform: translate(-150px, ${midHeight}px) scale(0.85);
    opacity: 0;
  }
  
  /* Second journey - left to right at different height */
  50% {
    transform: translate(-150px, ${midHeight}px) scale(0.85);
    opacity: 0;
  }
  53% {
    transform: translate(-50px, ${midHeight}px) scale(0.85);
    opacity: 0.5;
  }
  55% {
    transform: translate(0, ${midHeight}px) scale(0.85);
    opacity: 1;
  }
  65% {
    transform: translate(calc(20vw - 100px), ${midHeight + 20}px) scale(0.9);
  }
  75% {
    transform: translate(calc(40vw - 100px), ${midHeight - 10}px) scale(0.85);
  }
  85% {
    transform: translate(calc(60vw - 100px), ${midHeight + 15}px) scale(0.95);
  }
  95% {
    transform: translate(calc(80vw - 100px), ${midHeight - 5}px) scale(0.9);
    opacity: 1;
  }
  98% {
    transform: translate(calc(100vw), ${midHeight + 10}px) scale(0.85);
    opacity: 0.3;
  }
  100% {
    transform: translate(calc(100vw + 150px), ${midHeight + 10}px) scale(0.85);
    opacity: 0;
  }
`;

interface AstiEasterEggProps {
  open: boolean;
  onClose: () => void;
}

export const AstiEasterEgg: React.FC<AstiEasterEggProps> = ({ open, onClose }) => {
  const [showCat, setShowCat] = useState(false);
  const [storyDialogOpen, setStoryDialogOpen] = useState(false);
  
  // Generate random heights for the cat's paths
  const randomHeights = useMemo(() => {
    const startHeight = Math.floor(Math.random() * 100); // Random from 0-100px
    const midHeight = Math.floor(Math.random() * 100) + 100; // Random from 100-200px
    const endHeight = Math.floor(Math.random() * 100); // Random from 0-100px
    // Generate random vertical position for the container
    const verticalPosition = Math.floor(Math.random() * 60) + 10; // Random from 10-70% of viewport height
    return { startHeight, midHeight, endHeight, verticalPosition };
  }, [open]); // Regenerate when Easter egg is opened
  
  // Create the animation dynamically
  const CatContainer = useMemo(() => styled(Box)(({ theme }) => ({
    position: 'fixed',
    // Random vertical position instead of fixed bottom
    bottom: `${randomHeights.verticalPosition}%`,
    left: 0,
    width: '180px',
    height: '140px',
    zIndex: 9999,
    cursor: 'pointer',
    animation: `${createWalkAnimation(
      randomHeights.startHeight, 
      randomHeights.midHeight, 
      randomHeights.endHeight
    )} 30s ease-in-out forwards`,
    '& img': {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      // Ensure GIF keeps playing by avoiding any property that might cause reload
      willChange: 'transform',
      backfaceVisibility: 'hidden'
    }
  })), [randomHeights]);
  
  useEffect(() => {
    if (open) {
      setShowCat(true);
      
      // Hide cat after animation completes if user doesn't interact with it
      const timer = setTimeout(() => {
        if (!storyDialogOpen) {
          setShowCat(false);
          onClose();
        }
      }, 30000); // Match animation duration
      
      return () => clearTimeout(timer);
    } else {
      setShowCat(false);
    }
  }, [open, storyDialogOpen, onClose]);
  
  const handleCatClick = () => {
    setStoryDialogOpen(true);
  };
  
  const handleCloseStoryDialog = () => {
    setStoryDialogOpen(false);
    setShowCat(false);
    onClose();
  };
  
  return (
    <>
      {showCat && (
        <CatContainer 
          onClick={handleCatClick}
          role="button"
          aria-label="Click to learn about Asti"
        >
          <img src={CAT_IMAGE_URL} alt="Asti the cat walking" />
        </CatContainer>
      )}
      
      <Dialog
        open={storyDialogOpen}
        onClose={handleCloseStoryDialog}
        maxWidth="md"
        aria-labelledby="asti-story-dialog-title"
      >
        <DialogTitle id="asti-story-dialog-title">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">The Story of Asti</Typography>
            <IconButton 
              size="small" 
              onClick={handleCloseStoryDialog} 
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            alignItems: 'center'
          }}>
            <Box 
              component="img" 
              src={CAT_IMAGE_URL} 
              alt="Asti the cat"
              sx={{ 
                maxWidth: '300px', 
                width: '100%',
                borderRadius: 2,
                boxShadow: 3 
              }}
            />
            <Box>
              <Typography variant="body1" paragraph>
                Asti was my loyal companion through the journey of creating this application. As anyone with 
                ADHD knows, the path is never straightforward - there are highs of hyperfocus and creativity, 
                and valleys of overwhelm and distraction.
              </Typography>
              
              <Typography variant="body1" paragraph>
                Through it all, Asti was there - a calm, steady presence in my sometimes chaotic world. 
                During late-night coding sessions, she would curl up next to my keyboard, occasionally 
                batting at the cursor moving across the screen as if to say, "Don't forget to take breaks!"
              </Typography>
              
              <Typography variant="body1" paragraph>
                When I would get frustrated or stuck, she would demand attention in that way only 
                cats can - reminding me that sometimes stepping away and petting a cat is exactly 
                what you need to solve a complex problem.
              </Typography>
              
              <Typography variant="body1" paragraph>
                This application is named ASTI as a tribute to her - because sometimes the best support 
                for neurodivergent minds comes in unexpected forms, like a small black cat who doesn't 
                judge your scattered thoughts, your midday energy crashes, or your occasional bursts of 
                enthusiasm over seemingly small victories.
              </Typography>
              
              <Typography variant="body1" paragraph>
                Asti taught me that companionship doesn't have to be complex. Sometimes it's just about 
                being present while someone works through their challenges. And that's what this app aims 
                to do - be there for you through the ups and downs of managing communications and stress 
                with ADHD.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStoryDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}; 
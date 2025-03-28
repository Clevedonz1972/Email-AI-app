import React, { useState } from 'react';
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Zoom
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

const EmergencySupport: React.FC = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000
        }}
      >
        <Zoom in={true}>
          <Fab 
            color="error" 
            onClick={handleOpen} 
            aria-label="emergency support"
          >
            <WarningIcon />
          </Fab>
        </Zoom>
      </Box>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="emergency-dialog-title"
        aria-describedby="emergency-dialog-description"
      >
        <DialogTitle id="emergency-dialog-title">
          Emergency Support
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="emergency-dialog-description">
            If you're experiencing a mental health emergency, please consider the following options:
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" fullWidth sx={{ mb: 1 }}>
              Call Crisis Helpline
            </Button>
            <Button variant="outlined" fullWidth sx={{ mb: 1 }}>
              Text Crisis Support
            </Button>
            <Button variant="outlined" fullWidth sx={{ mb: 1 }}>
              Breathing Exercise
            </Button>
            <Button variant="outlined" fullWidth>
              Grounding Techniques
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EmergencySupport; 
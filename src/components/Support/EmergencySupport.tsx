import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box
} from '@mui/material';

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
      {/* Emergency dialog only - the button has been replaced by Stop the World button */}
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
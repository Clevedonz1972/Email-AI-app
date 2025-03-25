import React, { useState } from 'react';
import { Fab, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import { SupportOutlined as SupportIcon } from '@mui/icons-material';

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
      <Fab
        color="primary"
        aria-label="emergency support"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={handleOpen}
      >
        <SupportIcon />
      </Fab>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Emergency Support</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            If you're feeling overwhelmed, here are some resources that might help:
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" component="div">
              <ul>
                <li>Take a short break (5-10 minutes)</li>
                <li>Try some deep breathing exercises</li>
                <li>Contact your support person</li>
                <li>Use accessibility features to reduce sensory input</li>
              </ul>
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          <Button color="primary" variant="contained" onClick={handleClose}>
            I'm Feeling Better
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EmergencySupport; 
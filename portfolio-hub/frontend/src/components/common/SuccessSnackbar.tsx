import { useState, useEffect } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

interface SuccessSnackbarProps {
  message: string;
  severity?: AlertColor;
  duration?: number;
  onClose?: () => void;
}

export function SuccessSnackbar({
  message,
  severity = 'success',
  duration = 4000,
  onClose,
}: SuccessSnackbarProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (message) {
      setOpen(true);
    }
  }, [message]);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
    onClose?.();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{
        mt: 8,
      }}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant="filled"
        sx={{
          width: '100%',
          borderRadius: 2,
          fontSize: '0.9375rem',
          fontWeight: 500,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          '& .MuiAlert-icon': {
            fontSize: '1.25rem',
          },
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}

export function useSuccessSnackbar() {
  const [successMessage, setSuccessMessage] = useState<string>('');

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
  };

  const clearSuccess = () => {
    setSuccessMessage('');
  };

  return {
    successMessage,
    showSuccess,
    clearSuccess,
    SuccessSnackbar: () => (
      <SuccessSnackbar
        message={successMessage}
        onClose={clearSuccess}
      />
    ),
  };
}

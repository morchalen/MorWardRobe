import { ReactNode } from 'react';
import { Box } from '@mui/material';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        height: '100%',
        flex: 1,
        overflow: 'hidden',
        margin: 0,
        padding: 0,
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          height: '100%',
          maxHeight: '100%',
          overflow: 'hidden',
        }}
      >
        <Sidebar />
      </Box>

      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          minWidth: 0,
          margin: 0,
          padding: 0,
        }}
      >
        <Box
          sx={{
            flex: 1,
            width: '100%',
            p: 3,
            overflowY: 'auto',
            overflowX: 'hidden',
            '&::-webkit-scrollbar': {
              width: 6,
              height: 6,
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: 'divider',
              borderRadius: 3,
              '&:hover': {
                bgcolor: 'text.disabled',
              },
            },
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(0,0,0,0.15) transparent',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

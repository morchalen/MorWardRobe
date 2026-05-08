import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Box, CircularProgress, Typography } from '@mui/material'
import App from './App'
import { useAuthStore } from '@/stores'
import { useM3Theme } from '@/theme/m3Theme'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
})

function AuthLoader({ children }: { children: React.ReactNode }) {
  const fetchUser = useAuthStore((state) => state.fetchUser)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    fetchUser().finally(() => setReady(true))
  }, [])

  if (!ready) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 3 }}>
        <CircularProgress size={48} />
        <Typography variant="body2" color="text.secondary">验证登录状态...</Typography>
      </Box>
    )
  }

  return <>{children}</>
}

function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useM3Theme()
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AppThemeProvider>
          <AuthLoader>
            <App />
          </AuthLoader>
        </AppThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

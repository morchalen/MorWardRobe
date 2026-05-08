import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

export function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard');
      return res.data.data;
    },
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        管理面板
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                用户总数
              </Typography>
              <Typography variant="h3">{stats?.user_count || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                衣物总数
              </Typography>
              <Typography variant="h3">{stats?.clothing_count || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

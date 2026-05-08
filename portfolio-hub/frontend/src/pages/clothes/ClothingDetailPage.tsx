import { useParams, Navigate } from 'react-router-dom';
import { Box, Typography, Card, CardMedia, CardContent, Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

export function ClothingDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: clothing, isLoading } = useQuery({
    queryKey: ['clothing', id],
    queryFn: async () => {
      const res = await api.get(`/clothes/${id}`);
      return res.data.data;
    },
  });

  if (isLoading) return <Typography>加载中...</Typography>;
  if (!clothing) return <Navigate to="/wardrobe" />;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        衣物详情
      </Typography>

      <Card sx={{ maxWidth: 400 }}>
        <CardMedia
          component="img"
          height="400"
          image={clothing.image_url}
          alt={clothing.name}
        />
        <CardContent>
          <Typography variant="h6">{clothing.name}</Typography>
          <Typography color="text.secondary">
            分类: {clothing.category}
          </Typography>
          <Typography color="text.secondary">
            颜色: {clothing.color}
          </Typography>
          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => window.history.back()}
          >
            返回
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

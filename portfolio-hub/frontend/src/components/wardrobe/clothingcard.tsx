import { Card, CardMedia, CardContent, Typography, Box, IconButton, Chip } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import type { Clothing } from '@/types';

interface ClothingCardProps {
  clothing: Clothing;
  onEdit?: (clothing: Clothing) => void;
  onDelete?: (id: string) => void;
}

export function ClothingCard({ clothing, onEdit, onDelete }: ClothingCardProps) {
  const imageUrl = clothing.image_url || clothing.thumbnail_url || '/placeholder-body.png';

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.warn('[ClothingCard] Image load failed:', {
      id: clothing.id,
      name: clothing.name,
      image_url: clothing.image_url,
      thumbnail_url: clothing.thumbnail_url,
      final_url: imageUrl,
    });
    e.currentTarget.src = '/placeholder-body.png';
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2.5,
        overflow: 'visible',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-2px)',
          backgroundColor: 'rgba(255, 255, 255, 0.55)',
          border: '1px solid rgba(255, 255, 255, 0.7)',
          boxShadow: '0 8px 24px 0 rgba(31, 38, 135, 0.1)',
          '& .clothing-actions': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      }}
    >
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <CardMedia
          component="img"
          height={140}
          image={imageUrl}
          alt={clothing.name || '衣物'}
          onError={handleImageError}
          sx={{
            objectFit: 'cover',
            bgcolor: 'transparent',
            transition: 'transform 0.25s ease-out',
            ':hover': {
              transform: 'scale(1.04)',
            },
          }}
        />

        {(onEdit || onDelete) && (
          <Box
            className="clothing-actions"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              display: 'flex',
              gap: 0.5,
              opacity: 0,
              transform: 'translateY(-4px)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                gap: 0.5,
                p: 0.625,
                borderRadius: 2.5,
                backdropFilter: 'blur(16px) saturate(180%)',
                WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                backgroundColor: 'rgba(255, 255, 255, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.7)',
                boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.08)',
              }}
            >
              {onEdit && (
                <IconButton
                  size="small"
                  onClick={() => onEdit(clothing)}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backdropFilter: 'blur(12px) saturate(150%)',
                    WebkitBackdropFilter: 'blur(12px) saturate(150%)',
                    backgroundColor: 'rgba(100, 149, 237, 0.25)',
                    border: '1px solid rgba(100, 149, 237, 0.4)',
                    color: '#4169E1',
                    transition: 'all 0.2s ease-out',
                    '&:hover': {
                      backgroundColor: 'rgba(100, 149, 237, 0.4)',
                      border: '1px solid rgba(100, 149, 237, 0.6)',
                      transform: 'scale(1.05)',
                      boxShadow: '0 2px 8px 0 rgba(65, 105, 225, 0.2)',
                    }
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              )}
              {onDelete && (
                <IconButton
                  size="small"
                  onClick={() => onDelete(clothing.id)}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backdropFilter: 'blur(12px) saturate(150%)',
                    WebkitBackdropFilter: 'blur(12px) saturate(150%)',
                    backgroundColor: 'rgba(220, 53, 69, 0.2)',
                    border: '1px solid rgba(220, 53, 69, 0.35)',
                    color: '#dc3545',
                    transition: 'all 0.2s ease-out',
                    '&:hover': {
                      backgroundColor: 'rgba(220, 53, 69, 0.35)',
                      border: '1px solid rgba(220, 53, 69, 0.55)',
                      transform: 'scale(1.05)',
                      boxShadow: '0 2px 8px 0 rgba(220, 53, 69, 0.2)',
                    }
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>
        )}

        <Chip
          className="category-chip"
          label={clothing.category || '未分类'}
          size="small"
          variant="filled"
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 10,
            fontWeight: 500,
            fontSize: '0.6875rem',
            height: 24,
            borderRadius: 2,
            bgcolor: 'primary.container',
            color: 'primary.onContainer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </Box>

      <CardContent sx={{ pt: 1.5, pb: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Typography
          variant="subtitle2"
          fontWeight={600}
          noWrap
          sx={{ mb: 0.5, fontSize: '0.875rem', lineHeight: 1.4 }}
          title={clothing.name || '未命名'}
        >
          {clothing.name || '未命名'}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip
            label={clothing.color || '未指定'}
            size="small"
            variant="outlined"
            sx={{
              height: 24,
              borderRadius: 2,
              fontWeight: 500,
              fontSize: '0.75rem',
              borderColor: 'outline.variant',
            }}
          />
          
          {clothing.last_worn_date && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: '0.6875rem', lineHeight: 1.4 }}
              title={`上次穿着: ${new Date(clothing.last_worn_date).toLocaleDateString('zh-CN')}`}
            >
              {(() => {
                const days = Math.floor((Date.now() - new Date(clothing.last_worn_date).getTime()) / (1000 * 60 * 60 * 24));
                if (days === 0) return '今日穿过';
                if (days === 1) return '昨日穿过';
                if (days < 7) return `${days}天前`;
                if (days < 30) return `${Math.floor(days / 7)}周前`;
                return `${Math.floor(days / 30)}月前`;
              })()}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

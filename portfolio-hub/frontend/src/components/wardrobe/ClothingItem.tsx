import { Box, Typography, Card, CardMedia, Avatar } from '@mui/material';

export interface ClothingItemData {
  id: string;
  name: string;
  category: string;
  color?: string;
  imageUrl?: string;
}

interface ClothingItemProps {
  part: 'upper' | 'lower' | 'feet';
  partLabel: string;
  clothing?: ClothingItemData;
  compact?: boolean;
}

const partIcons: Record<'upper' | 'lower' | 'feet', string> = {
  upper: '👕',
  lower: '👖',
  feet: '👟',
};

export function ClothingItem({ part, partLabel, clothing, compact = false }: ClothingItemProps) {
  console.log(`[ClothingItem] part=${part}, clothing=`, clothing);

  if (compact) {
    return (
      <Card
        variant="outlined"
        sx={{
          p: 0.75,
          borderRadius: 2,
          borderColor: 'outline.variant',
          bgcolor: 'surfaceContainerLow',
          transition: 'background-color 0.15s ease-out',
          '&:hover': {
            bgcolor: 'surfaceContainerHigh',
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: 'tertiary.container',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            {clothing?.imageUrl ? (
              <CardMedia
                component="img"
                image={clothing.imageUrl}
                alt={clothing.name}
                sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            ) : (
              partIcons[part]
            )}
          </Box>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              component="label"
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: '0.6875rem', lineHeight: 1.4 }}
            >
              {partLabel}
            </Typography>

            {clothing ? (
              <>
                <Typography
                  component="p"
                  variant="body2"
                  fontWeight={500}
                  sx={{ mt: 0.125, fontSize: '0.875rem', lineHeight: 1.4 }}
                >
                  {clothing.name}
                </Typography>
                {clothing.color && (
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: '0.6875rem' }}
                  >
                    {clothing.color}
                  </Typography>
                )}
              </>
            ) : (
              <Typography
                component="p"
                variant="caption"
                color="text.disabled"
                sx={{ fontSize: '0.6875rem', fontStyle: 'italic' }}
              >
                暂无推荐
              </Typography>
            )}
          </Box>
        </Box>
      </Card>
    );
  }

  return (
    <Card
      variant="elevation"
      elevation={0}
      sx={{
        p: 1.25,
        borderRadius: 3,
        bgcolor: 'surfaceContainerLow',
        border: `1px solid`,
        borderColor: 'outline.variant',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: 'tertiary.container',
            color: 'tertiary.onContainer',
            borderRadius: '50%',
            fontSize: '1rem',
            flexShrink: 0,
          }}
        >
          {clothing?.imageUrl ? (
            <CardMedia
              component="img"
              image={clothing.imageUrl}
              alt={clothing.name}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
            />
          ) : (
            partIcons[part]
          )}
        </Avatar>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            component="label"
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: '0.75rem' }}
          >
            {partLabel}
          </Typography>

          {clothing ? (
            <>
              <Typography
                component="p"
                variant="body2"
                fontWeight={500}
                sx={{ mt: 0.125, fontSize: '0.875rem' }}
              >
                {clothing.name}
              </Typography>
              {clothing.color && (
                <Typography
                  component="span"
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: '0.75rem' }}
                >
                  {clothing.color}
                </Typography>
              )}
            </>
          ) : (
            <Typography
              component="p"
              variant="caption"
              color="text.disabled"
              sx={{ fontStyle: 'italic' }}
            >
              暂无推荐
            </Typography>
          )}
        </Box>
      </Box>
    </Card>
  );
}

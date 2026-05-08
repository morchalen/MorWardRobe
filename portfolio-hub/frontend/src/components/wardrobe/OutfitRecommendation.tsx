import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Tooltip,
  Chip,
} from '@mui/material';
import { AutoAwesome, Star, StarOutline, StarHalf, Refresh, CalendarToday } from '@mui/icons-material';
import { HumanBodyModel } from './HumanBodyModel';
import { ClothingItem } from './ClothingItem';
import { lobsterApi } from '../../services/api';
import { clothesApi } from '../../services/api';
import type { Clothing } from '../../types';

interface OutfitData {
  upper?: {
    id: string;
    name: string;
    category: string;
    color: string;
    imageUrl: string;
  };
  lower?: {
    id: string;
    name: string;
    category: string;
    color: string;
    imageUrl: string;
  };
  feet?: {
    id: string;
    name: string;
    category: string;
    color: string;
    imageUrl: string;
  };
}

interface RatingData {
  score: number;
  verdict: string;
  breakdown: {
    color_harmony: number;
    style_coherence: number;
    occasion_fit: number;
    season_fit: number;
  };
  reason: string;
  suggestion: string;
}

interface OutfitRecommendationProps {
  bodyImageUrl?: string;
  onBodyImageUpdate?: (newUrl: string) => void;
}

const glassCardStyle = {
  backdropFilter: 'blur(16px) saturate(180%)',
  WebkitBackdropFilter: 'blur(16px) saturate(180%)',
  backgroundColor: 'rgba(255, 255, 255, 0.4)',
  borderRadius: 4,
  border: '1px solid rgba(255, 255, 255, 0.5)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
};

const glassPanelStyle = {
  ...glassCardStyle,
  borderRadius: 8,
};

export function OutfitRecommendation({ bodyImageUrl, onBodyImageUpdate }: OutfitRecommendationProps) {
  const theme = useTheme();
  const [outfitData, setOutfitData] = useState<OutfitData>({});
  const [ratingData, setRatingData] = useState<RatingData | null>(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [loadingRating, setLoadingRating] = useState(false);

  const CATEGORY_MAP: Record<string, 'upper' | 'lower' | 'feet'> = {
    '上衣': 'upper',
    '外套': 'upper',
    '连衣裙': 'upper',
    '裤子': 'lower',
    '裙子': 'lower',
    '鞋靴': 'feet',
    '鞋': 'feet',
  };

  const pickRandom = (items: Clothing[]) => {
    if (!items || items.length === 0) return undefined;
    const randomIndex = Math.floor(Math.random() * items.length);
    return {
      id: items[randomIndex].id,
      name: items[randomIndex].name,
      category: items[randomIndex].category,
      color: items[randomIndex].color,
      imageUrl: items[randomIndex].image_url,
    };
  };

  const fetchRandomRecommendation = useCallback(async () => {
    try {
      const result = await clothesApi.list({ per_page: 100 });
      const items = result.items;

      if (!items || items.length === 0) {
        console.log('[TodayPage] 暂无衣物数据，跳过随机推荐');
        return;
      }

      const tops = items.filter(item => CATEGORY_MAP[item.category] === 'upper');
      const bottoms = items.filter(item => CATEGORY_MAP[item.category] === 'lower');
      const shoes = items.filter(item => CATEGORY_MAP[item.category] === 'feet');

      setOutfitData({
        upper: pickRandom(tops),
        lower: pickRandom(bottoms),
        feet: pickRandom(shoes),
      });
    } catch (err) {
      console.error('随机推荐失败:', err);
    }
  }, []);

  const fetchAIRecommendation = useCallback(async () => {
    setLoadingRecommendation(true);
    try {
      const res = await lobsterApi.recommendOutfit();
      if (res.upper || res.lower || res.feet) {
        setOutfitData({
          upper: res.upper ? {
            id: res.upper.id,
            name: res.upper.name,
            category: res.upper.category,
            color: res.upper.color,
            imageUrl: res.upper.image_url,
          } : undefined,
          lower: res.lower ? {
            id: res.lower.id,
            name: res.lower.name,
            category: res.lower.category,
            color: res.lower.color,
            imageUrl: res.lower.image_url,
          } : undefined,
          feet: res.feet ? {
            id: res.feet.id,
            name: res.feet.name,
            category: res.feet.category,
            color: res.feet.color,
            imageUrl: res.feet.image_url,
          } : undefined,
        });
      }
    } catch (err) {
      console.error('AI推荐失败:', err);
    } finally {
      setLoadingRecommendation(false);
    }
  }, []);

  const rateOutfit = async () => {
    if (!outfitData.upper && !outfitData.lower && !outfitData.feet) return;

    setLoadingRating(true);
    try {
      const res = await lobsterApi.rateOutfit({
        upper_name: outfitData.upper?.name || '',
        lower_name: outfitData.lower?.name || '',
        feet_name: outfitData.feet?.name || '',
        upper_color: outfitData.upper?.color || '',
        lower_color: outfitData.lower?.color || '',
        feet_color: outfitData.feet?.color || '',
      });

      setRatingData({
        score: res.score,
        breakdown: res.breakdown,
        reason: res.reason,
        suggestion: res.suggestion,
      });
    } catch (err) {
      console.error('评分失败:', err);
    } finally {
      setLoadingRating(false);
    }
  };

  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const res = await lobsterApi.getLatestRecommendation();
        if (res.recommendation) {
          const rec = res.recommendation;
          setOutfitData({
            upper: rec.upper_name ? {
              id: '',
              name: rec.upper_name,
              category: '上装',
              color: rec.upper_color,
              imageUrl: rec.upper_image,
            } : undefined,
            lower: rec.lower_name ? {
              id: '',
              name: rec.lower_name,
              category: '下装',
              color: rec.lower_color,
              imageUrl: rec.lower_image,
            } : undefined,
            feet: rec.feet_name ? {
              id: '',
              name: rec.feet_name,
              category: '鞋履',
              color: rec.feet_color,
              imageUrl: rec.feet_image,
            } : undefined,
          });
        }
        if (res.rating) {
          const r = res.rating;
          setRatingData({
            score: r.score,
            verdict: r.verdict,
            breakdown: {
              color_harmony: r.color_harmony,
              style_coherence: r.style_coherence,
              occasion_fit: r.occasion_fit,
              season_fit: r.season_fit,
            },
            reason: r.reason,
            suggestion: r.suggestion,
          });
        }
        if (!res.recommendation) {
          fetchRandomRecommendation();
        }
      } catch (err) {
        console.error('加载保存数据失败:', err);
        fetchRandomRecommendation();
      }
    };
    loadSavedData();
  }, [fetchRandomRecommendation]);

  const renderStars = (score: number) => {
    const fullStars = Math.floor(score / 2);
    const hasHalfStar = score % 2 >= 1;

    return (
      <Box sx={{ display: 'flex', gap: 0.125 }}>
        {[...Array(5)].map((_, i) => (
          <span key={i}>
            {i < fullStars ? (
              <Star sx={{ fontSize: 14, color: '#F9AB00' }} />
            ) : i === fullStars && hasHalfStar ? (
              <StarHalf sx={{ fontSize: 14, color: '#F9AB00' }} />
            ) : (
              <StarOutline sx={{ fontSize: 14, color: theme.palette.text.disabled }} />
            )}
          </span>
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
        ...glassCardStyle,
      }}>
        <Typography component="h2" variant="subtitle1" fontWeight={600}>
          今日穿搭推荐
        </Typography>

        <Chip
          icon={<CalendarToday sx={{ fontSize: 12 }} />}
          label={new Date().toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
          size="small"
          sx={{
            height: 28,
            borderRadius: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(8px)',
          }}
        />
      </Box>

      <Box sx={{
        display: 'flex',
        gap: 2,
        minHeight: 320,
        maxHeight: 400,
        alignItems: 'stretch',
      }}>
        <Box sx={{ flex: '0 0 auto', width: '35%', display: 'flex', alignItems: 'stretch' }}>
          <HumanBodyModel imageUrl={bodyImageUrl} onImageUpdate={onBodyImageUpdate} compact />
        </Box>

        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          p: 2,
          ...glassCardStyle,
        }}>
          <ClothingItem part="upper" partLabel="上装" clothing={outfitData.upper} compact />
          <ClothingItem part="lower" partLabel="下装" clothing={outfitData.lower} compact />
          <ClothingItem part="feet" partLabel="鞋履" clothing={outfitData.feet} compact />

          {!outfitData.upper && !outfitData.lower && !outfitData.feet && (
            <Box sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
              gap: 1.25,
              p: 2,
              borderRadius: 2.5,
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
            }}>
              <AutoAwesome sx={{ fontSize: 32, opacity: 0.4 }} />
              <Typography component="p" variant="body2" color="text.secondary" textAlign="center">
                暂无衣物数据，请先添加衣物到衣橱
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{
        display: 'flex',
        gap: 1.5,
        p: 1.5,
        ...glassPanelStyle,
        justifyContent: 'center',
      }}>
        <Button
          variant="outlined"
          size="medium"
          startIcon={<Refresh />}
          onClick={fetchRandomRecommendation}
          fullWidth
          sx={{
            borderRadius: 20,
            textTransform: 'none',
            fontWeight: 500,
            borderColor: 'rgba(255, 255, 255, 0.5)',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(8px)',
            color: 'text.primary',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              borderColor: 'rgba(255, 255, 255, 0.8)',
            },
          }}
        >
          随机换一套
        </Button>

        <Tooltip title="由龙虾AI根据你的衣橱智能推荐">
          <Button
            variant="contained"
            size="medium"
            startIcon={
              loadingRecommendation ? <CircularProgress size={16} color="inherit" /> : <AutoAwesome />
            }
            onClick={fetchAIRecommendation}
            disabled={loadingRecommendation}
            fullWidth
            sx={{
              borderRadius: 20,
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd1 0%, #6a4190 100%)',
                boxShadow: '0 6px 25px rgba(102, 126, 234, 0.5)',
              },
            }}
          >
            {loadingRecommendation ? 'AI 推荐中...' : 'AI 推荐'}
          </Button>
        </Tooltip>

        {(outfitData.upper || outfitData.lower || outfitData.feet) && (
          <Button
            variant="outlined"
            size="medium"
            startIcon={
              loadingRating ? <CircularProgress size={16} /> : <Star />
            }
            onClick={rateOutfit}
            disabled={loadingRating}
            fullWidth
            sx={{
              borderRadius: 20,
              textTransform: 'none',
              fontWeight: 500,
              borderColor: 'rgba(255, 255, 255, 0.5)',
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(8px)',
              color: 'text.primary',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                borderColor: 'rgba(255, 255, 255, 0.8)',
              },
            }}
          >
            {loadingRating ? '评分中...' : '评分'}
          </Button>
        )}
      </Box>

      {ratingData && (
        <Box sx={{
          mt: 2,
          p: 2.5,
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            mb: 1.5,
          }}>
            {renderStars(ratingData.score)}
            <Typography component="span" variant="subtitle2" fontWeight={600} color="text.primary">
              {ratingData.score}/10 分
            </Typography>
            {ratingData.verdict && (
              <Typography component="span" variant="caption" color="primary.main" sx={{ ml: 0.5, fontStyle: 'italic' }}>
                — {ratingData.verdict}
              </Typography>
            )}
          </Box>

          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1,
            mb: 1.5,
          }}>
            {[
              { label: '色彩搭配', value: ratingData.breakdown.color_harmony },
              { label: '风格一致', value: ratingData.breakdown.style_coherence },
              { label: '场合适配', value: ratingData.breakdown.occasion_fit },
              { label: '季节适配', value: ratingData.breakdown.season_fit },
            ].map((item) => (
              <Box
                key={item.label}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  px: 1.25,
                  py: 1,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                <Typography component="span" variant="caption" color="text.secondary" fontWeight={500}>
                  {item.label}
                </Typography>
                <Typography component="span" variant="caption" fontWeight={600} color="text.primary">
                  {item.value}/10
                </Typography>
              </Box>
            ))}
          </Box>

          <Typography component="p" variant="body2" color="text.primary" sx={{ mb: 0.75, lineHeight: 1.5 }}>
            💡 {ratingData.reason}
          </Typography>

          {ratingData.suggestion && (
            <Typography component="p" variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
              建议：{ratingData.suggestion}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
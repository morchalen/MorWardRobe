import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, IconButton, Checkbox, Collapse, useTheme, Avatar, Tooltip } from '@mui/material';
import {
  School as AcademicIcon,
  Work as WorkIcon,
  Home as RealityIcon,
  SportsEsports as EntertainmentIcon,
  Psychology as BrainIcon,
  Add as AddIcon,
  DeleteOutline as DeleteIcon,
  CheckCircleOutline as CheckDoneIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Logout as LogoutIcon,
  AccountCircle as UserIcon,
} from '@mui/icons-material';
import { useAuthStore } from '@/stores';
import { brainApi } from '@/services/api';

interface Task {
  id: string;
  user_id: string;
  content: string;
  quadrant: 'academic' | 'work' | 'reality' | 'entertainment';
  is_completed: boolean;
  created_at: number;
  completed_at: number;
}

interface QuadrantConfig {
  key: string;
  label: string;
  icon: React.ReactNode;
}

const QUADRANTS: QuadrantConfig[] = [
  { key: 'academic', label: '学术', icon: <AcademicIcon sx={{ fontSize: 12 }} /> },
  { key: 'work', label: '工作', icon: <WorkIcon sx={{ fontSize: 12 }} /> },
  { key: 'reality', label: '现实', icon: <RealityIcon sx={{ fontSize: 12 }} /> },
  { key: 'entertainment', label: '娱乐', icon: <EntertainmentIcon sx={{ fontSize: 12 }} /> },
];

function getStorageKey(userId: string | null | undefined): string {
  const uid = userId || 'anonymous';
  return `brain_tasks_${uid}`;
}

function loadFromCache(userId: string | null | undefined): Task[] {
  try {
    const saved = localStorage.getItem(getStorageKey(userId));
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

function saveToCache(tasks: Task[], userId: string | null | undefined) {
  localStorage.setItem(getStorageKey(userId), JSON.stringify(tasks));
}

export function BrainPage() {
  const theme = useTheme();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>(loadFromCache(user?.id));
  const [synced, setSynced] = useState(false);
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, string>>({
    academic: '', work: '', reality: '', entertainment: '',
  });

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  const ACCENT = theme.palette.primary.main;
  const ACCENT_LIGHT = theme.palette.primary.light;
  const BORDER = theme.palette.divider;

  useEffect(() => {
    if (!user) return;
    brainApi
      .getTasks()
      .then((data) => {
        const remote = data?.tasks || [];
        if (remote.length > 0) {
          setTasks(remote);
          saveToCache(remote, user.id);
        }
      })
      .catch(() => {})
      .finally(() => setSynced(true));
  }, [user]);

  useEffect(() => {
    saveToCache(tasks, user?.id);
  }, [tasks]);

  const getByQuadrant = (q: string): Task[] => tasks.filter((t) => t.quadrant === q);

  const handleAdd = useCallback(
    (quadrant: string) => {
      const content = inputValues[quadrant].trim();
      if (!content) { setActiveInput(null); return; }
      const tempId = `t-${Date.now()}`;
      const task: Task = {
        id: tempId,
        user_id: user?.id || '',
        content,
        quadrant: quadrant as Task['quadrant'],
        is_completed: false,
        created_at: Date.now(),
        completed_at: 0,
      };
      setTasks((prev) => [...prev, task]);
      setInputValues((prev) => ({ ...prev, [quadrant]: '' }));
      setActiveInput(null);

      if (user) {
        brainApi
          .createTask({ content, quadrant })
          .then((created) => {
            if (created?.id) {
              setTasks((prev) => prev.map((t) => (t.id === tempId ? { ...t, id: created.id, created_at: created.created_at } : t)));
            }
          })
          .catch(() => {});
      }
    },
    [inputValues, user]
  );

  const handleToggle = useCallback(
    (id: string) => {
      setTasks((prev) => {
        const updated = prev.map((t) => {
          if (t.id !== id) return t;
          const now = Date.now();
          return { ...t, is_completed: !t.is_completed, completed_at: !t.is_completed ? now : 0 };
        });
        const target = updated.find((t) => t.id === id);
        if (target && user) {
          brainApi.updateTask(id, { is_completed: target.is_completed }).catch(() => {});
        }
        return updated;
      });
    },
    [user]
  );

  const handleDelete = useCallback(
    (id: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      if (user) {
        brainApi.deleteTask(id).catch(() => {});
      }
    },
    [user]
  );

  const handleKey = (e: React.KeyboardEvent, q: string) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAdd(q); }
    if (e.key === 'Escape') { setActiveInput(null); setInputValues((p) => ({ ...p, [q]: '' })); }
  };

  const completed = tasks.filter((t) => t.is_completed).length;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.paper, px: 2, py: 1.5 }}>
      <Box sx={{ maxWidth: 1000, mx: 'auto' }}>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <BrainIcon sx={{ color: ACCENT, fontSize: 16, mr: 0.75 }} />
          <Typography variant="body2" fontWeight={600} sx={{ color: theme.palette.text.primary, fontSize: '0.8rem' }}>
            大脑四象限
          </Typography>
          
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
              {completed}/{tasks.length}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 1.5, borderLeft: `1px solid ${BORDER}` }}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: ACCENT, fontSize: 12 }}>
                {user?.email?.charAt(0)?.toUpperCase() || <UserIcon sx={{ fontSize: 14 }} />}
              </Avatar>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="caption" sx={{ color: theme.palette.text.primary, fontSize: '0.65rem', fontWeight: 500 }}>
                  {user?.email}
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.55rem' }}>
                  {user?.role === 'admin' ? '管理员' : '用户'}
                </Typography>
              </Box>
              <Tooltip title="退出登录">
                <IconButton
                  size="small"
                  onClick={handleLogout}
                  sx={{
                    p: 0.5,
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      bgcolor: theme.palette.action.hover,
                      color: theme.palette.error.main,
                    },
                  }}
                >
                  <LogoutIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.25 }}>
          {QUADRANTS.map((q) => {
            const all = getByQuadrant(q.key);
            const pending = all.filter((t) => !t.is_completed);
            const done = all.filter((t) => t.is_completed);
            const showInput = activeInput === q.key;

            return (
              <Box
                key={q.key}
                sx={{
                  border: `1px solid ${BORDER}`,
                  borderRadius: '4px',
                  overflow: 'hidden',
                  transition: 'border-color 0.15s',
                  '&:hover': { borderColor: `${ACCENT}40` },
                }}
              >

                <Box
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 0.75,
                    px: 1.25, py: 0.75, bgcolor: ACCENT_LIGHT,
                    borderBottom: `1px solid ${BORDER}`,
                  }}
                >
                  <Box sx={{ color: ACCENT, display: 'flex' }}>{q.icon}</Box>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: theme.palette.text.primary }}>
                    {q.label}
                  </Typography>
                  {pending.length > 0 && (
                    <Typography sx={{
                      ml: 'auto', px: 0.75, py: 0.15, borderRadius: '2px',
                      bgcolor: `${ACCENT}15`, color: ACCENT, fontSize: '0.62rem', fontWeight: 600,
                    }}>
                      {pending.length}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ px: 1.25, py: 0.75, minHeight: 48 }}>
                  {pending.length === 0 && done.length === 0 ? (
                    <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled', textAlign: 'center', py: 2 }}>
                      暂无任务
                    </Typography>
                  ) : (
                    <>
                      {pending.map((t) => (
                        <Box
                          key={t.id}
                          sx={{
                            display: 'flex', alignItems: 'center', gap: 0.75,
                            py: 0.3, borderRadius: '2px',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.015)' },
                          }}
                        >
                          <Checkbox
                            checked={false}
                            onChange={() => handleToggle(t.id)}
                            icon={<UncheckedIcon sx={{ fontSize: 15, color: `${ACCENT}70` }} />}
                            checkedIcon={<CheckDoneIcon sx={{ fontSize: 15, color: ACCENT }} />}
                            sx={{ p: 0 }}
                          />
                          <Typography sx={{ flex: 1, fontSize: '0.72rem', color: theme.palette.text.primary, lineHeight: 1.4 }}>
                            {t.content}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(t.id)}
                            sx={{
                              p: 0, opacity: 0, color: 'text.disabled',
                              '&:hover': { color: 'error.main', bgcolor: 'transparent' },
                              '.MuiBox-root:hover &': { opacity: 1 },
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 13 }} />
                          </IconButton>
                        </Box>
                      ))}

                      {done.slice(0, 2).map((t) => (
                        <Box
                          key={t.id}
                          sx={{
                            display: 'flex', alignItems: 'center', gap: 0.75,
                            py: 0.2, opacity: 0.45,
                          }}
                        >
                          <Checkbox
                            checked
                            onChange={() => handleToggle(t.id)}
                            checkedIcon={<CheckDoneIcon sx={{ fontSize: 15, color: `${ACCENT}60` }} />}
                            sx={{ p: 0 }}
                          />
                          <Typography sx={{
                            flex: 1, fontSize: '0.67rem', color: 'text.disabled',
                            textDecoration: 'line-through',
                          }}>
                            {t.content}
                          </Typography>
                        </Box>
                      ))}
                    </>
                  )}
                </Box>

                <Box sx={{ px: 1, pb: 0.75 }}>
                  <Collapse in={showInput}>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                      <TextField
                        size="small"
                        fullWidth
                        autoFocus
                        placeholder="输入..."
                        value={inputValues[q.key]}
                        onChange={(e) => setInputValues((p) => ({ ...p, [q.key]: e.target.value }))}
                        onKeyDown={(e) => handleKey(e, q.key)}
                        onBlur={() => { if (!inputValues[q.key].trim()) setActiveInput(null); }}
                        inputProps={{ style: { fontSize: '0.7rem', padding: '4px 8px' } }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '3px',
                            '& fieldset': { borderColor: `${ACCENT}50` },
                            '&:hover fieldset': { borderColor: ACCENT },
                            '&.Mui-focused fieldset': { borderColor: ACCENT, borderWidth: 1 },
                          },
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleAdd(q.key)}
                        disabled={!inputValues[q.key].trim()}
                        sx={{
                          width: 24, height: 24, borderRadius: '3px',
                          bgcolor: inputValues[q.key].trim() ? ACCENT : theme.palette.action.disabledBackground,
                          color: 'white',
                          '&:hover': { bgcolor: inputValues[q.key].trim() ? theme.palette.primary.dark : theme.palette.action.disabledBackground },
                          '&:disabled': { bgcolor: theme.palette.action.disabledBackground, color: theme.palette.text.disabled },
                        }}
                      >
                        <AddIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  </Collapse>

                  {!showInput && (
                    <IconButton
                      size="small"
                      onClick={() => setActiveInput(q.key)}
                      sx={{
                        width: 20, height: 20, borderRadius: '3px',
                        color: `${ACCENT}80`, border: `1px dashed ${ACCENT}40`,
                        '&:hover': { bgcolor: `${ACCENT}10`, borderStyle: 'solid', borderColor: ACCENT, color: ACCENT },
                      }}
                    >
                      <AddIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

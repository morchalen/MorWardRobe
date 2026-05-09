export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

interface TimeColorSlot {
  startHour: number;
  endHour: number;
  color: string;
  name: string;
}

const TIME_COLOR_MAP: TimeColorSlot[] = [
  { startHour: 0, endHour: 3, color: '#000000', name: '纯黑' },
  { startHour: 3, endHour: 5, color: '#0F1423', name: '深邃靛蓝' },
  { startHour: 5, endHour: 7, color: '#A58EBA', name: '淡紫' },
  { startHour: 7, endHour: 8, color: '#F5C56E', name: '浅金色' },
  { startHour: 8, endHour: 11, color: '#F0E68C', name: '柠檬黄' },
  { startHour: 11, endHour: 13, color: '#FFFACD', name: '正午白金色' },
  { startHour: 13, endHour: 14, color: '#F5E6B2', name: '暖黄' },
  { startHour: 14, endHour: 16, color: '#E8B55A', name: '暖橘黄' },
  { startHour: 16, endHour: 17, color: '#D9983A', name: '深金色' },
  { startHour: 17, endHour: 19, color: '#D94F30', name: '浓郁橘红' },
  { startHour: 19, endHour: 22, color: '#1A2A42', name: '深普鲁士蓝' },
  { startHour: 22, endHour: 24, color: '#150F1A', name: '漆黑深紫' },
];

export function getTimeBasedColor(date?: Date): { color: string; name: string; slot: TimeColorSlot } {
  const now = date || new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours + minutes / 60;

  for (const slot of TIME_COLOR_MAP) {
    const startTime = slot.startHour;
    const endTime = slot.endHour === 0 ? 24 : slot.endHour;

    if (startTime <= currentTime && currentTime < endTime) {
      return { color: slot.color, name: slot.name, slot };
    }
  }

  return { color: '#000000', name: '纯黑', slot: TIME_COLOR_MAP[0] };
}

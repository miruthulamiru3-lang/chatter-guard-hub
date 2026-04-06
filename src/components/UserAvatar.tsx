import React from 'react';

interface UserAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  isOnline?: boolean;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

const colors = [
  'bg-primary', 'bg-accent', 'bg-warning', 'bg-destructive',
  'hsl(280, 60%, 50%)', 'hsl(200, 70%, 50%)', 'hsl(340, 65%, 50%)',
];

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % colors.length;
}

export default function UserAvatar({ name, size = 'md', isOnline }: UserAvatarProps) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const colorIdx = getColor(name);
  const bgClass = colorIdx < 4 ? colors[colorIdx] : '';
  const bgStyle = colorIdx >= 4 ? { backgroundColor: colors[colorIdx] } : {};

  return (
    <div className="relative inline-flex">
      <div
        className={`${sizeClasses[size]} ${bgClass} rounded-full flex items-center justify-center font-semibold text-primary-foreground shrink-0`}
        style={bgStyle}
      >
        {initials}
      </div>
      {isOnline !== undefined && (
        <span
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card ${isOnline ? 'bg-online' : 'bg-offline'}`}
        />
      )}
    </div>
  );
}

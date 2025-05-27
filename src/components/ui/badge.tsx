// src/components/ui/badge.tsx
import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, className = "" }) => {
  return (
    <span className={`px-2 py-1 text-sm rounded-full text-white ${className}`}>
      {children}
    </span>
  );
};

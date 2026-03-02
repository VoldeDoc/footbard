"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "accent";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variants = {
  primary: "bg-primary hover:bg-primary-hover text-white",
  secondary: "bg-card hover:bg-card-hover text-foreground border border-border",
  danger: "bg-danger hover:bg-danger-hover text-white",
  ghost: "hover:bg-card text-muted-light hover:text-foreground",
  accent: "bg-accent hover:bg-accent-hover text-white",
};

const sizes = {
  sm: "py-1.5 px-3 text-xs",
  md: "py-2.5 px-5 text-sm",
  lg: "py-3 px-6 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  icon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </motion.button>
  );
}

import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "outline";
type Size    = "sm" | "md" | "lg";

interface ButtonProps {
  label:     string;
  onPress:   () => void;
  variant?:  Variant;
  size?:     Size;
  loading?:  boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const variantStyles: Record<Variant, string> = {
  primary:   "bg-primary active:bg-primary-dark",
  secondary: "bg-surface border border-border",
  danger:    "bg-danger active:bg-red-600",
  ghost:     "bg-transparent",
  outline:   "bg-transparent border border-primary",
};

const textStyles: Record<Variant, string> = {
  primary:   "text-white",
  secondary: "text-white",
  danger:    "text-white",
  ghost:     "text-muted",
  outline:   "text-primary",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-2 rounded-lg",
  md: "px-5 py-3 rounded-xl",
  lg: "px-6 py-4 rounded-2xl",
};

const textSizeStyles: Record<Size, string> = {
  sm: "text-sm font-semibold",
  md: "text-base font-semibold",
  lg: "text-lg font-bold",
};

export function Button({
  label,
  onPress,
  variant  = "primary",
  size     = "md",
  loading  = false,
  disabled = false,
  fullWidth = false,
  className = "",
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`
        items-center justify-center flex-row gap-2
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? "w-full" : ""}
        ${isDisabled ? "opacity-50" : ""}
        ${className}
      `}
    >
      {loading && <ActivityIndicator size="small" color="#fff" />}
      <Text className={`${textStyles[variant]} ${textSizeStyles[size]}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

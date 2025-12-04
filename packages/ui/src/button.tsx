import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "ghost" | "outline";
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-brand text-white hover:bg-brand-dark focus-visible:ring-brand",
  secondary: "bg-white text-brand border border-brand hover:bg-brand-light/20 focus-visible:ring-brand-dark",
  success: "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500",
  warning: "bg-amber-400 text-black hover:bg-amber-500 focus-visible:ring-amber-300",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
  ghost: "bg-transparent text-brand hover:bg-brand-light/10 focus-visible:ring-brand-light",
  outline:
    "bg-transparent text-brand border border-brand hover:bg-brand-light/10 focus-visible:ring-brand-dark"
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", className = "", ...props },
  ref
) {
  const classes = [baseStyles, variantStyles[variant], className].filter(Boolean).join(" ");

  return <button ref={ref} className={classes} {...props} />;
});

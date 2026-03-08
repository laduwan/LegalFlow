"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  initials?: string;
  size?: "sm" | "md" | "lg";
}

function Avatar({
  className,
  src,
  alt = "",
  initials = "",
  size = "md",
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  const showImage = src && !imageError;

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-600 font-medium",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{initials.toUpperCase()}</span>
      )}
    </div>
  );
}

export { Avatar };
export type { AvatarProps };

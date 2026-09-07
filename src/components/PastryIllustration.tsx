"use client";

import React from "react";

interface PastryIllustrationProps {
  variantId: string;
  className?: string;
  size?: number;
}

export const PastryIllustration: React.FC<PastryIllustrationProps> = ({
  variantId,
  className = "",
  size = 140,
}) => {
  // Mapping warna krim & topping sesuai varian
  const getColors = () => {
    switch (variantId) {
      case "chocolate":
        return { cream: "#5A2E12", crust: "#F59E0B", accent: "#3B1B06", topDrizzle: "#451A03" };
      case "matcha":
        return { cream: "#84CC16", crust: "#FCD34D", accent: "#4D7C0F", topDrizzle: "#3F6212" };
      case "oreo":
        return { cream: "#E5E7EB", crust: "#FCD34D", accent: "#1F2937", topDrizzle: "#111827" };
      case "chocochips":
        return { cream: "#FEF3C7", crust: "#F59E0B", accent: "#451A03", topDrizzle: "#78350F" };
      case "strawberry":
        return { cream: "#FDA4AF", crust: "#FCD34D", accent: "#E11D48", topDrizzle: "#BE123C" };
      case "blueberry":
        return { cream: "#C084FC", crust: "#FCD34D", accent: "#7E22CE", topDrizzle: "#6B21A8" };
      case "caramel":
        return { cream: "#FDE68A", crust: "#D97706", accent: "#B45309", topDrizzle: "#92400E" };
      case "tiramisu":
        return { cream: "#F3E8FF", crust: "#CA8A04", accent: "#78350F", topDrizzle: "#5C3817" };
      case "nanas":
        return { cream: "#FEF08A", crust: "#F59E0B", accent: "#CA8A04", topDrizzle: "#A16207" };
      case "durian":
        return { cream: "#FACC15", crust: "#FBBF24", accent: "#A16207", topDrizzle: "#854D0E" };
      case "cheese":
        return { cream: "#FEF9C3", crust: "#F59E0B", accent: "#F59E0B", topDrizzle: "#D97706" };
      case "taro":
        return { cream: "#D8B4FE", crust: "#FCD34D", accent: "#9333EA", topDrizzle: "#7E22CE" };
      case "original":
      default:
        return { cream: "#FFFBEB", crust: "#F59E0B", accent: "#FCD34D", topDrizzle: "#D97706" };
    }
  };

  const theme = getColors();

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center select-none ${className}`}
    >
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[2px_2px_0px_#1A1A1A]"
      >
        {/* Soft Shadow Pod */}
        <ellipse cx="80" cy="142" rx="55" ry="12" fill="#1A1A1A" opacity="0.15" />

        {/* Lower Choux Puff */}
        <ellipse
          cx="80"
          cy="106"
          rx="58"
          ry="38"
          fill="#FDE68A"
          stroke="#1A1A1A"
          strokeWidth="3.5"
        />

        {/* Crust baked rim */}
        <path
          d="M28 114 C40 135, 120 135, 132 114 C120 126, 40 126, 28 114 Z"
          fill={theme.crust}
          opacity="0.6"
        />

        {/* Generous Cream Layer Overflow */}
        <path
          d="M26 98 C36 86, 50 108, 68 96 C86 86, 102 108, 120 95 C132 88, 136 102, 134 100 C136 114, 118 122, 98 118 C70 123, 40 116, 26 98 Z"
          fill={theme.cream}
          stroke="#1A1A1A"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Top Choux Dome */}
        <path
          d="M28 92 C22 55, 55 40, 80 40 C105 40, 138 55, 132 92 C116 82, 96 88, 80 82 C64 88, 44 82, 28 92 Z"
          fill="#FCD34D"
          stroke="#1A1A1A"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Craquelin Texture / Drizzle */}
        <path
          d="M52 52 Q68 45 80 54"
          stroke={theme.topDrizzle}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M92 53 Q106 48 116 58"
          stroke={theme.topDrizzle}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M40 68 Q52 74 62 68"
          stroke={theme.topDrizzle}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M102 70 Q114 75 122 69"
          stroke={theme.topDrizzle}
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Special Details based on flavor */}
        {variantId === "oreo" && (
          <g>
            <circle cx="70" cy="100" r="3.5" fill="#1F2937" />
            <circle cx="88" cy="105" r="4" fill="#1F2937" />
            <circle cx="106" cy="98" r="3" fill="#1F2937" />
          </g>
        )}

        {variantId === "chocochips" && (
          <g>
            <polygon points="68,98 73,105 64,106" fill="#451A03" />
            <polygon points="90,102 96,108 86,110" fill="#451A03" />
            <polygon points="108,96 113,102 105,103" fill="#451A03" />
          </g>
        )}

        {variantId === "matcha" && (
          <g>
            {/* Green tea leaf topper */}
            <path
              d="M80 34 C74 25, 84 18, 90 22 C96 26, 88 32, 80 34 Z"
              fill="#4D7C0F"
              stroke="#1A1A1A"
              strokeWidth="1.5"
            />
          </g>
        )}

        {variantId === "strawberry" && (
          <g>
            {/* Mini Strawberry Topper */}
            <path
              d="M80 36 C86 36, 90 41, 88 47 C86 52, 80 54, 80 54 C80 54, 74 52, 72 47 C70 41, 74 36, 80 36 Z"
              fill="#FF5C9A"
              stroke="#1A1A1A"
              strokeWidth="2"
            />
            <path d="M80 34 L78 30 L82 30 Z" fill="#22C55E" stroke="#1A1A1A" strokeWidth="1.5" />
          </g>
        )}

        {variantId === "cheese" && (
          <g>
            {/* Cheese shreds on top */}
            <rect x="65" y="46" width="10" height="3" rx="1.5" fill="#F59E0B" transform="rotate(-15 65 46)" />
            <rect x="85" y="44" width="12" height="3" rx="1.5" fill="#F59E0B" transform="rotate(25 85 44)" />
            <rect x="74" y="52" width="11" height="3" rx="1.5" fill="#F59E0B" transform="rotate(5 74 52)" />
          </g>
        )}
      </svg>
    </div>
  );
};

"use client";

import React from "react";

interface MascotProps {
  pose?: "welcome" | "happy" | "chef" | "empty" | "success" | "thinking";
  size?: number;
  className?: string;
}

export const MascotChoux: React.FC<MascotProps> = ({
  pose = "welcome",
  size = 120,
  className = "",
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center select-none ${className}`}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[3px_3px_0px_#1A1A1A]"
      >
        {/* Background Aura / Sparkles */}
        {pose === "happy" || pose === "success" ? (
          <g>
            <path
              d="M30 45 L35 30 L40 45 L55 50 L40 55 L35 70 L30 55 L15 50 Z"
              fill="#FFE066"
              stroke="#1A1A1A"
              strokeWidth="2.5"
            />
            <path
              d="M165 40 L168 30 L171 40 L181 43 L171 46 L168 56 L165 46 L155 43 Z"
              fill="#FF5C9A"
              stroke="#1A1A1A"
              strokeWidth="2.5"
            />
            <circle cx="170" cy="120" r="4" fill="#FFE066" stroke="#1A1A1A" strokeWidth="2" />
            <circle cx="25" cy="130" r="3" fill="#FFD3E6" stroke="#1A1A1A" strokeWidth="2" />
          </g>
        ) : null}

        {pose === "chef" ? (
          /* Topi Koki Chef */
          <g>
            <path
              d="M80 50 C75 25, 125 25, 120 50 C135 45, 145 65, 130 75 L70 75 C55 65, 65 45, 80 50 Z"
              fill="#FFF9FB"
              stroke="#1A1A1A"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <rect
              x="70"
              y="70"
              width="60"
              height="10"
              rx="4"
              fill="#FF5C9A"
              stroke="#1A1A1A"
              strokeWidth="3"
            />
          </g>
        ) : null}

        {/* Lower Choux Body (Pastry Shell Bottom) */}
        <ellipse
          cx="100"
          cy="125"
          rx="72"
          ry="48"
          fill="#FDE68A"
          stroke="#1A1A1A"
          strokeWidth="4"
        />

        {/* Crust Shadow Accent */}
        <path
          d="M38 135 C50 160, 150 160, 162 135 C150 150, 50 150, 38 135 Z"
          fill="#F59E0B"
          opacity="0.4"
        />

        {/* Cream Layer Overflow (Tengah Lumer) */}
        <path
          d="M36 122 C48 110, 60 132, 80 120 C100 108, 115 130, 135 118 C150 110, 164 125, 164 122 C168 136, 145 142, 120 138 C90 144, 55 138, 36 122 Z"
          fill="#FFF9FB"
          stroke="#1A1A1A"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Cream drip accent */}
        <ellipse cx="78" cy="132" rx="6" ry="8" fill="#FFF9FB" stroke="#1A1A1A" strokeWidth="2.5" />
        <ellipse cx="126" cy="130" rx="5" ry="7" fill="#FFF9FB" stroke="#1A1A1A" strokeWidth="2.5" />

        {/* Upper Choux Puff (Top Dome) */}
        <path
          d="M38 115 C30 75, 70 55, 100 55 C130 55, 170 75, 162 115 C145 105, 120 112, 100 105 C80 112, 55 105, 38 115 Z"
          fill="#FCD34D"
          stroke="#1A1A1A"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Craquelin / Sugar Crunch Texture Patterns */}
        <path d="M70 65 Q85 60 95 68" stroke="#D97706" strokeWidth="3" strokeLinecap="round" />
        <path d="M110 66 Q125 62 135 72" stroke="#D97706" strokeWidth="3" strokeLinecap="round" />
        <path d="M55 80 Q65 85 75 80" stroke="#D97706" strokeWidth="3" strokeLinecap="round" />
        <path d="M125 82 Q138 86 148 80" stroke="#D97706" strokeWidth="3" strokeLinecap="round" />

        {/* Eyes & Expression Based on Pose */}
        {pose === "empty" ? (
          /* Sedih / Bengong */
          <g>
            <circle cx="78" cy="92" r="5" fill="#1A1A1A" />
            <circle cx="122" cy="92" r="5" fill="#1A1A1A" />
            {/* Air mata kecil */}
            <path d="M72 98 Q70 105 74 106 Q78 105 76 98 Z" fill="#93C5FD" stroke="#1A1A1A" strokeWidth="1.5" />
            {/* Mulut Sedih */}
            <path d="M92 105 Q100 98 108 105" stroke="#1A1A1A" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        ) : pose === "thinking" ? (
          /* Berpikir */
          <g>
            <ellipse cx="78" cy="90" rx="7" ry="8" fill="#1A1A1A" />
            <circle cx="75" cy="88" r="2.5" fill="#FFF9FB" />
            <ellipse cx="122" cy="90" rx="7" ry="8" fill="#1A1A1A" />
            <circle cx="119" cy="88" r="2.5" fill="#FFF9FB" />
            {/* Mulut O */}
            <ellipse cx="100" cy="103" rx="5" ry="6" fill="#1A1A1A" />
            {/* Alis miring */}
            <line x1="70" y1="80" x2="84" y2="82" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
            <line x1="116" y1="80" x2="130" y2="76" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
          </g>
        ) : (
          /* Ceria / Normal / Sukses / Chef / Welcome */
          <g>
            {/* Mata Kiri Besar Berbinar */}
            <ellipse cx="76" cy="90" rx="9" ry="11" fill="#1A1A1A" />
            <circle cx="73" cy="86" r="3.5" fill="#FFF9FB" />
            <circle cx="79" cy="94" r="1.5" fill="#FFF9FB" />

            {/* Mata Kanan Besar Berbinar */}
            <ellipse cx="124" cy="90" rx="9" ry="11" fill="#1A1A1A" />
            <circle cx="121" cy="86" r="3.5" fill="#FFF9FB" />
            <circle cx="127" cy="94" r="1.5" fill="#FFF9FB" />

            {/* Pipi Merona Pink */}
            <ellipse cx="60" cy="97" rx="9" ry="6" fill="#FF85B3" />
            <ellipse cx="140" cy="97" rx="9" ry="6" fill="#FF85B3" />

            {/* Senyum Lebar Bahagia */}
            <path
              d="M88 97 Q100 112 112 97"
              stroke="#1A1A1A"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="#FF5C9A"
            />
          </g>
        )}

        {/* Pose Tangan */}
        {pose === "welcome" && (
          <g>
            {/* Tangan melambai */}
            <path
              d="M35 110 C20 95, 15 80, 25 75 C35 70, 42 85, 45 105"
              fill="#FDE68A"
              stroke="#1A1A1A"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <path
              d="M165 110 C180 115, 185 125, 175 130 C165 135, 158 120, 155 112"
              fill="#FDE68A"
              stroke="#1A1A1A"
              strokeWidth="3.5"
            />
          </g>
        )}

        {pose === "success" && (
          <g>
            {/* Dua tangan angkat ke atas tanda hore */}
            <path
              d="M38 105 C20 85, 20 70, 30 65 C40 60, 45 80, 46 98"
              fill="#FDE68A"
              stroke="#1A1A1A"
              strokeWidth="3.5"
            />
            <path
              d="M162 105 C180 85, 180 70, 170 65 C160 60, 155 80, 154 98"
              fill="#FDE68A"
              stroke="#1A1A1A"
              strokeWidth="3.5"
            />
          </g>
        )}

        {/* Small Berry / Strawberry Pin on Head for Extra Cuteness */}
        <g transform="translate(142, 60) rotate(15)">
          <path
            d="M8 0 C14 0, 18 6, 16 14 C14 20, 8 22, 8 22 C8 22, 2 20, 0 14 C-2 6, 2 0, 8 0 Z"
            fill="#FF5C9A"
            stroke="#1A1A1A"
            strokeWidth="2.5"
          />
          <path d="M8 -2 L6 -6 L10 -6 Z" fill="#4ADE80" stroke="#1A1A1A" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
};

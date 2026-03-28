"use client";

interface RupeLogoProps {
  size?: number;
}

export default function RupeLogo({ size = 80 }: RupeLogoProps) {
  const scale = size / 180;
  const svgSize = 180 * scale;

  return (
    <div style={{
      width: size, height: size,
      backgroundColor: "#1A2B1A",
      borderRadius: size * 0.22,
      border: "1.5px solid #2D5A2D",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}>
      <svg
        width={svgSize} height={svgSize}
        viewBox="0 0 180 180"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Espina */}
        <line x1="44" y1="38" x2="44" y2="142"
          stroke="#3B6D11" strokeWidth="8" strokeLinecap="round" />

        {/* Arco R */}
        <path
          d="M44 38 Q44 84 66 84 L88 84 Q114 84 114 102 Q114 120 88 120 L44 120"
          stroke="#63B528" strokeWidth="16"
          strokeLinecap="round" strokeLinejoin="round"
          fill="none"
        />

        {/* Círculo bowl */}
        <circle cx="88" cy="102" r="18"
          stroke="#63B528" strokeWidth="16"
          fill="none"
          transform="rotate(-90 88 102)"
        />

        {/* Diagonal ámbar */}
        <line x1="101" y1="114" x2="134" y2="152"
          stroke="#EF9F27" strokeWidth="16" strokeLinecap="round" />

        {/* Punto verde */}
        <circle cx="44" cy="84" r="5" fill="#63B528" />

        {/* Punto morado Premium */}
        <circle cx="44" cy="102" r="3.5" fill="#7F77DD" opacity="0.85" />
      </svg>
    </div>
  );
}

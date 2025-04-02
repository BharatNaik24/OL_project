import { useState } from "react";
import "../App.css";

const RadarComponent = () => {
  const [checkEnemies, setCheckEnemies] = useState(false);
  const [checkFriendly, setCheckFriendly] = useState(false);

  const generateRandomPoints = (count, radius) => {
    return Array.from({ length: count }, () => {
      const angle = Math.random() * 2 * Math.PI;
      const r = Math.sqrt(Math.random()) * radius;
      const x = 160 + r * Math.cos(angle);
      const y = 160 + r * Math.sin(angle);
      return { x, y };
    });
  };

  const enemies = generateRandomPoints(5, 140);
  const friendlies = generateRandomPoints(5, 140);

  return (
    <div className="flex flex-col justify-center items-center mb-5">
      <svg width={320} height={320}>
        <rect
          height={300}
          width={300}
          x="10"
          y="10"
          rx="20"
          ry="20"
          style={{
            fill: "#010f02",
            stroke: "#58a399",
            strokeWidth: 3,
            opacity: 1,
          }}
        />
        <path
          d="M 100,33 Q 160,11 190,24 L 160,160 Z"
          style={{ fill: "#147b18", stroke: "none" }}
          className="rotating-line"
        />

        <line
          className="rotating-line"
          x1="190"
          y1="23"
          x2="160"
          y2="160"
          style={{ stroke: "#00ec33", strokeWidth: 1.5 }}
        />

        {[140, 110, 80, 50, 30, 10].map((r, index) => (
          <circle
            key={index}
            r={r}
            cx="160"
            cy="160"
            style={{
              fill: "transparent",
              stroke: "#fff",
              strokeWidth: 1.8,
              opacity: 1,
            }}
          />
        ))}

        <circle
          r="2"
          cx="160"
          cy="160"
          style={{
            fill: "#00ec33",
            stroke: "#00ec33",
            strokeWidth: 1,
            opacity: 1,
          }}
        />

        <g stroke="white" strokeWidth="1">
          <line x1="160" y1="160" x2="300" y2="160" />
          <line x1="160" y1="160" x2="259" y2="61" />
          <line x1="160" y1="160" x2="160" y2="20" />
          <line x1="160" y1="160" x2="61" y2="61" />
          <line x1="160" y1="160" x2="20" y2="160" />
          <line x1="160" y1="160" x2="61" y2="259" />
          <line x1="160" y1="160" x2="160" y2="300" />
          <line x1="160" y1="160" x2="259" y2="259" />
        </g>

        {checkEnemies &&
          enemies.map((dot, i) => (
            <circle
              key={`enemy-${i}`}
              cx={dot.x}
              cy={dot.y}
              r="4"
              style={{ fill: "#ff0000", stroke: "#ff0000" }}
            />
          ))}

        {checkFriendly &&
          friendlies.map((dot, i) => (
            <circle
              key={`friendly-${i}`}
              cx={dot.x}
              cy={dot.y}
              r="4"
              style={{ fill: "#0088ff", stroke: "#0088ff" }}
            />
          ))}
      </svg>

      <div className="flex gap-5 flex-row items-center !bg-black px-2 py-3 rounded-xl">
        <div className="!gap-2 flex flex-row items-center">
          <input
            id="enemy"
            type="checkbox"
            onChange={() => setCheckEnemies(!checkEnemies)}
          />
          <label htmlFor="enemy" className="text-white">
            Check Enemies
          </label>
        </div>
        <div className="!gap-2 flex flex-row items-center">
          <input
            id="friendly"
            type="checkbox"
            onChange={() => setCheckFriendly(!checkFriendly)}
          />
          <label htmlFor="friendly" className="text-white">
            Check Friendly
          </label>
        </div>
      </div>
    </div>
  );
};

export default RadarComponent;

import React from "react";
import { View } from "react-native";
import Svg, { Polyline, Polygon, Circle, Line, Text as SvgText } from "react-native-svg";
import { COLORS } from "@/constants/theme";

interface LineChartProps {
  data:     number[];
  width:    number;
  height?:  number;
  color?:   string;
  showDots?: boolean;
  showGrid?: boolean;
}

export function LineChart({
  data,
  width,
  height   = 80,
  color    = COLORS.primary,
  showDots = true,
  showGrid = false,
}: LineChartProps) {
  if (!data || data.length < 2) return null;

  const padX = 8;
  const padY = 8;
  const chartW = width  - padX * 2;
  const chartH = height - padY * 2;
  const maxVal = Math.max(...data, 1);

  const pts = data.map((v, i) => ({
    x: padX + (i / (data.length - 1)) * chartW,
    y: padY + chartH - (v / maxVal) * chartH,
  }));

  const lineStr = pts.map((p) => `${p.x},${p.y}`).join(" ");

  // Closed polygon for the fill area
  const areaStr = [
    `${pts[0].x},${padY + chartH}`,
    ...pts.map((p) => `${p.x},${p.y}`),
    `${pts[pts.length - 1].x},${padY + chartH}`,
  ].join(" ");

  return (
    <Svg width={width} height={height}>
      {/* Area fill */}
      <Polygon points={areaStr} fill={color} fillOpacity={0.12} stroke="none" />
      {/* Line */}
      <Polyline
        points={lineStr}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dots */}
      {showDots &&
        pts.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
        ))}
    </Svg>
  );
}

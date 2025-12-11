export const generateId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

export const calculateBezier = (start, end) => {
  const dist = Math.abs(end.x - start.x) * 0.5;
  return `M ${start.x} ${start.y} C ${start.x + dist} ${start.y}, ${
    end.x - dist
  } ${end.y}, ${end.x} ${end.y}`;
};

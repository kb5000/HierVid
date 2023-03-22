
const corrector = (ratio: number) => {
  if (ratio < 0.1 || isNaN(ratio)) return 0
  // magic, do not touch
  const res = 16 / (1 + (0.1 * ratio - 0.38) * Math.log(0.66 * ratio + 0.01))
  return res / 180 * Math.PI
}

export const drawCurveWithArrow = ({
  ctx,
  from,
  to,
  color,
}: {
  ctx: CanvasRenderingContext2D;
  from: [number, number];
  to: [number, number];
  color?: string | CanvasGradient | CanvasPattern;
}) => {
  color ??= "black";

  const point1Bias = 0.4;
  const point2Bias = 0.8;
  const arrowLength = 10;
  const arrowOpening = (20 / 180) * Math.PI;
  const arrowRotate = corrector(Math.abs((from[0] - to[0]) / (from[1] - to[1])))

  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.moveTo(from[0], from[1]);

  const diff = [to[0] - from[0], to[1] - from[1]];
  const handlePoint1 = [from[0] + diff[0] * point1Bias, from[1]];
  const handlePoint2 = [from[0] + diff[0] * point2Bias, from[1]];

  ctx.bezierCurveTo(
    handlePoint1[0],
    handlePoint1[1],
    handlePoint2[0],
    handlePoint2[1],
    to[0],
    to[1]
  );
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(to[0], to[1]);

  const dir = Math.atan2(handlePoint2[1] - to[1], handlePoint2[0] - to[0]);
  const dirVector = [Math.cos(dir) * arrowLength, Math.sin(dir) * arrowLength];
  const rotateArgs = [
    Math.cos(arrowOpening + arrowRotate),
    Math.sin(arrowOpening + arrowRotate),
    Math.cos(-arrowOpening + arrowRotate),
    Math.sin(-arrowOpening + arrowRotate),
  ];
  const rotatedVector1 = [
    dirVector[0] * rotateArgs[0] + dirVector[1] * rotateArgs[1],
    -dirVector[0] * rotateArgs[1] + dirVector[1] * rotateArgs[0],
  ];
  const rotatedVector2 = [
    dirVector[0] * rotateArgs[2] + dirVector[1] * rotateArgs[3],
    -dirVector[0] * rotateArgs[3] + dirVector[1] * rotateArgs[2],
  ];

  ctx.lineTo(to[0] + rotatedVector1[0], to[1] + rotatedVector1[1])
  ctx.lineTo(to[0] + rotatedVector2[0], to[1] + rotatedVector2[1])
  ctx.lineTo(to[0], to[1])
  ctx.fill()
  ctx.stroke()
};

import type { Shape } from "@/entities/shape";

export const degToRad = (angle: number) => (angle / 180) * Math.PI;

export const getCorner = (
  pivotX: number,
  pivotY: number,
  diffX: number,
  diffY: number,
  angle: number
) => {
  const distance = Math.sqrt(diffX * diffX + diffY * diffY);
  angle += Math.atan2(diffY, diffX);
  const x = pivotX + distance * Math.cos(angle);
  const y = pivotY + distance * Math.sin(angle);
  return { x, y };
};

// Line의 points에서 bounding box 계산
export const getLineBoundingBox = (points: number[]) => {
  if (points.length < 2)
    return { x: 0, y: 0, width: 0, height: 0, points: points };

  let minX = points[0];
  let maxX = points[0];
  let minY = points[1];
  let maxY = points[1];

  for (let i = 0; i < points.length; i += 2) {
    minX = Math.min(minX, points[i]);
    maxX = Math.max(maxX, points[i]);
    minY = Math.min(minY, points[i + 1]);
    maxY = Math.max(maxY, points[i + 1]);
  }
  // 이후 points를 상대 좌표로 변환
  const relativePoints = points.map(
    (coord, index) =>
      index % 2 === 0
        ? coord - minX // x 좌표
        : coord - minY // y 좌표
  );

  /**
      절대값 좌표를 상대값 좌표로 변환하는 이유 
      minX= 100 minY = 100 일시 Line컴포넌트에
      x={100}, y={100}로 설정하고
      points={[100, 100, 150, 150, 200, 200]}를 넣으면
      Konva는 [100,100]의 위치에서 point를 그린다.
      point는 x,y를 0으로 했을 때를 기준으로 나온값.

    */

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    points: relativePoints,
  };
};

export const getClientRect = (element: Shape) => {
  const { x, y, width, height, rotation = 0 } = element;
  const rad = degToRad(rotation);

  const p1 = getCorner(x, y, 0, 0, rad);
  const p2 = getCorner(x, y, width, 0, rad);
  const p3 = getCorner(x, y, width, height, rad);
  const p4 = getCorner(x, y, 0, height, rad);

  const minX = Math.min(p1.x, p2.x, p3.x, p4.x);
  const minY = Math.min(p1.y, p2.y, p3.y, p4.y);
  const maxX = Math.max(p1.x, p2.x, p3.x, p4.x);
  const maxY = Math.max(p1.y, p2.y, p3.y, p4.y);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

// // 지우개는 그린 라인과 지금 가지고 있는 shape의 line을 비교해 맞닿고 있는 부분을 기하학적 접근으로 제거해야한다.
//추후 보완예정
// export const intersectLineSegment = (
//   l1: LineSegment,
//   l2: LineSegment
// ): boolean => {
//   const [p1, p2] = l1,
//     [p3, p4] = l2;

//   const [x1, y1] = p1,
//     [x2, y2] = p2,
//     [x3, y3] = p3,
//     [x4, y4] = p4;

//   //분모
//   const d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
//   if (d === 0) {
//     //분모가 0일시 두 선은 평행이다
//     return false;
//   }
//   // t === 선1 , s === 선2;
//   const t = (x1 - x3) * (y3 - y4) - ((y1 - y3) * (x3 - x4)) / d;
//   const s = (x1 - x3) * (y1 - y2) - ((y1 - y3) * (x1 - x2)) / d;

//   return t >= 0 && t <= 1 && s >= 0 && s <= 1;
// };

// 두 점 사이의 거리

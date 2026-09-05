// Спільні константи й малювання бульбашок.
import OBR, { buildShape, isImage } from "@owlbear-rodeo/sdk";

export const ID = "com.nikita.bulbashky";
export const META = `${ID}/state`;   // {count, color} — лежить у метаданих токена
export const BUBBLE = `${ID}/bubble`; // позначка на самих бульбашках

export const MAX = 7;

export const COLORS = [
  { name: "Бузковий", value: "#a78bfa" },
  { name: "Зелений", value: "#4ade80" },
  { name: "Жовтий", value: "#facc15" },
  { name: "Червоний", value: "#f87171" },
  { name: "Блакитний", value: "#38bdf8" },
  { name: "Рожевий", value: "#f472b6" },
  { name: "Білий", value: "#f5f5f5" },
];

export const DEFAULT_COLOR = COLORS[0].value;

// Перемалювати бульбашки для одного токена
export async function redraw(tokenId) {
  const items = await OBR.scene.items.getItems([tokenId]);
  const token = items[0];
  if (!token) return;

  const state = token.metadata[META];
  const count = Math.min(Math.max(state?.count ?? 0, 0), MAX);
  const color = state?.color ?? DEFAULT_COLOR;

  // прибираємо попередні бульбашки цього токена
  const old = await OBR.scene.items.getItems(
    (i) => i.metadata[BUBBLE] === tokenId
  );
  if (old.length) await OBR.scene.items.deleteItems(old.map((i) => i.id));

  if (count < 1) return;

  // розмір і розкидка беремо з габаритів токена
  const bounds = await OBR.scene.items.getItemBounds([tokenId]);
  const unit = Math.max(bounds.width, bounds.height);

  const shapes = [];
  for (let i = 0; i < count; i++) {
    const spot = LAYOUT[i];
    const r = unit * 0.075 * spot.s;
    const cx = bounds.center.x + unit * spot.x;
    const cy = bounds.min.y + unit * spot.y;

    // сама бульбашка — прозора, зі світлим обідком
    shapes.push(
      bubble(tokenId, cx - r, cy - r, r * 2, {
        fillColor: color,
        fillOpacity: 0.28,
        strokeColor: color,
        strokeWidth: Math.max(1, r * 0.16),
        strokeOpacity: 0.95,
      })
    );

    // відблиск угорі зліва — те, що робить її мильною
    const hr = r * 0.3;
    shapes.push(
      bubble(tokenId, cx - r * 0.52 - hr, cy - r * 0.52 - hr, hr * 2, {
        fillColor: "#ffffff",
        fillOpacity: 0.85,
        strokeColor: "#ffffff",
        strokeWidth: 0,
        strokeOpacity: 0,
      })
    );
  }

  await OBR.scene.items.addItems(shapes);
}

// Розкидка бульбашок навколо токена: зсув від центру, висота, множник розміру.
// Порядок такий, щоб кожна наступна доповнювала купку, а не ставала в ряд.
const LAYOUT = [
  { x: -0.10, y: -0.30, s: 1.45 },
  { x:  0.26, y: -0.52, s: 1.00 },
  { x: -0.40, y: -0.60, s: 0.72 },
  { x:  0.05, y: -0.72, s: 0.55 },
  { x:  0.42, y: -0.24, s: 0.62 },
  { x: -0.30, y: -0.16, s: 0.45 },
  { x:  0.22, y: -0.88, s: 0.38 },
];

function bubble(tokenId, x, y, size, style) {
  return buildShape()
    .shapeType("CIRCLE")
    .width(size)
    .height(size)
    .position({ x, y })
    .fillColor(style.fillColor)
    .fillOpacity(style.fillOpacity)
    .strokeColor(style.strokeColor)
    .strokeWidth(style.strokeWidth)
    .strokeOpacity(style.strokeOpacity)
    .attachedTo(tokenId)
    .locked(true)
    .disableHit(true)
    .disableAttachmentBehavior(["SCALE", "ROTATION"])
    .layer("ATTACHMENT")
    .metadata({ [BUBBLE]: tokenId })
    .build();
}

export { isImage };

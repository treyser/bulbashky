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

  // розмір беремо з габаритів токена, щоб бульбашки пасували до масштабу
  const bounds = await OBR.scene.items.getItemBounds([tokenId]);
  const r = Math.max(bounds.width, bounds.height) * 0.09;
  const gap = r * 2.4;

  // ряд над токеном, по центру
  const totalWidth = gap * (count - 1);
  const startX = bounds.center.x - totalWidth / 2;
  const y = bounds.min.y - r * 2;

  const shapes = [];
  for (let i = 0; i < count; i++) {
    shapes.push(
      buildShape()
        .shapeType("CIRCLE")
        .width(r * 2)
        .height(r * 2)
        .position({ x: startX + gap * i, y })
        .fillColor(color)
        .fillOpacity(0.9)
        .strokeColor("#0a0a0a")
        .strokeWidth(Math.max(1, r * 0.18))
        .strokeOpacity(0.7)
        .attachedTo(tokenId)   // їздить разом із токеном
        .locked(true)
        .disableHit(true)      // не заважає клікати по токену
        .disableAttachmentBehavior(["SCALE", "ROTATION"])
        .layer("ATTACHMENT")
        .metadata({ [BUBBLE]: tokenId })
        .build()
    );
  }

  await OBR.scene.items.addItems(shapes);
}

export { isImage };

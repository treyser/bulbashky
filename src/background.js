// Реєструє пункт контекстного меню. Вантажиться при відкритті кімнати.
import OBR from "@owlbear-rodeo/sdk";
import { ID, META, MAX, redraw } from "./common.js";

// Vite підставляє сюди base з конфіга — /bulbashky/
const BASE = import.meta.env.BASE_URL;
const url = (path) => new URL(BASE + path, window.location.origin).href;

OBR.onReady(() => {
  OBR.contextMenu.create({
    id: `${ID}/menu`,
    icons: [
      {
        icon: url("icon.svg"),
        label: "Сп'яніння",
        // тільки для зображень-персонажів на шарі CHARACTER
        filter: {
          every: [
            { key: "type", value: "IMAGE" },
            { key: "layer", value: "CHARACTER" },
          ],
        },
      },
    ],
    embed: { url: url("index.html"), height: 210 },
  });

  // якщо токен видалили — прибираємо його бульбашки
  OBR.scene.items.onChange(async (items) => {
    const alive = new Set(items.map((i) => i.id));
    const orphans = items.filter((i) => {
      const owner = i.metadata[`${ID}/bubble`];
      return owner && !alive.has(owner);
    });
    if (orphans.length) {
      await OBR.scene.items.deleteItems(orphans.map((i) => i.id));
    }
  });
});

export { META, MAX, redraw };

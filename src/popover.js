import "./style.css";
import OBR from "@owlbear-rodeo/sdk";
import { META, MAX, COLORS, DEFAULT_COLOR, redraw } from "./common.js";

const $ = (id) => document.getElementById(id);

let targets = [];   // виділені токени
let count = 0;
let color = DEFAULT_COLOR;

OBR.onReady(init);

async function init() {
  drawSwatches();

  targets = (await OBR.player.getSelection()) ?? [];
  await load();

  $("plus").addEventListener("click", () => set(count + 1));
  $("minus").addEventListener("click", () => set(count - 1));
  $("clear").addEventListener("click", () => set(0));

  // якщо змінили виділення, не закриваючи меню
  OBR.player.onChange(async (p) => {
    const next = p.selection ?? [];
    if (next.join() === targets.join()) return;
    targets = next;
    await load();
  });
}

async function load() {
  if (!targets.length) return render();
  const items = await OBR.scene.items.getItems(targets);
  const state = items[0]?.metadata[META];
  count = Math.min(Math.max(state?.count ?? 0, 0), MAX);
  color = state?.color ?? DEFAULT_COLOR;
  render();
}

async function set(next) {
  count = Math.min(Math.max(next, 0), MAX);
  render();
  await save();
}

async function pick(value) {
  color = value;
  render();
  await save();
}

async function save() {
  if (!targets.length) return;

  await OBR.scene.items.updateItems(targets, (items) => {
    for (const item of items) {
      item.metadata[META] = { count, color };
    }
  });

  // перемальовуємо бульбашки кожному виділеному токену
  for (const id of targets) await redraw(id);
}

function render() {
  $("count").textContent = count;
  $("plus").disabled = count >= MAX || !targets.length;
  $("minus").disabled = count <= 0 || !targets.length;
  $("clear").disabled = count === 0 || !targets.length;

  document.querySelectorAll(".sw").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.value === color))
  );
}

function drawSwatches() {
  const box = $("colors");
  for (const c of COLORS) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "sw";
    b.dataset.value = c.value;
    b.style.background = c.value;
    b.title = c.name;
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", () => pick(c.value));
    box.appendChild(b);
  }
}

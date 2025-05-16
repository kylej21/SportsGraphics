// customlevel.js
const gridSize = 5;
const grid = [];

const selectorOptions = [
  { label: "Green (0)", value: "0" },
  { label: "Start (S)", value: "S" },
  { label: "Hole (X)", value: "X" },
  { label: "Corner (C)", value: "C" },
  { label: "Wall: L", value: "L" },
  { label: "Wall: R", value: "R" },
  { label: "Wall: T", value: "T" },
  { label: "Wall: B", value: "B" },
  { label: "Wall: LT", value: "LT" },
  { label: "Wall: LTB", value: "LTB" },
  { label: "Wall: LR", value: "LR" },
  { label: "Wall: TR", value: "TR" },
  { label: "Wall: RTB", value: "RTB" },
  { label: "Wall: LRTB", value: "LRTB" },
];

function createTileSelector() {
  const selector = document.createElement("select");
  selector.id = "tile-selector";
  selectorOptions.forEach(({ label, value }) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    selector.appendChild(option);
  });
  return selector;
}

function createEditor(rows = gridSize, cols = gridSize) {
  const existing = document.getElementById("editor-container");
  if (existing) existing.remove();

  let container = document.getElementById("editor-container");
  if (container) {
    container.innerHTML = ""; // Clear previous content
  } else {
    container = document.createElement("div");
    container.id = "editor-container";
    document.body.appendChild(container);
  }

  const table = document.createElement("table");
  table.id = "level-editor";

  const selector = createTileSelector();
  container.appendChild(selector);

  for (let z = 0; z < rows; z++) {
    const row = document.createElement("tr");
    grid[z] = [];
    for (let x = 0; x < cols; x++) {
      const cell = document.createElement("td");
      cell.textContent = "0";
      grid[z][x] = "0";
      cell.className = "editor-cell";
      cell.addEventListener("click", () => {
        const val = selector.value;
        grid[z][x] = val;
        cell.textContent = val;
      });
      row.appendChild(cell);
    }
    table.appendChild(row);
  }

  container.appendChild(table);

  const playBtn = document.createElement("button");
  playBtn.textContent = "Play Custom Level";
  playBtn.setAttribute("data-level", "custom");
  playBtn.classList.add("level-btn");
  playBtn.addEventListener("click", () => {
    window.customlevel = grid; // Set the global
    const editor = document.getElementById("editor-container");
    if (editor) editor.remove();
  });

  container.appendChild(playBtn);
  window.setupLevelButtons?.();

  // ✅ Hide splash so the editor is visible
  const splash = document.getElementById("splash-overlay");
  if (splash) splash.style.display = "none";

  container.style.position = "absolute";
  container.style.top = "20px";
  container.style.left = "20px";
  container.style.zIndex = "9999";
  container.style.backgroundColor = "white";
  container.style.padding = "10px";
  container.style.border = "1px solid black";
  document.body.appendChild(container);
}

window.initCustomLevelEditor = createEditor;

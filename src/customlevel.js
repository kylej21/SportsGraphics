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

function createRulesPanel() {
  const rules = document.createElement("div");
  rules.id = "rules-panel";

  rules.innerHTML = `
    <h2>Level Design Rules</h2>
    <ul>
      <li>Each level must have exactly one <strong>Start (S)</strong> and one <strong>Hole (X)</strong>.</li>
      <li>Walls:
        <ul>
          <li><strong>L</strong> = Left</li>
          <li><strong>R</strong> = Right</li>
          <li><strong>T</strong> = Top</li>
          <li><strong>B</strong> = Bottom</li>
          <li>Combinations (e.g., <code>RB</code>, <code>LRTB</code>) are allowed.</li>
        </ul>
      </li>
      <li>Any tile with a wall becomes <strong>tall grass</strong> instead of golf green.</li>
      <li>Use <strong>C</strong> for corner decoration, and <strong>0</strong> for plain grass tiles.</li>
    </ul>
  `;
  const backBtn = document.createElement("button");
  backBtn.textContent = "Back to Menu";
  backBtn.style.marginTop = "2rem";
  backBtn.style.width = "250px";
  backBtn.style.height = "50px";
  backBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  e.preventDefault();

  const splash = document.getElementById("splash-overlay");
  if (splash) splash.style.display = "flex";

  const editor = document.getElementById("editor-overlay");
  if (editor) editor.remove();

  
});

  rules.appendChild(backBtn);
  return rules;
}

function createEditor(rows = gridSize, cols = gridSize) {
  const existingOverlay = document.getElementById("editor-overlay");
  if (existingOverlay) existingOverlay.remove();

  const overlay = document.createElement("div");
  overlay.id = "editor-overlay";
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.backdropFilter = "blur(3px)";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = "9999";

  const container = document.createElement("div");
  container.id = "editor-container";

  const columns = document.createElement("div");
  columns.id = "editor-columns";

  const rulesPanel = createRulesPanel();

  const editorPanel = document.createElement("div");
  editorPanel.id = "editor-panel";

  const selector = createTileSelector();
  editorPanel.appendChild(selector);

  const table = document.createElement("table");
  table.id = "level-editor";

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

  editorPanel.appendChild(table);

  const playBtn = document.createElement("button");
  playBtn.textContent = "Play Custom Level";
  playBtn.setAttribute("data-level", "custom");
  playBtn.classList.add("level-btn");
  playBtn.style.width = "250px";
  playBtn.style.height = "50px";
  playBtn.addEventListener("click", () => {
    window.customlevel = grid;
    overlay.remove();
  });

  editorPanel.appendChild(playBtn);

  columns.appendChild(rulesPanel);
  columns.appendChild(editorPanel);
  container.appendChild(columns);
  overlay.appendChild(container);
  document.body.appendChild(overlay);

  window.setupLevelButtons?.();

  const splash = document.getElementById("splash-overlay");
  if (splash) splash.style.display = "none";
}

window.initCustomLevelEditor = createEditor;

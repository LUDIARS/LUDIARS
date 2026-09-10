import {
  CATEGORY_DEFINITIONS,
  PUBLIC_SERVICE_GRAPH,
  RELATION_LABELS,
} from "../data/public-service-graph.js";

const canvas = document.getElementById("service-graph");
const context = canvas.getContext("2d");
const searchInput = document.getElementById("service-search");
const categoryFilters = document.getElementById("category-filters");
const graphSummary = document.getElementById("graph-summary");
const selectionDetail = document.getElementById("selection-detail");
const relationshipRows = document.getElementById("relationship-rows");
const serviceList = document.getElementById("service-list");

const nodesById = new Map(PUBLIC_SERVICE_GRAPH.nodes.map((node) => [node.id, node]));
const categoriesById = new Map(CATEGORY_DEFINITIONS.map((category) => [category.id, category]));
const state = {
  activeCategories: new Set(CATEGORY_DEFINITIONS.map((category) => category.id)),
  query: "",
  selectedId: null,
};
let nodePositions = new Map();

function githubUrl(node) {
  return "https://github.com/LUDIARS/" + encodeURIComponent(node.id);
}

function categoryNodes(categoryId) {
  return PUBLIC_SERVICE_GRAPH.nodes.filter((node) => node.category === categoryId);
}

function isVisible(node) {
  if (!state.activeCategories.has(node.category)) return false;
  const query = state.query.trim().toLowerCase();
  return !query || node.id.toLowerCase().includes(query) || node.code.toLowerCase().includes(query);
}

function visibleNodes() {
  return PUBLIC_SERVICE_GRAPH.nodes.filter(isVisible);
}

function visibleEdges() {
  const ids = new Set(visibleNodes().map((node) => node.id));
  return PUBLIC_SERVICE_GRAPH.edges.filter(([from, to]) => ids.has(from) && ids.has(to));
}

function relatedIds() {
  if (!state.selectedId) return null;
  const related = new Set([state.selectedId]);
  for (const [from, to] of visibleEdges()) {
    if (from === state.selectedId) related.add(to);
    if (to === state.selectedId) related.add(from);
  }
  return related;
}

function renderCategoryFilters() {
  categoryFilters.textContent = "";
  const legend = document.createElement("legend");
  legend.textContent = "カテゴリ";
  categoryFilters.appendChild(legend);

  for (const category of CATEGORY_DEFINITIONS) {
    const label = document.createElement("label");
    label.className = "category-filter";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = state.activeCategories.has(category.id);
    input.addEventListener("change", () => {
      if (input.checked) state.activeCategories.add(category.id);
      else state.activeCategories.delete(category.id);
      if (state.selectedId && !isVisible(nodesById.get(state.selectedId))) state.selectedId = null;
      render();
    });

    const swatch = document.createElement("span");
    swatch.className = "swatch";
    swatch.style.backgroundColor = category.color;
    const text = document.createTextNode(category.label);
    label.append(input, swatch, text);
    categoryFilters.appendChild(label);
  }
}

function resizeCanvas() {
  const maxNodes = Math.max(...CATEGORY_DEFINITIONS.map((category) => categoryNodes(category.id).length));
  const cssHeight = Math.max(620, 180 + maxNodes * 48);
  const cssWidth = Math.max(canvas.clientWidth, 320);
  const pixelRatio = window.devicePixelRatio || 1;
  canvas.style.height = cssHeight + "px";
  canvas.width = Math.round(cssWidth * pixelRatio);
  canvas.height = Math.round(cssHeight * pixelRatio);
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  return { width: cssWidth, height: cssHeight };
}

function layoutNodes(width) {
  const padding = 48;
  const columnWidth = (width - padding * 2) / CATEGORY_DEFINITIONS.length;
  const positions = new Map();
  for (const [column, category] of CATEGORY_DEFINITIONS.entries()) {
    const x = padding + columnWidth * (column + 0.5);
    categoryNodes(category.id).forEach((node, row) => {
      positions.set(node.id, { x, y: 120 + row * 48 });
    });
  }
  return positions;
}

function drawArrow(from, to, color, highlighted) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  if (!length) return;
  const radius = 14;
  const start = { x: from.x + dx / length * radius, y: from.y + dy / length * radius };
  const end = { x: to.x - dx / length * radius, y: to.y - dy / length * radius };
  context.save();
  context.strokeStyle = color;
  context.fillStyle = color;
  context.globalAlpha = highlighted ? 0.92 : 0.22;
  context.lineWidth = highlighted ? 2.3 : 1;
  context.setLineDash(highlighted ? [] : [3, 5]);
  context.beginPath();
  context.moveTo(start.x, start.y);
  context.lineTo(end.x, end.y);
  context.stroke();
  context.setLineDash([]);
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  context.beginPath();
  context.moveTo(end.x, end.y);
  context.lineTo(end.x - 7 * Math.cos(angle - Math.PI / 6), end.y - 7 * Math.sin(angle - Math.PI / 6));
  context.lineTo(end.x - 7 * Math.cos(angle + Math.PI / 6), end.y - 7 * Math.sin(angle + Math.PI / 6));
  context.closePath();
  context.fill();
  context.restore();
}

function drawGraph() {
  const { width, height } = resizeCanvas();
  nodePositions = layoutNodes(width);
  const nodes = visibleNodes();
  const edges = visibleEdges();
  const related = relatedIds();

  context.clearRect(0, 0, width, height);
  context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--canvas").trim();
  context.fillRect(0, 0, width, height);

  for (const [column, category] of CATEGORY_DEFINITIONS.entries()) {
    const columnWidth = (width - 96) / CATEGORY_DEFINITIONS.length;
    const x = 48 + column * columnWidth;
    context.save();
    context.fillStyle = category.color + "1a";
    context.strokeStyle = category.color + "66";
    context.lineWidth = 1;
    context.beginPath();
    context.roundRect(x, 40, columnWidth - 14, height - 72, 12);
    context.fill();
    context.stroke();
    context.fillStyle = category.color;
    context.font = "700 13px system-ui, sans-serif";
    context.fillText(category.label, x + 14, 67);
    context.restore();
  }

  for (const [from, to, kind] of edges) {
    const isHighlighted = !related || (from === state.selectedId || to === state.selectedId);
    drawArrow(nodePositions.get(from), nodePositions.get(to), relationColor(kind), isHighlighted);
  }

  for (const node of nodes) {
    const position = nodePositions.get(node.id);
    const category = categoriesById.get(node.category);
    const isRelated = !related || related.has(node.id);
    const isSelected = state.selectedId === node.id;
    context.save();
    context.globalAlpha = isRelated ? 1 : 0.22;
    context.fillStyle = category.color;
    context.strokeStyle = isSelected ? "#ffffff" : category.color;
    context.lineWidth = isSelected ? 4 : 1.5;
    context.beginPath();
    context.arc(position.x, position.y, isSelected ? 13 : 11, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--ink").trim();
    context.font = "700 11px system-ui, sans-serif";
    context.textAlign = "center";
    context.fillText(node.id, position.x, position.y + 27);
    context.font = "10px ui-monospace, monospace";
    context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--muted").trim();
    context.fillText(node.code, position.x, position.y - 19);
    context.restore();
  }
}

function relationColor(kind) {
  const colors = {
    auth: "#538d9f",
    call: "#3969a8",
    lib: "#8767aa",
    notify: "#ad6a31",
    ops: "#2f8f6f",
  };
  return colors[kind] || "#687b8a";
}

function renderSummary() {
  graphSummary.textContent = visibleNodes().length + " サービス · " + visibleEdges().length + " 関係を表示中";
}

function renderSelection() {
  const selected = state.selectedId ? nodesById.get(state.selectedId) : null;
  if (!selected) {
    selectionDetail.textContent = "ノードを選択すると、直接の関係を表示します。";
    return;
  }
  const count = visibleEdges().filter(([from, to]) => from === selected.id || to === selected.id).length;
  selectionDetail.textContent = selected.id + " (" + selected.code + ") と直接つながる公開関係: " + count + " 件";
}

function renderServices() {
  serviceList.textContent = "";
  for (const category of CATEGORY_DEFINITIONS) {
    const group = document.createElement("li");
    group.className = "service-group";
    const title = document.createElement("h3");
    title.textContent = category.label;
    group.appendChild(title);
    const list = document.createElement("ul");
    for (const node of categoryNodes(category.id)) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = githubUrl(node);
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = node.id + " (" + node.code + ")";
      item.appendChild(link);
      list.appendChild(item);
    }
    group.appendChild(list);
    serviceList.appendChild(group);
  }
}

function renderRelationships() {
  relationshipRows.textContent = "";
  for (const [from, to, kind] of visibleEdges()) {
    const row = document.createElement("tr");
    for (const id of [from, to]) {
      const cell = document.createElement("td");
      const link = document.createElement("a");
      link.href = githubUrl(nodesById.get(id));
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = id;
      cell.appendChild(link);
      row.appendChild(cell);
    }
    const kindCell = document.createElement("td");
    kindCell.textContent = RELATION_LABELS[kind];
    row.appendChild(kindCell);
    relationshipRows.appendChild(row);
  }
}

function render() {
  renderSummary();
  renderSelection();
  renderRelationships();
  drawGraph();
}

canvas.addEventListener("click", (event) => {
  const bounds = canvas.getBoundingClientRect();
  const x = event.clientX - bounds.left;
  const y = event.clientY - bounds.top;
  const hit = visibleNodes().find((node) => {
    const position = nodePositions.get(node.id);
    return position && Math.hypot(position.x - x, position.y - y) <= 18;
  });
  state.selectedId = hit && hit.id !== state.selectedId ? hit.id : null;
  render();
});

searchInput.addEventListener("input", () => {
  state.query = searchInput.value;
  if (state.selectedId && !isVisible(nodesById.get(state.selectedId))) state.selectedId = null;
  render();
});

document.getElementById("reset").addEventListener("click", () => {
  state.activeCategories = new Set(CATEGORY_DEFINITIONS.map((category) => category.id));
  state.query = "";
  state.selectedId = null;
  searchInput.value = "";
  renderCategoryFilters();
  render();
});

new ResizeObserver(drawGraph).observe(canvas);
renderCategoryFilters();
renderServices();
render();

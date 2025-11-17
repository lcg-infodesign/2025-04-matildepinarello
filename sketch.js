let data;
let selectedVolcano = null;
let selectedVolcanoHover = null;

let margin = 60;
let chartW, chartH;

// Variabili per la legenda interattiva
let currentMaxElevation = 7000;
let draggingIndicator = false;

function preload() {
  data = loadTable("data_vulcani.csv", "csv", "header");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Helvetica");

  chartW = width * 0.8;
  chartH = height * 0.8;
}

function draw() {
  background(10);

  push();
  drawMapGrid();
  drawVolcanoes();
  pop();

  if (selectedVolcano !== null) {
    fill(0, 180);
    noStroke();
    rect(0, 0, width, height);
  }

  if (selectedVolcano) {
    drawInfoCard();
  }

  drawLegend();
}

// Disegna reticolo geografico
function drawMapGrid() {
  let mapX = width / 2 - chartW / 2;
  let mapY = height / 2 - chartH / 2;

  stroke(80);
  strokeWeight(1);

  // Linee latitudine ogni 10°
  for (let lat = -90; lat <= 90; lat += 10) {
    let y = map(lat, 90, -90, mapY + margin, mapY + chartH - margin);
    line(mapX + margin, y, mapX + chartW - margin, y);
    noStroke();
    fill(180);
    textSize(10);
    textAlign(RIGHT, CENTER);
    text(lat + "°", mapX + margin - 5, y);
    stroke(80);
  }

  // Linee longitudine ogni 10°
  for (let lon = -180; lon <= 180; lon += 10) {
    let x = map(lon, -180, 180, mapX + margin, mapX + chartW - margin);
    line(x, mapY + margin, x, mapY + chartH - margin);
    noStroke();
    fill(180);
    textSize(10);
    textAlign(CENTER, TOP);
    text(lon + "°", x, mapY + chartH - margin + 5);
    stroke(80);
  }

  // Evidenzia Equatore e Tropici
  stroke(255, 100, 100);
  strokeWeight(1.5);
  let equatorY = map(0, 90, -90, mapY + margin, mapY + chartH - margin);
  line(mapX + margin, equatorY, mapX + chartW - margin, equatorY);

  let tropicCancerY = map(23.5, 90, -90, mapY + margin, mapY + chartH - margin);
  let tropicCapricornY = map(-23.5, 90, -90, mapY + margin, mapY + chartH - margin);
  line(mapX + margin, tropicCancerY, mapX + chartW - margin, tropicCancerY);
  line(mapX + margin, tropicCapricornY, mapX + chartW - margin, tropicCapricornY);

  // Titolo e sottotitolo
  noStroke();
  fill(255);
  textSize(28);
  textAlign(CENTER);
  text("Volcanoes of the World", width / 2, mapY - 45);

  textSize(14);
  fill(255);
  textAlign(CENTER);
  text("Select a volcano to learn about it", width / 2, mapY - 1);
}

// Disegna vulcani
function drawVolcanoes() {
  let mapX = width / 2 - chartW / 2;
  let mapY = height / 2 - chartH / 2;

  let closestDist = Infinity;
  let closestIndex = null;
  let closestX, closestY;

  for (let i = 0; i < data.getRowCount(); i++) {
    let lat = parseFloat(data.getString(i, "Latitude"));
    let lon = parseFloat(data.getString(i, "Longitude"));
    let elev = parseFloat(data.getString(i, "Elevation (m)"));

    if (isNaN(lat) || isNaN(lon)) continue;

    // Filtro in base all'altitudine
    if (elev > currentMaxElevation) continue;

    let x = map(lon, -180, 180, mapX + margin, mapX + chartW - margin);
    let y = map(lat, 90, -90, mapY + margin, mapY + chartH - margin);

    let t = map(elev, -6000, 7000, 0, 1);
    let col = lerpColor(color(254, 78, 117), color(57, 145, 300), constrain(t, 0, 1));

    fill(col);
    noStroke();
    ellipse(x, y, 9);

    let d = dist(mouseX, mouseY, x, y);
    if (d < 8 && d < closestDist) {
      closestDist = d;
      closestIndex = i;
      closestX = x;
      closestY = y;
    }
  }

  // Hover
  if (closestIndex !== null && selectedVolcano === null) {
    fill(255, 250, 120);
    ellipse(closestX, closestY, 14);

    let name = data.getString(closestIndex, "Volcano Name");
    fill(255);
    textSize(16);
    textAlign(LEFT, CENTER);
    text(name, closestX + 12, closestY - 8);
  }

  if (closestIndex !== null && selectedVolcano === null) {
    selectedVolcanoHover = { index: closestIndex, x: closestX, y: closestY };
  } else {
    selectedVolcanoHover = null;
  }
}

// Mouse pressed
function mousePressed() {
  let legendWidth = width * 0.8;
  let legendHeight = 10;
  let x = width / 2 - legendWidth / 2;
  let y = height * 0.93;
  let indicatorX = map(currentMaxElevation, -6000, 7000, x, x + legendWidth);

  if (mouseX >= indicatorX - 5 && mouseX <= indicatorX + 5 &&
      mouseY >= y - 5 && mouseY <= y + legendHeight + 5) {
    draggingIndicator = true;
  }

  if (selectedVolcanoHover) {
    let i = selectedVolcanoHover.index;
    selectedVolcano = {
      name: data.getString(i, "Volcano Name"),
      country: data.getString(i, "Country"),
      typeCat: data.getString(i, "TypeCategory"),
      type: data.getString(i, "Type"),
      num: data.getString(i, "Volcano Number"),
      status: data.getString(i, "Status"),
      erup: data.getString(i, "Last Known Eruption"),
      elev: data.getString(i, "Elevation (m)"),
      lat: data.getString(i, "Latitude"),
      lon: data.getString(i, "Longitude")
    };
  }
}

// Mouse dragged per barra
function mouseDragged() {
  if (draggingIndicator) {
    let legendWidth = width * 0.8;
    let x = width / 2 - legendWidth / 2;
    currentMaxElevation = map(constrain(mouseX, x, x + legendWidth), x, x + legendWidth, -6000, 7000);
  }
}

function mouseReleased() {
  draggingIndicator = false;
}

// InfoCard
function drawInfoCard() {
  let w = 380;
  let h = 420;
  let x = width / 2 - w / 2;
  let y = height / 2 - h / 2;

  fill(230,230,250);
  stroke(20);
  strokeWeight(1.5);
  rect(x, y, w, h, 18);

  fill(0);
  noStroke();
  textSize(22);
  textAlign(CENTER);
  text(selectedVolcano.name, x + w / 2, y + 40);

  textSize(15);
  textAlign(LEFT);
  let infoY = y + 80;
  let fields = [
    ["Country", selectedVolcano.country],
    ["Type", selectedVolcano.type],
    ["Category", selectedVolcano.typeCat],
    ["Elevation", selectedVolcano.elev + " m"],
    ["Status", selectedVolcano.status],
    ["Last Eruption", selectedVolcano.erup],
    ["Latitude", selectedVolcano.lat],
    ["Longitude", selectedVolcano.lon],
    ["Volcano ID", selectedVolcano.num]
  ];

  for (let f of fields) {
    text(f[0] + ": " + f[1], x + 25, infoY);
    infoY += 24;
  }

  fill(255);
  rect(x + w / 2 - 60, y + h - 60, 120, 40, 12);
  fill(0);
  textSize(16);
  textAlign(CENTER, CENTER);
  text("Close", x + w / 2, y + h - 40);
}

function mouseClicked() {
  if (selectedVolcano) {
    let w = 380;
    let h = 420;
    let x = width / 2 - w / 2;
    let y = height / 2 - h / 2;

    if (
      mouseX > x + w / 2 - 60 &&
      mouseX < x + w / 2 + 60 &&
      mouseY > y + h - 60 &&
      mouseY < y + h - 20
    ) {
      selectedVolcano = null;
    }
  }
}

// Barra interattiva legenda
function drawLegend() {
  let legendWidth = width * 0.8;
  let legendHeight = 10;
  let x = width / 2 - legendWidth / 2;
  let y = height * 0.93;

  fill(255);
  textSize(18);
  textAlign(CENTER, BOTTOM);
  text("Elevation", width / 2, y - 20);

  for (let i = 0; i < legendWidth; i++) {
    let t = i / legendWidth;
    let col = lerpColor(color(254, 78, 117), color(57, 145, 300), t);
    stroke(col);
    line(x + i, y, x + i, y + legendHeight);
  }

  fill(255);
  textSize(12);
  textAlign(LEFT, TOP);
  text("-6000 m", x, y + legendHeight + 6);
  textAlign(RIGHT, TOP);
  text("+7000 m", x + legendWidth, y + legendHeight + 6);

  // Indicatore sempre visibile
  let indicatorX = map(currentMaxElevation, -6000, 7000, x, x + legendWidth);
  push();
  stroke(255, 255, 0);
  strokeWeight(2);
  line(indicatorX, y - 4, indicatorX, y + legendHeight + 4);
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  chartW = width * 0.8;
  chartH = height * 0.8;
}
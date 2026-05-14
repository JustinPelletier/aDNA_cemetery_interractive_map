const imageWidth = 88.98305084745762;
const imageHeight = 89.1;

const map = L.map("map", {
  crs: L.CRS.Simple,
  minZoom: -2
});

const bounds = [[0, 0], [imageHeight, imageWidth]];

L.imageOverlay("assets/Notre_Dame_Cemetery_PLAN-cropped.svg", bounds).addTo(map);
map.fitBounds(bounds);

function parseTSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split("\t");

  return lines.slice(1).map(line => {
    const values = line.split("\t");
    const row = {};
    headers.forEach((h, i) => {
      row[h.trim()] = values[i]?.trim() || "";
    });
    return row;
  });
}

function haplogroupColor(haplo) {
  const colors = {
    K2a5a1: "#1f77b4",
    H7b: "#ff7f0e",
    T2a1a: "#2ca02c"
  };

  return colors[haplo] || "#555555";
}



function sexColor(sex) {
  const colors = {
    "0": "#6baed6",
    "1": "#fb6a4a",
    "NA": "#999999",
    "": "#999999"
  };

  return colors[sex] || "#999999";
}

function kinshipColor(group) {
  const colors = {
    Group1: "#756bb1",
    Group2: "#31a354",
    Group3: "#e6550d",
    NA: "#999999",
    "": "#999999"
  };

  return colors[group] || "#555555";
}


const markers = [];

fetch("data/samples_test.tsv")
  .then(response => response.text())
  .then(text => {
    const samples = parseTSV(text);

    samples.forEach(sample => {
      const x = Number(sample.X);
      const y = Number(sample.Y);

      const initialColor = getColor(sample, "MT_haplogroup");

      const marker = L.circleMarker([y, x], {
        radius: 12,
        color: initialColor,
        fillColor: initialColor,
        fillOpacity: 0.8,
        weight: 6
      }).addTo(map);

      marker.bindPopup(`
        <strong>${sample.Sample_ID}</strong><br>
        MT haplogroup: ${sample.MT_haplogroup}<br>
        Sex: ${sample.Sex}<br>
        Mean coverage: ${sample.Mean_coverage}<br>
        Kinship group: ${sample.Kinship_group}<br>
        <strong>Stipulated name:</strong> ${sample.Stipulated_name}<br><br>
        ${sample.History}
      `);

      markers.push({ sample, marker });
    });

    setupSearch();
    setupColorMode();
  });

function setupSearch() {
  const input = document.getElementById("searchInput");
  const clearButton = document.getElementById("clearSearch");

  input.addEventListener("input", () => {
    const query = input.value.toLowerCase().trim();

    markers.forEach(({ sample, marker }) => {
      const match =
        sample.Sample_ID.toLowerCase().includes(query) ||
        sample.Stipulated_name.toLowerCase().includes(query);

      marker.setStyle({
        fillOpacity: query === "" || match ? 0.9 : 0.15,
        opacity: query === "" || match ? 1 : 0.25
      });

      if (match && query !== "") {
        marker.bringToFront();
      }
    });
  });

  input.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      const query = input.value.toLowerCase().trim();

      const found = markers.find(({ sample }) =>
        sample.Sample_ID.toLowerCase().includes(query) ||
        sample.Stipulated_name.toLowerCase().includes(query)
      );

      if (found) {
        map.setView(found.marker.getLatLng(), 2);
        found.marker.openPopup();
      }
    }
  });

  clearButton.addEventListener("click", () => {
    input.value = "";
    markers.forEach(({ marker }) => {
      marker.setStyle({
        fillOpacity: 0.9,
        opacity: 1
      });
    });
  });
}



function getColor(sample, mode) {
  if (mode === "MT_haplogroup") {
    return haplogroupColor(sample.MT_haplogroup);
  }

  if (mode === "Sex") {
    return sexColor(sample.Sex);
  }

  if (mode === "Kinship_group") {
    return kinshipColor(sample.Kinship_group);
  }

  return "#555555";
}

function setupColorMode() {
  const colorModeSelect = document.getElementById("colorMode");

  colorModeSelect.addEventListener("change", () => {
    const mode = colorModeSelect.value;

    markers.forEach(({ sample, marker }) => {
      const color = getColor(sample, mode);

      marker.setStyle({
        color: color,
        fillColor: color
      });
    });
  });
}

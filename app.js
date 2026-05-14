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

fetch("data/samples_test.tsv")
  .then(response => response.text())
  .then(text => {
    const samples = parseTSV(text);

    samples.forEach(sample => {
      const x = Number(sample.X);
      const y = Number(sample.Y);

      const marker = L.circleMarker([y, x], {
        radius: 6,
        color: haplogroupColor(sample.MT_haplogroup),
        fillColor: haplogroupColor(sample.MT_haplogroup),
        fillOpacity: 0.8,
        weight: 2
      }).addTo(map);

      marker.bindPopup(`
        <strong>${sample.Sample_ID}</strong><br>
        MT haplogroup: ${sample.MT_haplogroup}<br>
        Sex: ${sample.Sex}<br>
        Kinship group: ${sample.Kinship_group}<br>
        <strong>Stipulated name:</strong> ${sample.Stipulated_name}<br><br>
        ${sample.History}
      `);
    });
  });

const imageWidth = 2000;
const imageHeight = 2500;

const map = L.map("map", {
  crs: L.CRS.Simple,
  minZoom: -2
});

const bounds = [[0, 0], [imageHeight, imageWidth]];

L.imageOverlay("assets/cemetery_plan.png", bounds).addTo(map);

map.fitBounds(bounds);

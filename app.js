const imageWidth = 2000;
const imageHeight = 2500;

const map = L.map("map", {
  crs: L.CRS.Simple,
  minZoom: -2
});

const bounds = [[0, 0], [imageHeight, imageWidth]];

L.imageOverlay("assets/Notre_Dame_Cemetery_PLAN.png", bounds).addTo(map);

map.fitBounds(bounds);

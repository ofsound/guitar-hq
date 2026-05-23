// Shared mgraphics helpers for Guitar HQ jsui scripts.
var ghq_shared = {};

ghq_shared.colors = {
  bg: [0.16, 0.18, 0.21, 1],
  panel: [0.20, 0.23, 0.27, 1],
  panel2: [0.12, 0.14, 0.17, 1],
  stroke: [0.38, 0.42, 0.48, 1],
  softStroke: [0.27, 0.31, 0.36, 1],
  text: [0.88, 0.90, 0.93, 1],
  muted: [0.56, 0.60, 0.66, 1],
  amber: [0.96, 0.62, 0.22, 1],
  blue: [0.27, 0.55, 0.82, 1],
  sliderInactive: [0.52, 0.55, 0.60, 1],
  green: [0.42, 0.78, 0.38, 1],
  red: [0.88, 0.28, 0.28, 1],
  off: [0.08, 0.09, 0.11, 1]
};

ghq_shared.WHEEL_NUDGE = 0.02;
ghq_shared.WHEEL_NUDGE_SHIFT = 0.06;

ghq_shared.clamp = function (value, min, max) {
  value = parseFloat(value);
  if (isNaN(value)) {
    return min;
  }
  return Math.max(min, Math.min(max, value));
};

ghq_shared.wheelNudge = function (scrolly, shift) {
  var step = shift ? ghq_shared.WHEEL_NUDGE_SHIFT : ghq_shared.WHEEL_NUDGE;
  return -scrolly * step;
};

ghq_shared.setColor = function (color) {
  mgraphics.set_source_rgba(color[0], color[1], color[2], color[3]);
};

ghq_shared.rect = function (x, y, w, h, color) {
  ghq_shared.setColor(color);
  mgraphics.rectangle(x, y, w, h);
  mgraphics.fill();
};

ghq_shared.strokeRect = function (x, y, w, h, color, width) {
  ghq_shared.setColor(color);
  mgraphics.set_line_width(width || 1);
  mgraphics.rectangle(x, y, w, h);
  mgraphics.stroke();
};

ghq_shared.text = function (label, x, y, size, color, align) {
  var ext;

  ghq_shared.setColor(color || ghq_shared.colors.text);
  mgraphics.select_font_face("Ableton Sans Medium");
  mgraphics.set_font_size(size || 12);
  ext = mgraphics.text_measure(String(label));
  if (align === "center") {
    x -= ext[0] / 2;
  } else if (align === "right") {
    x -= ext[0];
  }
  mgraphics.move_to(x, y);
  mgraphics.show_text(String(label));
};

ghq_shared.zone = function (zones, id, x, y, w, h, data) {
  zones.push({ id: id, x: x, y: y, w: w, h: h, data: data || {} });
};

ghq_shared.findZone = function (zones, x, y) {
  var i;
  var zone;

  for (i = zones.length - 1; i >= 0; i -= 1) {
    zone = zones[i];
    if (x >= zone.x && x <= zone.x + zone.w && y >= zone.y && y <= zone.y + zone.h) {
      return zone;
    }
  }
  return null;
};

ghq_shared.button = function (zones, id, label, x, y, w, h, active, data, fontSize) {
  var colors = ghq_shared.colors;
  var fill = active ? colors.amber : colors.panel2;
  var textColor = active ? colors.off : colors.text;

  ghq_shared.rect(x, y, w, h, fill);
  ghq_shared.strokeRect(x, y, w, h, active ? colors.amber : colors.softStroke, 1);
  ghq_shared.text(label, x + w / 2, y + h / 2 + 4, fontSize || 11, textColor, "center");
  ghq_shared.zone(zones, id, x, y, w, h, data);
};

ghq_shared.smallButton = function (zones, id, label, x, y, w, h, active, data, fontSize) {
  ghq_shared.button(zones, id, label, x, y, w, h, active, data, fontSize || 8);
};

ghq_shared.slider = function (zones, id, label, value, x, y, w, h, data, valueLabel, fillColor) {
  var colors = ghq_shared.colors;
  var normalized = ghq_shared.clamp(value, 0, 1);
  var rightText = valueLabel ? String(valueLabel) : Math.round(normalized * 100) + "%";
  var fill = fillColor || colors.blue;

  if (label) {
    ghq_shared.text(label, x, y - 6, 10, colors.muted);
  }
  ghq_shared.rect(x, y, w, h, colors.off);
  ghq_shared.rect(x, y, Math.round(w * normalized), h, fill);
  ghq_shared.strokeRect(x, y, w, h, colors.softStroke, 1);
  ghq_shared.text(rightText, x + w - 6, y + h / 2 + 4, 10, colors.text, "right");
  ghq_shared.zone(zones, id, x, y, w, h, data);
};

ghq_shared.controlLookup = function (controls, id) {
  return (controls && controls[id]) || { bound: false, normalized: 0, value: 0, active: false };
};

ghq_shared.activeAmpChains = function (controls) {
  var chains = [];

  if (ghq_shared.controlLookup(controls, "amp_bassman").active) {
    chains.push("bassman");
  }
  if (ghq_shared.controlLookup(controls, "amp_dumble").active) {
    chains.push("dumble");
  }
  return chains;
};

const map = require("./ghq_rack_map");

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

if (!map || !Array.isArray(map.controls)) {
  fail("rack map must export controls");
}

const ids = new Set();

for (const control of map.controls) {
  if (!control.id) {
    fail("control missing id");
  }
  if (ids.has(control.id)) {
    fail(`duplicate control id: ${control.id}`);
  }
  ids.add(control.id);

  if (!control.label) {
    fail(`${control.id}: missing label`);
  }
  if (!control.kind) {
    fail(`${control.id}: missing kind`);
  }
  if (!control.deviceKey || !map.deviceAliases[control.deviceKey]) {
    fail(`${control.id}: missing device aliases for ${control.deviceKey}`);
  }
  if ((control.kind === "slider" || control.kind === "toggle" || control.kind === "select") && !control.parameter) {
    fail(`${control.id}: missing parameter aliases`);
  }
  if (control.optional && control.kind === "device_toggle") {
    fail(`${control.id}: device toggles should not be optional`);
  }
  if (control.deviceIndex !== undefined && (typeof control.deviceIndex !== "number" || control.deviceIndex < 0)) {
    fail(`${control.id}: deviceIndex must be a non-negative number`);
  }
}

if (!process.exitCode) {
  console.log("rack map validation passed");
}

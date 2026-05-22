const fs = require("fs");

const maxpatPath = "guitar-hq.maxpat";
const amxdPath = "Guitar-HQ.amxd";

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function loadPatch() {
  const text = fs.readFileSync(maxpatPath, "utf8");
  return { text, json: JSON.parse(text) };
}

function boxMap(patcher) {
  const map = new Map();
  for (const item of patcher.boxes || []) {
    map.set(item.box.id, item.box);
  }
  return map;
}

function validateLines(patcher, name, errors) {
  const boxes = boxMap(patcher);

  for (const item of patcher.lines || []) {
    const source = item.patchline.source;
    const destination = item.patchline.destination;
    const sourceBox = boxes.get(source[0]);
    const destinationBox = boxes.get(destination[0]);

    if (!sourceBox) {
      errors.push(`${name}: missing source box ${source[0]}`);
      continue;
    }
    if (!destinationBox) {
      errors.push(`${name}: missing destination box ${destination[0]}`);
      continue;
    }
    if (source[1] >= (sourceBox.numoutlets || 0)) {
      errors.push(`${name}: ${source[0]} outlet ${source[1]} >= ${sourceBox.numoutlets || 0}`);
    }
    if (destination[1] >= (destinationBox.numinlets || 0)) {
      errors.push(`${name}: ${destination[0]} inlet ${destination[1]} >= ${destinationBox.numinlets || 0}`);
    }
  }

  for (const item of patcher.boxes || []) {
    if (item.box.patcher) {
      validateLines(item.box.patcher, `${name}/${item.box.id}`, errors);
    }
  }
}

function hasLine(patcher, src, outlet, dst, inlet) {
  return (patcher.lines || []).some((item) => {
    const source = item.patchline.source;
    const destination = item.patchline.destination;
    return source[0] === src && source[1] === outlet && destination[0] === dst && destination[1] === inlet;
  });
}

function validateAudioPassThrough(patcher, errors) {
  if (!hasLine(patcher, "plugin", 0, "plugout", 0)) {
    errors.push("root: missing left audio pass-through");
  }
  if (!hasLine(patcher, "plugin", 1, "plugout", 1)) {
    errors.push("root: missing right audio pass-through");
  }
}

function validateAmxd(maxpatText) {
  const amxd = fs.readFileSync(amxdPath);

  if (amxd.toString("ascii", 0, 4) !== "ampf") {
    fail(`${amxdPath}: missing ampf header`);
    return;
  }
  if (amxd.toString("ascii", 24, 28) !== "ptch") {
    fail(`${amxdPath}: missing ptch chunk`);
    return;
  }
  if (amxd.toString("ascii", 8, 16) !== "aaaameta") {
    fail(`${amxdPath}: expected audio-effect aaaameta header`);
  }
  if (amxd.readUInt32LE(20) !== 7) {
    fail(`${amxdPath}: expected audio-effect metadata value 7`);
  }

  const payloadLength = amxd.readUInt32LE(28);
  const payload = amxd.subarray(32).toString("utf8");

  if (payloadLength !== Buffer.byteLength(maxpatText)) {
    fail(`${amxdPath}: payload length ${payloadLength} does not match ${maxpatPath}`);
  }
  if (payload !== maxpatText) {
    fail(`${amxdPath}: embedded patch differs from ${maxpatPath}`);
  }
  JSON.parse(payload);
}

const patch = loadPatch();
const errors = [];

validateLines(patch.json.patcher, "root", errors);
validateAudioPassThrough(patch.json.patcher, errors);
validateAmxd(patch.text);

for (const error of errors) {
  fail(error);
}

if (!process.exitCode) {
  console.log("device patch validation passed");
}

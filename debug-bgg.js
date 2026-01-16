import los from "./libs/los.js";

const _ = null;
const X = "#";
const B = 2;
const D = 3;

// Debug BGG C: Monster blocks LOS
const gridC = [
  [_, _, _, _, _],
  [_, _, 1, _],
  [_, _, _, _, _],
  [_, _, _, B, _]
];

console.log("=== BGG C Debug ===");
console.log("Grid:");
gridC.forEach((row, r) => {
  console.log(`Row ${r}:`, row.map(c => c === X ? 'X' : c === 1 ? '1' : c === B ? 'B' : '_').join(' '));
});
console.log("Source: [0,0], Target: [3,3]");
console.log("Expected: false, Got:", los([0, 0], [3, 3], gridC));

// Debug BGG D: Corner squeeze
const gridD = [
  [_, X, _, _, _],
  [_, X, _, _, _],
  [_, _, _, _, _],
  [_, X, _, D, _]
];

console.log("\n=== BGG D Debug ===");
console.log("Grid:");
gridD.forEach((row, r) => {
  console.log(`Row ${r}:`, row.map(c => c === X ? 'X' : c === D ? 'D' : '_').join(' '));
});
console.log("Source: [0,0], Target: [3,3]");
console.log("Expected: true, Got:", los([0, 0], [3, 3], gridD));
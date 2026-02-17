const fallbackCoverGradients = [
  "linear-gradient(145deg, #ff7e5f, #feb47b)",
  "linear-gradient(145deg, #2c3e50, #4ca1af)",
  "linear-gradient(145deg, #6a11cb, #2575fc)",
  "linear-gradient(145deg, #11998e, #38ef7d)",
  "linear-gradient(145deg, #f12711, #f5af19)",
  "linear-gradient(145deg, #654ea3, #eaafc8)",
  "linear-gradient(145deg, #0f2027, #2c5364)",
];

export function getFallbackCoverGradient(seed) {
  const value = String(seed ?? "");
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  const paletteIndex = Math.abs(hash) % fallbackCoverGradients.length;
  return fallbackCoverGradients[paletteIndex];
}

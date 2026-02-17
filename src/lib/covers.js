const fallbackCoverGradients = [
  "linear-gradient(145deg, #ff7e5f, #feb47b)",
  "linear-gradient(145deg, #2c3e50, #4ca1af)",
  "linear-gradient(145deg, #6a11cb, #2575fc)",
  "linear-gradient(145deg, #11998e, #38ef7d)",
  "linear-gradient(145deg, #f12711, #f5af19)",
  "linear-gradient(145deg, #654ea3, #eaafc8)",
  "linear-gradient(145deg, #0f2027, #2c5364)",
  "linear-gradient(145deg, #ee0979, #ff6a00)",
  "linear-gradient(145deg, #0cebeb, #20e3b2)",
  "linear-gradient(145deg, #5433ff, #20bdff)",
  "linear-gradient(145deg, #f857a6, #ff5858)",
  "linear-gradient(145deg, #1a2a6c, #b21f1f)",
  "linear-gradient(145deg, #42275a, #734b6d)",
  "linear-gradient(145deg, #2b5876, #4e4376)",
  "linear-gradient(145deg, #3a1c71, #d76d77)",
  "linear-gradient(145deg, #134e5e, #71b280)",
  "linear-gradient(145deg, #355c7d, #6c5b7b)",
  "linear-gradient(145deg, #c33764, #1d2671)",
  "linear-gradient(145deg, #141e30, #243b55)",
  "linear-gradient(145deg, #a18cd1, #fbc2eb)",
  "linear-gradient(145deg, #283c86, #45a247)",
  "linear-gradient(145deg, #f7971e, #ffd200)",
  "linear-gradient(145deg, #f953c6, #b91d73)",
  "linear-gradient(145deg, #159957, #155799)",
  "linear-gradient(145deg, #5f2c82, #49a09d)",
  "linear-gradient(145deg, #fc466b, #3f5efb)",
  "linear-gradient(145deg, #614385, #516395)",
  "linear-gradient(145deg, #56ab2f, #a8e063)",
  "linear-gradient(145deg, #00c6ff, #0072ff)",
  "linear-gradient(145deg, #833ab4, #fd1d1d)",
  "linear-gradient(145deg, #cc2b5e, #753a88)",
  "linear-gradient(145deg, #2193b0, #6dd5ed)",
  "linear-gradient(145deg, #de6262, #ffb88c)",
  "linear-gradient(145deg, #0f0c29, #302b63)",
  "linear-gradient(145deg, #dce35b, #45b649)",
  "linear-gradient(145deg, #ff9966, #ff5e62)",
  "linear-gradient(145deg, #1f4037, #99f2c8)",
  "linear-gradient(145deg, #8360c3, #2ebf91)",
  "linear-gradient(145deg, #8e2de2, #4a00e0)",
  "linear-gradient(145deg, #c94b4b, #4b134f)",
  "linear-gradient(145deg, #16a085, #f4d03f)",
  "linear-gradient(145deg, #ff4b1f, #1fddff)",
  "linear-gradient(145deg, #3e5151, #decba4)",
  "linear-gradient(145deg, #3f2b96, #a8c0ff)",
  "linear-gradient(145deg, #4b6cb7, #182848)",
  "linear-gradient(145deg, #5a3f37, #2c7744)",
  "linear-gradient(145deg, #f3904f, #3b4371)",
  "linear-gradient(145deg, #4e54c8, #8f94fb)",
];

export function getFallbackCoverGradient(seed) {
  if (seed === undefined || seed === null || seed === "") {
    const randomIndex = Math.floor(Math.random() * fallbackCoverGradients.length);
    return fallbackCoverGradients[randomIndex];
  }

  const value = String(seed ?? "");
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  const paletteIndex = Math.abs(hash ^ 0x9e3779b9) % fallbackCoverGradients.length;
  return fallbackCoverGradients[paletteIndex];
}

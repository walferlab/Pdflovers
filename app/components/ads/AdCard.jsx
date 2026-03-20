// app/components/ads/AdCard.jsx
"use client";

// Each card renders an <iframe srcdoc="..."> that contains the full Adsterra
// JS tag inside its own isolated document. Because every srcdoc iframe has its
// own window object, each one gets a fresh window.atOptions and invoke.js runs
// independently — so all cards on the page load their own ad.

const NATIVE_W = 160;
const NATIVE_H = 300;
const CARD_W   = 136;
const scale    = CARD_W / NATIVE_W;
const scaledH  = Math.round(NATIVE_H * scale); // 255

// The full Adsterra tag as an HTML document string
const AD_HTML = `<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; overflow: hidden; }
  body { background: transparent; }
</style>
</head>
<body>
<script>
  atOptions = {
    'key'    : 'e35051a158ae63e2ced64ce0a9371446',
    'format' : 'iframe',
    'height' : 300,
    'width'  : 160,
    'params' : {}
  };
<\/script>
<script src="https://archaicmsflip.com/e35051a158ae63e2ced64ce0a9371446/invoke.js"><\/script>
</body>
</html>`;

/**
 * AdCard — slots into any NetflixRow at the same 136px width as PdfCard.
 *
 * Usage:
 *   <div style={{ width: 136, minWidth: 136, flexShrink: 0 }}>
 *     <AdCard />
 *   </div>
 */
export default function AdCard() {
    return (
        <div className="flex flex-col" style={{ width: CARD_W }} aria-label="Advertisement">
            {/* Clipping shell */}
            <div
                style={{
                    width:        CARD_W,
                    height:       scaledH,
                    overflow:     "hidden",
                    borderRadius: 10,
                    background:   "rgba(255,255,255,0.03)",
                    border:       "1px solid rgba(255,255,255,0.06)",
                }}
            >
                {/* srcdoc iframe — fully isolated window, fresh atOptions every time */}
                <iframe
                    srcDoc={AD_HTML}
                    width={NATIVE_W}
                    height={NATIVE_H}
                    frameBorder="0"
                    scrolling="no"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                    title="Advertisement"
                    style={{
                        display:         "block",
                        border:          "none",
                        transform:       `scale(${scale})`,
                        transformOrigin: "top left",
                    }}
                />
            </div>

            {/* "Ad" label — matches category text position under PdfCard */}
            <span
                className="font-satoshi font-medium text-[#2e2e2e] px-0.5 mt-2"
                style={{ fontSize: 10, letterSpacing: "0.04em" }}
            >
                Ad
            </span>
        </div>
    );
}
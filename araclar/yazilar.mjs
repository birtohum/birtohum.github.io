// Yazıları (yazilar/<ad>.<dil>.md) sayfaya çevirir:  node araclar/yazilar.mjs
//   yazilar/<ad>/index.html (Türkçe), yazilar/<ad>/en/index.html (İngilizce), yazilar/index.html (liste)
// Markdown'ın yalnızca bu yazılarda kullanılan kısmı desteklenir: başlık, paragraf, liste, tablo, alıntı, kalın/eğik, kod, bağlantı.
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://birtohum.github.io";
const YAZILAR = [
  {ad: "usta", tarih: "2026-11-04", kart: "usta", tr: "Usta: kendi kodunu denetleyen ajan", en: "Usta: an agent that checks its own code"},
];

const kacis = s => s.replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
function satirIci(s) {
  const kodlar = [];
  s = s.replace(/`([^`]+)`/g, (_, k) => `\u0000${kodlar.push(kacis(k)) - 1}\u0000`);
  s = kacis(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, "$1<em>$2</em>")
    .replace(/(https?:\/\/[^\s<]+[^\s<.,;:)])/g, '<a href="$1">$1</a>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${kodlar[i]}</code>`);
}
function md(metin) {
  const satirlar = metin.replace(/\r/g, "").split("\n"), cikti = [];
  let i = 0;
  const blok = () => { const b = []; while (i < satirlar.length && satirlar[i].trim() && !/^(#|>|\||- |\d+\. )/.test(satirlar[i])) b.push(satirlar[i++].trim()); return b.join(" "); };
  while (i < satirlar.length) {
    const s = satirlar[i];
    if (!s.trim()) { i++; continue; }
    let m;
    if ((m = s.match(/^(#{1,3}) (.*)/))) { cikti.push(`<h${m[1].length}>${satirIci(m[2])}</h${m[1].length}>`); i++; }
    else if (s.startsWith(">")) { const b = []; while (i < satirlar.length && satirlar[i].startsWith(">")) b.push(satirlar[i++].replace(/^>\s?/, "")); cikti.push(`<blockquote><p>${satirIci(b.join(" "))}</p></blockquote>`); }
    else if (s.startsWith("|")) {
      const b = []; while (i < satirlar.length && satirlar[i].startsWith("|")) b.push(satirlar[i++]);
      const hucre = r => r.replace(/^\||\|$/g, "").split("|").map(x => satirIci(x.trim()));
      cikti.push(`<div class="tablo"><table><thead><tr>${hucre(b[0]).map(x => `<th>${x}</th>`).join("")}</tr></thead><tbody>${b.slice(2).map(r => `<tr>${hucre(r).map(x => `<td>${x}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
    } else if (/^(- |\d+\. )/.test(s)) {
      const sirali = /^\d+\. /.test(s), ogeler = [];
      while (i < satirlar.length && (/^(- |\d+\. )/.test(satirlar[i]) || /^\s{2,}\S/.test(satirlar[i]))) {
        if (/^(- |\d+\. )/.test(satirlar[i])) ogeler.push(satirlar[i].replace(/^(- |\d+\. )/, "").trim());
        else ogeler[ogeler.length - 1] += " " + satirlar[i].trim();
        i++;
      }
      cikti.push(`<${sirali ? "ol" : "ul"}>${ogeler.map(o => `<li>${satirIci(o)}</li>`).join("")}</${sirali ? "ol" : "ul"}>`);
    } else cikti.push(`<p>${satirIci(blok())}</p>`);
  }
  return cikti.join("\n");
}

const STIL = `:root{--kagit:#f6f3ea;--cizgi:rgba(20,20,20,.07);--murekkep:#141414;--soluk:#5b5850;--kart:#fffdf7;--fosfor:#ffe14d;--mavi:#2050c8}
@media (prefers-color-scheme:dark){:root{--kagit:#121210;--cizgi:rgba(255,255,255,.05);--murekkep:#f2efe6;--soluk:#a9a59a;--kart:#1b1a17;--fosfor:#e8c62e;--mavi:#8aa8ff}}
*{box-sizing:border-box}
body{margin:0;color:var(--murekkep);font:18px/1.65 "Bricolage Grotesque",system-ui,sans-serif;background-color:var(--kagit);
  background-image:linear-gradient(var(--cizgi) 1px,transparent 1px),linear-gradient(90deg,var(--cizgi) 1px,transparent 1px);background-size:28px 28px}
.sar{max-width:720px;margin:0 auto;padding:0 20px 80px}
.ust{display:flex;justify-content:space-between;align-items:center;padding:18px 0;font:600 .85rem "IBM Plex Mono",monospace}
.ust a{text-decoration:none}.ust .ad{font:800 1.05rem "Bricolage Grotesque"}
.etiket{font:600 .75rem "IBM Plex Mono",monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--soluk);margin-top:40px}
h1{font-size:clamp(2rem,5.4vw,3.2rem);line-height:1.02;letter-spacing:-.03em;margin:14px 0 18px}
h1+p em{font-size:1.15rem;color:var(--soluk)}
h2{font-size:1.6rem;letter-spacing:-.02em;margin:46px 0 10px;padding-top:12px;border-top:2px solid var(--murekkep)}
a{color:inherit;text-decoration-color:var(--fosfor);text-decoration-thickness:3px;text-underline-offset:3px;word-break:break-word}
strong{background:linear-gradient(transparent 62%,color-mix(in srgb,var(--fosfor) 70%,transparent) 62%)}
code{font:500 .86em "IBM Plex Mono",monospace;background:var(--kart);border:1px solid var(--cizgi);padding:1px 5px;border-radius:4px}
blockquote{margin:22px 0;padding:14px 18px;border-left:6px solid var(--fosfor);background:var(--kart);border-radius:0 8px 8px 0}
blockquote p{margin:0}
.tablo{overflow-x:auto;margin:22px 0;border:2px solid var(--murekkep);border-radius:8px;background:var(--kart)}
table{border-collapse:collapse;width:100%;font-size:.95rem}th,td{padding:10px 12px;text-align:left;border-bottom:1px solid var(--cizgi)}th{font:600 .75rem "IBM Plex Mono",monospace;text-transform:uppercase;letter-spacing:.06em;color:var(--soluk)}
li{margin:6px 0}
.dil{display:inline-block;margin-top:6px;font:600 .8rem "IBM Plex Mono",monospace;border:2px solid var(--murekkep);border-radius:99px;padding:6px 12px;text-decoration:none}
.son{margin-top:50px;padding:22px;border:2px solid var(--murekkep);border-radius:8px;background:var(--kart);box-shadow:5px 5px 0 var(--murekkep)}
.son a{font-weight:800}
.liste a{display:block;padding:20px;border:2px solid var(--murekkep);border-radius:8px;background:var(--kart);text-decoration:none;margin-top:16px;box-shadow:5px 5px 0 var(--murekkep)}
.liste b{font-size:1.3rem;display:block}.liste span{color:var(--soluk);font-size:.9rem}`;
const FONT = `<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=IBM+Plex+Mono:wght@400;600&display=swap" rel="stylesheet">`;
const sayac = `<script data-goatcounter="https://SAYAC.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>`;  // index.html'deki SAYAC ile aynı

function sayfa({dil, baslik, aciklama, adres, kart, govde, ust}) {
  return `<!doctype html>
<html lang="${dil}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${kacis(baslik)}</title><meta name="description" content="${kacis(aciklama)}">
<link rel="canonical" href="${adres}">
<meta property="og:type" content="article"><meta property="og:title" content="${kacis(baslik)}"><meta property="og:description" content="${kacis(aciklama)}">
<meta property="og:url" content="${adres}"><meta property="og:image" content="${SITE}/og/${kart}.png"><meta name="twitter:card" content="summary_large_image">
${FONT}<style>${STIL}</style></head>
<body><div class="sar">${ust}${govde}</div>${fs.existsSync(path.join(KOK, ".sayac")) ? sayac.replace("SAYAC", fs.readFileSync(path.join(KOK, ".sayac"), "utf8").trim()) : ""}</body></html>
`;
}

for (const y of YAZILAR) {
  for (const dil of ["tr", "en"]) {
    const kaynak = fs.readFileSync(path.join(KOK, "yazilar", `${y.ad}.${dil}.md`), "utf8");
    const baslik = kaynak.match(/^# (.*)/m)[1];
    const aciklama = (kaynak.match(/^\*(.+)\*$/m) || [, ""])[1];
    const kelime = kaynak.split(/\s+/).length, dk = Math.max(1, Math.round(kelime / 220));
    const tr = dil === "tr";
    const dizin = path.join(KOK, "yazilar", y.ad, tr ? "" : "en");
    fs.mkdirSync(dizin, {recursive: true});
    const ust = `<header class="ust"><a class="ad" href="${tr ? "/" : "/?dil=en"}">Ege</a><a href="/yazilar/">${tr ? "Yazılar" : "Writing"}</a></header>
      <div class="etiket">${y.tarih} · ${dk} ${tr ? "dk okuma" : "min read"}</div>
      <a class="dil" href="${tr ? "en/" : "../"}" hreflang="${tr ? "en" : "tr"}">${tr ? "Read in English →" : "Türkçe oku →"}</a>`;
    const son = tr
      ? `<div class="son">Projenin hikâyesi, ekran görüntüleri ve rakamları: <a href="/#proje/usta">Usta'nın portfolyo sayfası →</a></div>`
      : `<div class="son">The project page, with screenshots and numbers: <a href="/?dil=en#proje/usta">Usta on my portfolio →</a></div>`;
    fs.writeFileSync(path.join(dizin, "index.html"), sayfa({dil, baslik, aciklama, kart: y.kart, adres: `${SITE}/yazilar/${y.ad}/${tr ? "" : "en/"}`, ust, govde: md(kaynak) + son}));
  }
}
fs.writeFileSync(path.join(KOK, "yazilar", "index.html"), sayfa({dil: "tr", baslik: "Yazılar — Ege", aciklama: "Projelerimden çıkan, ölçülmüş sonuçlar üzerine yazılar.",
  adres: `${SITE}/yazilar/`, kart: "ana", ust: `<header class="ust"><a class="ad" href="/">Ege</a><a href="/">Portfolyo</a></header><div class="etiket">Yazılar</div><h1>Ölçtüklerim, sonuçlarıyla.</h1>`,
  govde: `<div class="liste">${YAZILAR.map(y => `<a href="/yazilar/${y.ad}/"><b>${kacis(y.tr)}</b><span>${y.tarih} · Türkçe ve İngilizce</span></a>`).join("")}</div>`}));
console.log("tamam:", YAZILAR.length, "yazı");

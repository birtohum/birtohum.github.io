// Paylaşım sayfalarını ve kartlarını üretir:  node araclar/uret.mjs
//   p/<id>/index.html  → LinkedIn/X gibi yerlerin okuyacağı başlık, açıklama ve görsel; ziyaretçiyi /#proje/<id>'ye yollar
//   og/<id>.png        → araclar/kart.html'in 1200×630 ekran görüntüsü (Microsoft Edge, başsız)
// Proje metinleri veri.js'ten okunur; metin değişince bu betik yeniden çalıştırılmalı.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import {execFileSync} from "node:child_process";
import {fileURLToPath, pathToFileURL} from "node:url";

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://birtohum.github.io";
const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const {PROJELER, HIKAYE} = vm.runInNewContext(fs.readFileSync(path.join(KOK, "veri.js"), "utf8") + "\n;({PROJELER, HIKAYE})");
const kacis = s => String(s).replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));

function kart(id) {
  const hedef = path.join(KOK, "og", `${id}.png`);
  fs.rmSync(hedef, {force: true});
  const url = pathToFileURL(path.join(KOK, "araclar", "kart.html")).href + `?id=${id}`;
  const bekle = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
  // msedge.exe görüntüyü yazmadan önce dönebiliyor: dosyayı bekle, gelmezse yeniden dene
  for (let deneme = 0; deneme < 3 && !fs.existsSync(hedef); deneme++) {
    execFileSync(EDGE, ["--headless=new", `--user-data-dir=${path.join(os.tmpdir(), "portfolyo-edge")}`, "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
      "--window-size=1200,630", "--virtual-time-budget=5000", `--screenshot=${hedef}`, url], {stdio: "ignore"});
    for (let t = 0; t < 40 && !fs.existsSync(hedef); t++) bekle(250);
  }
  if (!fs.existsSync(hedef)) throw new Error(`kart üretilemedi: ${id}`);
  return hedef;
}

fs.mkdirSync(path.join(KOK, "og"), {recursive: true});
kart("ana");
for (const p of PROJELER) {
  const h = HIKAYE[p.ad];
  if (!h) continue;
  kart(h.id);
  const dizin = path.join(KOK, "p", h.id);
  fs.mkdirSync(dizin, {recursive: true});
  const baslik = `${p.ad} — Ege`, aciklama = h.soru, adres = `${SITE}/p/${h.id}/`, hedef = `/#proje/${h.id}`;
  fs.writeFileSync(path.join(dizin, "index.html"), `<!doctype html>
<html lang="tr"><head><meta charset="utf-8">
<title>${kacis(baslik)}</title>
<meta name="description" content="${kacis(aciklama)}">
<link rel="canonical" href="${adres}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Ege · birtohum.github.io">
<meta property="og:title" content="${kacis(baslik)}">
<meta property="og:description" content="${kacis(aciklama)}">
<meta property="og:url" content="${adres}">
<meta property="og:image" content="${SITE}/og/${h.id}.png">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="0; url=${hedef}">
<script>location.replace("/" + location.search + ${JSON.stringify(hedef.slice(1))});</script>
</head><body><a href="${hedef}">${kacis(p.ad)} hikâyesine git</a></body></html>
`);
}
console.log("tamam:", PROJELER.filter(p => HIKAYE[p.ad]).length, "proje + ana kart");

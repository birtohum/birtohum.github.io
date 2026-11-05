// "Bugün Türkiye": sitelerin günlük verisinden tek paragraf.  node araclar/bugun.mjs  (META_MODEL_API_KEY ortamda)
// Model yazar; metindeki her sayı olgulardaki biçimlenmiş değerlerden biri olmak zorunda. Tutmazsa sabit kalıp yayımlanır.
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://birtohum.github.io";
const MODEL = "muse-spark-1.3-contributor";
const AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const al = async (yol) => { const r = await fetch(`${SITE}/${yol}`, {headers: {"cache-control": "no-cache"}}); if (!r.ok) throw new Error(`${yol}: ${r.status}`); return r.json(); };
const trSayi = (n, b = 0) => n.toLocaleString("tr-TR", {minimumFractionDigits: b, maximumFractionDigits: b});
const enSayi = (n, b = 0) => n.toLocaleString("en-GB", {minimumFractionDigits: b, maximumFractionDigits: b});
const trGun = (iso) => { const d = new Date(iso + "T12:00:00Z"); return `${d.getUTCDate()} ${AYLAR[d.getUTCMonth()]}`; };
const enGun = (iso) => { const d = new Date(iso + "T12:00:00Z"); return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`; };
const dunTR = () => { const d = new Date(Date.now() + 3 * 3600e3 - 864e5); return d.toISOString().slice(0, 10); };

// ------------------------------------------------------------------ olgular
async function olgular() {
  const o = [];   // {konu, tr, en, sayilar: [[tr, en], ...]}
  const dun = dunTR();
  await Promise.allSettled([
    al("turkiye-sallandi/veri/ozet.json").then(d => {
      const g = (d.gunluk || []).find(x => x[0] === dun) || (d.gunluk || []).at(-1);
      if (!g) return;
      const [gun, n, n3, mx] = g;
      o.push({konu: "deprem", tr: `${trGun(gun)}: Türkiye ve yakınında ${trSayi(n)} deprem kaydedildi; ${n3 ? `${trSayi(n3)} tanesi 3 ve üzeri` : "hiçbiri 3 ve üzerinde değil"}, en büyüğü ${trSayi(mx, 1)}.`,
        en: `${enGun(gun)}: ${enSayi(n)} earthquakes were recorded in and around Turkey; ${n3 ? `${enSayi(n3)} of magnitude 3 or more` : "none reached magnitude 3"}, the largest ${enSayi(mx, 1)}.`,
        sayilar: [[trSayi(n), enSayi(n)], [trSayi(n3), enSayi(n3)], [trSayi(mx, 1), enSayi(mx, 1)]], gun});
    }),
    al("kac-sigara/veri/veri.json").then(v => {
      const il = v.iller.find(x => x.plaka === 34); if (!il) return;
      let i = il.pm.length - 1; while (i >= 0 && il.pm[i] == null) i--; if (i < 0) return;
      const sig = il.pm[i] / v.kurallar.sigara_ugm3;
      const gun = new Date(Date.parse(v.ilk_gun + "T00:00:00Z") + i * 864e5).toISOString().slice(0, 10);
      o.push({konu: "hava", tr: `${trGun(gun)}: İstanbul'da bir gün boyunca hava solumak, ince toz (PM2,5) bakımından yaklaşık ${trSayi(sig, 1)} sigaraya denkti.`,
        en: `${enGun(gun)}: breathing Istanbul's air for a day was roughly equal to ${enSayi(sig, 1)} cigarettes in fine particles (PM2.5).`,
        sayilar: [[trSayi(sig, 1), enSayi(sig, 1)]], gun});
    }),
    al("barajlar-uzaydan/veri/ozet.json").then(d => {
      const y = d.toplam && d.toplam.yuzde; if (y == null) return;
      o.push({konu: "baraj", tr: `İstanbul'un 10 barajında su kaplı alan, uydudan ölçülen en dolu hâlinin %${trSayi(y)}'i (alan, hacim değil).`,
        en: `The water-covered area of Istanbul's 10 reservoirs is ${enSayi(y)}% of their fullest, measured by satellite (area, not volume).`,
        sayilar: [[trSayi(y), enSayi(y)], ["10", "10"]]});
    }),
    al("turkiye-merak/veri/son.json").then(s => al(`turkiye-merak/veri/gun/${s.son.slice(0, 7)}.json`).then(ay => {
      const p = ay[s.son] && ay[s.son].p && ay[s.son].p[0]; if (!p) return;
      const ad = p.a.replace(/_/g, " "), kat = Math.round(p.v / Math.max(1, p.b));
      o.push({konu: "vikipedi", tr: `${trGun(s.son)}: Türkçe Vikipedi'de birdenbire en çok "${ad}" okundu: ${trSayi(p.v)} kez, olağan gününün yaklaşık ${trSayi(kat)} katı.`,
        en: `${enGun(s.son)}: the article that suddenly drew the most readers on Turkish Wikipedia was "${ad}": ${enSayi(p.v)} views, about ${enSayi(kat)} times its usual day.`,
        sayilar: [[trSayi(p.v), enSayi(p.v)], [trSayi(kat), enSayi(kat)]], ad, gun: s.son});
    })),
    al("denizler-isiniyor/veri/ozet.json").then(d => {
      const t = d.tum_kiyi; if (!t || t.anomali == null) return;
      const a = t.anomali, isaret = a >= 0 ? "sıcak" : "serin";
      o.push({konu: "deniz", tr: `${trGun(d.son_tarih)}: Türkiye kıyılarında deniz suyu, 1991–2020 ortalamasına göre ${trSayi(Math.abs(a), 1)} °C daha ${isaret}; ${trSayi(t.nokta_sayisi)} noktanın ${trSayi(t.normalden_sicak)} tanesi normalden sıcak.`,
        en: `${enGun(d.son_tarih)}: sea water along Turkey's coasts was ${enSayi(Math.abs(a), 1)} °C ${a >= 0 ? "warmer" : "cooler"} than the 1991–2020 average; ${enSayi(t.normalden_sicak)} of ${enSayi(t.nokta_sayisi)} points were warmer than normal.`,
        sayilar: [[trSayi(Math.abs(a), 1), enSayi(Math.abs(a), 1)], [trSayi(t.nokta_sayisi), enSayi(t.nokta_sayisi)], [trSayi(t.normalden_sicak), enSayi(t.normalden_sicak)], ["1991", "1991"], ["2020", "2020"]], gun: d.son_tarih});
    }),
  ]);
  const sira = ["deprem", "hava", "baraj", "deniz", "vikipedi"];
  return o.sort((a, b) => sira.indexOf(a.konu) - sira.indexOf(b.konu));
}

// ------------------------------------------------------------------ doğrulama
// Metindeki her sayı (tarihlerin gün/ yıl sayıları dahil) izin verilen biçimlerden biri olmalı.
function izinli(olg, dil) {
  const s = new Set();
  for (const x of olg) {
    for (const ikili of x.sayilar) s.add(ikili[dil === "tr" ? 0 : 1]);
    for (const g of [x.gun].filter(Boolean)) { const d = new Date(g + "T12:00:00Z"); s.add(String(d.getUTCDate())); s.add(String(d.getUTCFullYear())); }
  }
  ["2,5", "2.5"].forEach(v => s.add(v));   // PM2,5 / PM2.5
  return s;
}
function dogrula(metin, olg, dil) {
  const izin = izinli(olg, dil);
  const temiz = metin.replace(/PM ?2[.,]5/gi, " ");
  const sayilar = temiz.match(/\d+(?:[.,]\d+)*/g) || [];
  const yanlis = sayilar.filter(n => !izin.has(n));
  const vik = olg.find(x => x.konu === "vikipedi");
  if (vik && /vikipedi|wikipedia/i.test(metin) && !metin.includes(vik.ad)) yanlis.push(`madde adı yok: ${vik.ad}`);
  if (metin.length < 120 || metin.length > 900) yanlis.push(`uzunluk ${metin.length}`);
  return yanlis;
}

// ------------------------------------------------------------------ model
async function yazdir(olg, dil) {
  const anahtar = process.env.META_MODEL_API_KEY;
  if (!anahtar) throw new Error("META_MODEL_API_KEY yok");
  const satirlar = olg.map(x => "- " + (dil === "tr" ? x.tr : x.en)).join("\n");
  const istem = dil === "tr"
    ? `Aşağıdaki doğrulanmış verilerden, gazete diliyle, sakin ve sade tek bir Türkçe paragraf yaz (3-4 cümle, en fazla 90 kelime). Kurallar: yalnız bu verileri kullan; hiçbir sayı ekleme, yuvarlama ya da hesaplama yapma, sayıları tam yazıldığı gibi rakamla kullan; yorum, tahmin, neden-sonuç, ünlem ve abartı yok; madde adını tırnak içinde aynen yaz. Yalnız paragrafı döndür.\n\nVeriler:\n${satirlar}`
    : `From the verified facts below, write one calm, plain English paragraph in a newspaper style (3-4 sentences, at most 90 words). Rules: use only these facts; do not add, round or compute any number, write every number exactly as given in digits; no opinions, guesses, causes, exclamations or hype; keep the article title in quotes exactly. Return only the paragraph.\n\nFacts:\n${satirlar}`;
  const r = await fetch("https://api.meta.ai/v1/chat/completions", {
    method: "POST", headers: {"Authorization": `Bearer ${anahtar}`, "Content-Type": "application/json"},
    body: JSON.stringify({model: MODEL, messages: [{role: "user", content: istem}], max_tokens: 6000, reasoning_effort: "low", temperature: 0.3}),
  });
  if (!r.ok) throw new Error(`model ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const v = await r.json();
  return {metin: String(v.choices?.[0]?.message?.content || "").trim().replace(/^["“]|["”]$/g, ""), kullanim: v.usage || null};
}

const sablon = (olg, dil) => olg.map(x => dil === "tr" ? x.tr : x.en).join(" ");

async function main() {
  const olg = await olgular();
  if (olg.length < 2) throw new Error(`yeterli veri yok (${olg.length})`);
  const sonuc = {tarih: dunTR(), uretim: new Date().toISOString(), model: MODEL, olgular: olg.map(({konu, tr, en}) => ({konu, tr, en}))};
  for (const dil of ["tr", "en"]) {
    let metin = sablon(olg, dil), kaynak = "sablon", neden = null;
    try {
      for (let deneme = 1; deneme <= 2; deneme++) {
        const y = await yazdir(olg, dil);
        const hata = dogrula(y.metin, olg, dil);
        if (!hata.length) { metin = y.metin; kaynak = "model"; neden = null; sonuc[`kullanim_${dil}`] = y.kullanim; break; }
        neden = `doğrulanamadı: ${hata.join(", ")}`;
      }
    } catch (e) { neden = e.message.replace(/Bearer\s+\S+/g, "Bearer ***"); }
    sonuc[dil] = {metin, kaynak, neden};
    console.log(`${dil}: ${kaynak}${neden ? " (" + neden + ")" : ""}`);
  }
  const dizin = path.join(KOK, "veri"); fs.mkdirSync(dizin, {recursive: true});
  fs.writeFileSync(path.join(dizin, "bugun.json"), JSON.stringify(sonuc, null, 1) + "\n");
  const arsivYol = path.join(dizin, "bugun-arsiv.json");
  let arsiv = []; try { arsiv = JSON.parse(fs.readFileSync(arsivYol, "utf8")); } catch { /* ilk gün */ }
  arsiv = arsiv.filter(x => x.tarih !== sonuc.tarih);
  arsiv.unshift({tarih: sonuc.tarih, tr: sonuc.tr, en: sonuc.en});
  fs.writeFileSync(arsivYol, JSON.stringify(arsiv.slice(0, 90), null, 1) + "\n");
}

main().catch(e => { console.error("hata:", e.message); process.exit(1); });

export {dogrula, izinli};

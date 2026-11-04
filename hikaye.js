"use strict";
// Proje hikâyeleri: karta basınca tam ekran pencere. Canlı siteler pencerede gerçek haliyle (iframe) açılır.
// Adres: #proje/<id> ya da #site/<depo>; geri tuşu ve Esc pencereyi kapatır.

// ---------------------------------------------------------------- sahne çizimleri
function sahneUsta() {
  const satirlar = [
    ["g", "$ usta"], ["", T("› Görev: \"vade.py: tatile denk gelen ödeme gününü ilk iş gününe kaydır\"", "› Task: \"vade.py: move a due date that falls on a holiday to the next business day\"")],
    ["s", T("  Muse Spark kabul testlerini yazıyor (kodu görmeden)…", "  Muse Spark writes acceptance tests (without seeing the code)…")], ["s", T("  Yürütücü kodu yazıyor: Write vade.py · Bash pytest", "  Executor writes the code: Write vade.py · Bash pytest")],
    ["y", T("  ✓ 54/54 kabul testi geçti · 1. tur", "  ✓ 54/54 acceptance tests passed · round 1")], ["g", T("  Gizli testler (kimsenin görmediği):", "  Hidden tests (nobody in the loop saw them):")],
    ["k", T("  ✗ 114 görevde: tek başına %60 · Usta %58", "  ✗ 114 tasks: model alone 60% · Usta 58%")], ["g", T("  → kazanç yok. Nedeni aşağıda.", "  → no gain. The reason is below.")],
  ];
  return `<div class="term">${satirlar.map(([s, t], i) => `<div class="${s}" style="animation-delay:${.25 + i * .45}s">${esc(t)}</div>`).join("")}</div>`;
}
function sahneMasa() {
  const h = [];
  for (let y = 0; y < 11; y++) for (let x = 0; x < 11; x++) {
    const yol = (x >= 4 && x <= 6) || (y >= 4 && y <= 6);
    const ev = (x < 2 && y < 2) ? "r" : (x > 8 && y < 2) ? "m" : (x < 2 && y > 8) ? "s" : (x > 8 && y > 8) ? "y" : "";
    let c = yol ? "" : ev || "b";
    if (yol && ((x === 5 && y === 1) || (x === 9 && y === 5) || (x === 5 && y === 9) || (x === 1 && y === 5))) c = ["r", "m", "y", "s"][(x + y) % 4] + " t";
    if (x === 5 && y === 5) c = "b";
    h.push(`<i class="${c}"></i>`);
  }
  return `<div class="tahta">${h.join("")}</div><img src="${G}p-bizimmasa-ikon.webp" alt="">`;
}
function sahneSes() {
  const bar = Array.from({length: 34}, (_, i) => `<i style="animation-delay:${(i * 97 % 900) / 1000}s;animation-duration:${.7 + (i * 53 % 50) / 100}s"></i>`).join("");
  const [r1, r2, r3, r4] = T(["Kaptan", "Ejderha", "Aslan", "Astronot"], ["Captain", "Dragon", "Lion", "Astronaut"]);
  return `<div class="rol"><span>🎤 ${r1}</span><span>🎤 ${r2}</span></div><div class="dalga">${bar}</div><div class="rol"><span>🎤 ${r3}</span><span>🎤 ${r4}</span></div>`;
}
function sahneKaynas() {
  const k = [[90, 70, "🦊", "#ffb86b"], [250, 40, "🐼", "#9ad0ff"], [410, 80, "🐸", "#a6e3a1"], [150, 200, "🐱", "#f5a3c7"], [350, 210, "🦉", "#d9b8ff"]];
  const c = [[0, 3, "🎮"], [1, 3, "🎨"], [1, 4, "⚽"], [2, 4, "🎵"], [0, 1, "📚"]];
  return `<svg viewBox="0 0 500 270" aria-hidden="true">
    ${c.map(([a, b, e]) => { const [x1, y1] = k[a], [x2, y2] = k[b]; return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#141414" stroke-width="2" stroke-dasharray="5 6"/><text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 + 6}" font-size="20" text-anchor="middle">${e}</text>`; }).join("")}
    ${k.map(([x, y, e, r]) => `<circle cx="${x}" cy="${y}" r="34" fill="${r}" stroke="#141414" stroke-width="3"/><text x="${x}" y="${y + 12}" font-size="34" text-anchor="middle">${e}</text>`).join("")}
  </svg>`;
}
function sahneDdnet() {
  const od = [["+1", 22, 30, 0], [T("İSABET", "HIT"), 64, 26, .8], ["+1", 40, 64, 1.6]];
  return `<div class="tee"></div>${od.map(([t, x, y, d]) => `<div class="od" style="left:${x}%;top:${y}%;animation-delay:${d}s">${t}</div>`).join("")}<div class="kural">${T("otomatik nişan YOK · hile YOK", "NO aim-bot · NO cheats")}</div>`;
}
function sahneHard() {
  const b = Array.from({length: 90}, (_, i) => {
    const drop = i > 55 && i < 80, y = drop ? 55 + (i * 37 % 45) : 12 + (i * 29 % 38);
    return `<i class="${drop ? "d" : ""}" style="height:${y}%"></i>`;
  }).join("");
  return `<div class="et">BUILD-UP → DROP</div><div class="vurus"></div><div class="dalga">${b}</div>`;
}
const CIZIM = {usta: [sahneUsta, "c-usta"], masa: [sahneMasa, "c-masa"], ses: [sahneSes, "c-ses"], kaynas: [sahneKaynas, "c-kaynas"], ddnet: [sahneDdnet, "c-ddnet"], hard: [sahneHard, "c-hard"]};

function esc(s) { return String(s).replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c])); }

// ---------------------------------------------------------------- pencere
const perde = document.createElement("div"); perde.className = "perde"; perde.hidden = true;
const pencere = document.createElement("div");
pencere.className = "pencere"; pencere.hidden = true;
pencere.setAttribute("role", "dialog"); pencere.setAttribute("aria-modal", "true"); pencere.setAttribute("aria-labelledby", "p-baslik");
document.body.append(perde, pencere);
let acanEleman = null, gecmisteYeni = false, ipucuZaman = null;
const azHareket2 = matchMedia("(prefers-reduced-motion: reduce)").matches;
const sira = PROJELER.map(p => p.ad).filter(a => HIKAYE[a]);

function hikayeHTML(p) {
  const h = HIKAYE[p.ad];
  const sahneImg = typeof h.sahne === "object" ? h.sahne.img : null;
  const sahneNot = (h.gorseller || []).find(([src]) => src === sahneImg)?.[1];
  const gorsel = (h.gorseller || []).filter(([src]) => src !== sahneImg);
  const not = n => n ? `<span class="h-not">${esc(n)}</span>` : "";
  let sahne;
  if (typeof h.sahne === "string") { const [f, sinif] = CIZIM[h.sahne]; sahne = `<div class="h-sahne ${sinif}">${f()}${not(h.not)}</div>`; }
  else if (h.sahne.tam) sahne = `<div class="h-sahne"><img class="tam" src="${h.sahne.img}" alt="${esc(h.sahne.alt)}">${not(sahneNot)}</div>`;
  else sahne = `<div class="h-sahne c-zemin" style="--renk:${p.t === "yz" ? "#1d3557" : p.t === "oyun" ? "#3a1f5c" : "#c2410c"}"><div class="tarayici"><div class="bar"><i></i><i></i><i></i></div><img src="${h.sahne.img}" alt="${esc(h.sahne.alt)}"></div>${not(sahneNot)}</div>`;
  const sonrakiAd = sira[(sira.indexOf(p.ad) + 1) % sira.length], sonraki = HIKAYE[sonrakiAd];
  return `${sahne}
  <div class="h-govde">
    <div class="h-et h-blok"><span class="damga ${p.damga[1]}">${esc(p.damga[0])}</span>${p.alt.map(a => `<span class="mono" style="font-size:.75rem;color:var(--soluk)">${esc(a)}</span>`).join("<span aria-hidden='true' style='color:var(--soluk)'>·</span>")}</div>
    <h2 class="h-blok">${esc(p.ad)}</h2>
    <p class="h-soru h-blok">${esc(h.soru)}</p>
    <div class="h-sayilar h-blok">${h.sayilar.map(([b, s]) => `<div><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join("")}</div>
    <div class="h-blok"><h3>${T("Ne yaptım", "What I built")}</h3>${h.yaptim.map(t => `<p>${esc(t)}</p>`).join("")}</div>
    ${gorsel.map(([src, alt]) => `<figure class="h-blok"><img src="${src}" alt="${esc(alt)}" loading="lazy"><figcaption>${esc(alt)}</figcaption></figure>`).join("")}
    ${h.ogrendim ? `<div class="h-ogren h-blok"><h3>${T("Ne öğrendim", "What I learned")}</h3><p>${esc(h.ogrendim)}</p></div>` : ""}
    <div class="h-linkler h-blok">${(h.link || []).map(([y, u]) => `<a class="p-dugme sari" href="${u}" target="_blank" rel="noopener">${esc(y)}</a>`).join("")}<button class="p-dugme" data-paylas="${h.id}">🔗 ${T("Bağlantıyı kopyala", "Copy link")}</button></div>
    <button class="h-sonraki h-blok" data-sonraki="${sonraki.id}"><span><small>${T("Sonraki proje", "Next project")}</small><b>${esc(sonrakiAd)}</b></span><span class="ok" aria-hidden="true">→</span></button>
  </div>`;
}

function ac(tur, id, yeni = true) {
  let baslik, icerik, ust = "";
  if (tur === "site") {
    if (!SITELER[id]) return;
    baslik = `${SITELER[id]}<small>${T("canlı site", "live site")}</small>`;
    ust = `<a class="p-dugme p-gizle-mobil" href="https://github.com/birtohum/${id}" target="_blank" rel="noopener">${T("Kod", "Code")} ↗</a>
      <a class="p-dugme sari" href="https://birtohum.github.io/${id}/" target="_blank" rel="noopener">${T("Yeni sekmede", "New tab")} ↗</a>`;
    icerik = `<div class="p-icerik cerceve"><div class="p-yukleniyor">${T("Site açılıyor…", "Opening the site…")}</div>
      <iframe src="https://birtohum.github.io/${id}/" title="${esc(SITELER[id])}" loading="eager" allow="geolocation; clipboard-write"></iframe>
      <div class="p-ipucu">${T("Bu gerçek site: içinde dolaşabilirsin", "This is the real site: go ahead and explore")}</div></div>`;
  } else {
    const p = PROJELER.find(x => HIKAYE[x.ad] && HIKAYE[x.ad].id === id);
    if (!p) return;
    baslik = `${esc(p.ad)}<small>${T("proje hikâyesi", "project story")}</small>`;
    ust = `<button class="p-dugme p-gizle-mobil" data-yon="-1" aria-label="${T("Önceki proje", "Previous project")}">←</button><button class="p-dugme p-gizle-mobil" data-yon="1" aria-label="${T("Sonraki proje", "Next project")}">→</button>`;
    icerik = `<div class="p-icerik">${hikayeHTML(p)}</div>`;
  }
  pencere.innerHTML = `<div class="p-cubuk"><div class="p-baslik" id="p-baslik">${baslik}</div>${ust}<button class="p-dugme" data-kapat aria-label="${T("Kapat", "Close")}">✕</button></div>${icerik}`;
  pencere.dataset.tur = tur; pencere.dataset.id = id;
  if (pencere.hidden) {
    acanEleman = document.activeElement;
    perde.hidden = pencere.hidden = false; document.body.classList.add("kilit");
    requestAnimationFrame(() => { perde.classList.add("acik"); pencere.classList.add("acik"); });
  }
  sayacOlay(`${tur}/${id}`, tur === "site" ? SITELER[id] : id);
  const hedef = `#${tur}/${id}`;
  if (yeni && location.hash !== hedef) { history.pushState({pencere: true}, "", hedef); gecmisteYeni = true; }
  pencere.querySelector("[data-kapat]").focus({preventScroll: true});
  const cerceve = pencere.querySelector("iframe");
  if (cerceve) {
    cerceve.addEventListener("load", () => pencere.querySelector(".p-yukleniyor")?.remove(), {once: true});
    clearTimeout(ipucuZaman); ipucuZaman = setTimeout(() => pencere.querySelector(".p-ipucu")?.classList.add("gizli"), 3500);
  }
  const kutu = pencere.querySelector(".p-icerik");
  kutu.scrollTop = 0;
  const bloklar = pencere.querySelectorAll(".h-blok");
  if (azHareket2) bloklar.forEach(b => b.classList.add("acik"));
  else {
    const g = new IntersectionObserver(gs => gs.forEach(x => { if (x.isIntersecting) { x.target.classList.add("acik"); g.unobserve(x.target); } }), {root: kutu, threshold: .08});
    bloklar.forEach(b => g.observe(b));
  }
}

function kapat(gecmisten = false) {
  if (pencere.hidden) return;
  perde.classList.remove("acik"); pencere.classList.remove("acik"); document.body.classList.remove("kilit");
  setTimeout(() => { perde.hidden = pencere.hidden = true; pencere.innerHTML = ""; }, azHareket2 ? 0 : 300);
  if (!gecmisten) {
    if (gecmisteYeni) history.back(); else history.replaceState(null, "", location.pathname + location.search);
  }
  gecmisteYeni = false;
  acanEleman?.focus?.({preventScroll: true});
}

function komsu(yon) {
  const p = PROJELER.find(x => HIKAYE[x.ad]?.id === pencere.dataset.id);
  const ad = sira[(sira.indexOf(p.ad) + yon + sira.length) % sira.length];
  ac("proje", HIKAYE[ad].id, false);
  history.replaceState({pencere: true}, "", `#proje/${HIKAYE[ad].id}`);
}

pencere.addEventListener("click", e => {
  if (e.target.closest("[data-kapat]")) return kapat();
  const y = e.target.closest("[data-yon]"); if (y) return komsu(+y.dataset.yon);
  const pay = e.target.closest("[data-paylas]");
  if (pay) {  // /p/<id>/ sayfası paylaşımda kendi kartını gösterir, ziyaretçiyi buraya geri yollar
    const adres = `https://birtohum.github.io/p/${pay.dataset.paylas}/${T("", "?dil=en")}`;
    const bitti = () => { pay.textContent = T("✓ Kopyalandı", "✓ Copied"); setTimeout(() => pay.textContent = `🔗 ${T("Bağlantıyı kopyala", "Copy link")}`, 2200); };
    if (navigator.share && matchMedia("(pointer: coarse)").matches) navigator.share({url: adres}).catch(() => {});
    else navigator.clipboard?.writeText(adres).then(bitti, () => prompt(T("Bağlantı:", "Link:"), adres));
    return;
  }
  const s = e.target.closest("[data-sonraki]");
  if (s) { ac("proje", s.dataset.sonraki, false); history.replaceState({pencere: true}, "", `#proje/${s.dataset.sonraki}`); }
});
perde.addEventListener("click", () => kapat());
document.addEventListener("keydown", e => {
  if (pencere.hidden) return;
  if (e.key === "Escape") { e.preventDefault(); kapat(); }
  else if (pencere.dataset.tur === "proje" && (e.key === "ArrowRight" || e.key === "ArrowLeft") && !e.target.closest("input,textarea")) komsu(e.key === "ArrowRight" ? 1 : -1);
  else if (e.key === "Tab") {  // odak pencerede kalsın
    const f = [...pencere.querySelectorAll("a[href],button,iframe")].filter(x => x.offsetParent !== null);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
    else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
  }
});
function adrestenAc() {
  const m = location.hash.match(/^#(proje|site)\/([\w-]+)$/);
  if (m) ac(m[1], m[2], false); else kapat(true);
}
addEventListener("popstate", () => { gecmisteYeni = false; adrestenAc(); });
addEventListener("hashchange", () => { if (!location.hash.startsWith("#" + pencere.dataset.tur + "/" + pencere.dataset.id)) adrestenAc(); });

// ---------------------------------------------------------------- kartları bağla
[...document.querySelectorAll("#izgara .proje")].forEach((kart, i) => {
  const p = PROJELER[i], h = HIKAYE[p.ad]; if (!h) return;
  const d = document.createElement("button");
  d.className = "ac"; d.innerHTML = `${T("Hikâyesini aç", "Open the story")} <span aria-hidden="true">→</span>`;
  d.setAttribute("aria-label", `${p.ad}: ${T("hikâyesini aç", "open the story")}`);
  const linkler = kart.querySelector(".linkler");
  linkler ? linkler.before(d) : kart.append(d);
  kart.addEventListener("click", e => { if (e.target.closest("a")) return; ac("proje", h.id); });
});
document.querySelectorAll("a.site").forEach(a => {
  const id = (a.getAttribute("href").match(/github\.io\/([\w-]+)/) || [])[1];
  a.addEventListener("click", e => {
    if (!id || e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;  // yeni sekme isteyen bırakılsın
    e.preventDefault(); ac("site", id);
  });
});
if (location.hash) adrestenAc();

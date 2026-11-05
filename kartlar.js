"use strict";
// Canlı site kartlarına, ekran görüntüsü yerine sitenin kendi verisinden çizilen hareketli görseller.
// Her görsel kart ekrana yaklaşınca yüklenir; veri alınamazsa kartta ekran görüntüsü kalır.
(() => {
  const SITE = "https://birtohum.github.io";
  const AZ_HAREKET = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NS = "http://www.w3.org/2000/svg";
  const sayi = (n, b = 0) => n.toLocaleString("tr-TR", {minimumFractionDigits: b, maximumFractionDigits: b});
  const json = (u) => fetch(u, {cache: "no-cache"}).then(r => { if (!r.ok) throw new Error(u); return r.json(); });
  const AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  const EN = () => document.documentElement.lang === "en";

  function yerlestir(kart, dugum, etiket) {
    const resim = kart.querySelector(".resim");
    resim.classList.add("canli-gorsel");
    resim.replaceChildren(dugum);
    if (etiket) { const e = document.createElement("span"); e.className = "gorsel-not"; e.textContent = etiket; resim.append(e); }
  }

  // ---------------------------------------------------------------- Denizler: ısınma şeritleri
  async function deniz(kart) {
    const o = await json(`${SITE}/denizler-isiniyor/veri/ozet.json`);
    const yillar = Object.entries(o.tum_kiyi.yillik).map(([y, t]) => [+y, t]).filter(([y]) => y < new Date().getFullYear());
    const ts = yillar.map(x => x[1]), ort = ts.reduce((a, b) => a + b) / ts.length;
    const sap = Math.max(...ts.map(t => Math.abs(t - ort)));
    // Koyu maviden koyu kırmızıya 8 durak; ortalamadan sapma -1…+1 aralığına yayılır
    const PALET = [[8, 48, 107], [33, 113, 181], [107, 174, 214], [198, 219, 239], [254, 224, 210], [252, 146, 114], [222, 45, 38], [103, 0, 13]];
    const renk = (t) => {
      const k = Math.max(-1, Math.min(1, (t - ort) / sap));
      const f = (k + 1) / 2 * (PALET.length - 1), i = Math.min(PALET.length - 2, Math.floor(f)), u = f - i;
      return `rgb(${PALET[i].map((v, n) => Math.round(v + (PALET[i + 1][n] - v) * u)).join(",")})`;
    };
    const kap = document.createElement("div"); kap.className = "seritler";
    yillar.forEach(([y, t], i) => {
      const s = document.createElement("i");
      s.style.background = renk(t); s.style.animationDelay = `${i * 28}ms`;
      s.title = `${y}: ${sayi(t, 2)} °C`; s.dataset.y = y; s.dataset.t = sayi(t, 1);
      kap.append(s);
    });
    const bilgi = document.createElement("div"); bilgi.className = "serit-bilgi";
    const ilk = yillar[0], son = yillar.at(-1);
    bilgi.innerHTML = `<span>${ilk[0]}</span><b></b><span>${son[0]}</span>`;
    const b = bilgi.querySelector("b");
    const yaz = (s) => { b.textContent = s ? `${s.dataset.y}: ${s.dataset.t} °C` : (EN() ? "One stripe per year: Turkey's coasts, yearly mean" : "Her şerit bir yıl: kıyıların yıllık ortalaması"); };
    yaz();
    kap.addEventListener("pointerover", e => e.target.tagName === "I" && yaz(e.target));
    kap.addEventListener("pointerleave", () => yaz());
    const sar = document.createElement("div"); sar.className = "serit-kap"; sar.append(bilgi, kap);
    yerlestir(kart, sar);
  }

  // ---------------------------------------------------------------- Yangınlar: 2021, ay ay
  async function yangin(kart) {
    const v = await json("veri/kart-yangin.json");
    const BATI = 25.6, DOGU = 44.9, GUNEY = 35.8, KUZEY = 42.2, KX = Math.cos(39 * Math.PI / 180);
    const cv = document.createElement("canvas"); cv.className = "yangin-cv";
    const kap = document.createElement("div"); kap.className = "yangin-kap";
    const ay = document.createElement("div"); ay.className = "yangin-ay";
    kap.append(cv, ay);
    yerlestir(kart, kap, EN() ? "Forest and shrubland hot spots, 2021 · NASA FIRMS" : "Orman ve makilikte sıcak noktalar, 2021 · NASA FIRMS");
    const ayAdi = (i) => EN() ? new Date(2021, i, 1).toLocaleString("en", {month: "long"}) : AYLAR[i];

    let W, H, olcek, px, py, harita, c;
    function boyutla() {
      const dpr = devicePixelRatio || 1;
      W = kap.clientWidth; H = kap.clientHeight;
      olcek = Math.min(W / ((DOGU - BATI) * KX), H / (KUZEY - GUNEY)) * 0.94;
      const ox = (W - (DOGU - BATI) * KX * olcek) / 2, oy = (H - (KUZEY - GUNEY) * olcek) / 2;
      px = (x) => ox + (x - BATI) * KX * olcek; py = (y) => oy + (KUZEY - y) * olcek;
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + "px"; cv.style.height = H + "px";
      c = cv.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0);
      harita = document.createElement("canvas"); harita.width = cv.width; harita.height = cv.height;
      const h = harita.getContext("2d"); h.setTransform(dpr, 0, 0, dpr, 0, 0);
      h.fillStyle = "#2a211b"; h.strokeStyle = "#4a3b30"; h.lineWidth = 0.5;
      for (const r of v.sinir) { h.beginPath(); r.forEach(([x, y], i) => i ? h.lineTo(px(x), py(y)) : h.moveTo(px(x), py(y))); h.closePath(); h.fill(); h.stroke(); }
    }
    // noktalar ay sırasına göre; her kare biraz daha
    const sirali = v.n.slice().sort((a, b) => a[2] - b[2]);
    let goster = 0, bekle = 0;
    function ciz() {
      c.clearRect(0, 0, W, H); c.drawImage(harita, 0, 0, W, H);
      const r = Math.max(1.2, W / 420);
      const sonAy = goster ? sirali[Math.min(goster, sirali.length) - 1][2] : 1;
      for (let i = 0; i < Math.min(goster, sirali.length); i++) {
        const [x, y, a] = sirali[i];
        const taze = a === sonAy && goster < sirali.length;
        c.fillStyle = taze ? "#ffd27a" : "#ff6a1a"; c.globalAlpha = taze ? 1 : 0.75;
        c.fillRect(px(x / 100) - r, py(y / 100) - r, r * 2, r * 2);
      }
      c.globalAlpha = 1;
      const n = Math.min(goster, sirali.length);
      ay.innerHTML = `<b>${ayAdi(sonAy - 1)} 2021</b><span>${sayi(n)} ${EN() ? "points" : "nokta"}</span>`;
    }
    boyutla();
    if (AZ_HAREKET) { goster = sirali.length; ciz(); return; }
    let gorunur = true;
    new IntersectionObserver(([e]) => { gorunur = e.isIntersecting; }).observe(kap);
    (function adim() {
      if (gorunur) {
        if (goster >= sirali.length) { if (++bekle > 150) { goster = 0; bekle = 0; } }
        else {
          // Temmuz–Ağustos'ta yavaşla: Manavgat ve Marmaris o günlerde
          const a = sirali[goster][2];
          goster += a === 7 || a === 8 ? 6 : 14;
        }
        ciz();
      }
      requestAnimationFrame(adim);
    })();
    addEventListener("resize", () => { boyutla(); ciz(); });
  }

  // ---------------------------------------------------------------- Diziler: 144 sayfadan biri + diller
  async function dizi(kart) {
    const o = await json(`${SITE}/turk-dizileri-dunyada/veri/ozet.json`);
    const ad = Object.fromEntries(o.diziler.map(d => [d.qid, EN() && d.en ? d.en : d.ad]));
    const ar = o.diller.find(d => d.kod === "ar");
    const bir = ar && ar.ppm12 ? Math.round(1e6 / ar.ppm12) : 144;
    const kap = document.createElement("div"); kap.className = "dizi-kap";
    const izgara = document.createElement("div"); izgara.className = "dizi-izgara";
    const n = Math.min(bir, 400), hedef = Math.floor(n * 0.62);
    for (let i = 0; i < n; i++) { const s = document.createElement("i"); if (i === hedef) s.className = "o"; izgara.append(s); }
    const serit = document.createElement("div"); serit.className = "dizi-serit";
    const diller = o.diller.filter(d => d.kod !== "tr" && d.ilk12 && d.ilk12.length && d.t12 > 2e5).sort((a, b) => b.t12 - a.t12).slice(0, 14);
    serit.innerHTML = `<span class="dizi-ust">${EN() ? "Most-read series in the last 12 months" : "Son 12 ayda en çok okunan dizi"}</span><div class="dizi-dil"></div>`;
    kap.append(izgara, serit);
    yerlestir(kart, kap);
    const alan = serit.querySelector(".dizi-dil");
    let i = 0;
    const goster = () => {
      const d = diller[i % diller.length]; i++;
      alan.classList.remove("gir"); void alan.offsetWidth;
      alan.innerHTML = `<b>${d.ad}</b><span>${ad[d.ilk12[0][0]] || ""}</span><small>${sayi(d.ilk12[0][1])} ${EN() ? "views" : "okuma"}</small>`;
      alan.classList.add("gir");
    };
    goster();
    if (!AZ_HAREKET) setInterval(() => { if (!document.hidden) goster(); }, 2600);
  }

  // ---------------------------------------------------------------- Gökyüzü: geçen istasyon (temsili)
  function gok(kart) {
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 400 170"); svg.setAttribute("preserveAspectRatio", "xMidYMid slice"); svg.classList.add("gok-svg");
    let t = 7, yildiz = "";
    const r = () => (t = (t * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 90; i++) {
      const x = r() * 400, y = r() * 150, b = r();
      yildiz += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.4 + b * 1.1).toFixed(2)}" fill="#fff" opacity="${(0.25 + b * 0.6).toFixed(2)}"${b > 0.8 ? ` class="pirilti" style="animation-delay:${(r() * 4).toFixed(1)}s"` : ""}/>`;
    }
    const sehir = Array.from({length: 40}, (_, i) => { const h = 6 + r() * 16; return `<rect x="${i * 10}" y="${170 - h}" width="${8 + r() * 4}" height="${h}" fill="#05080f"/>`; }).join("");
    svg.innerHTML = `<defs><linearGradient id="gk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050913"/><stop offset="1" stop-color="#16233d"/></linearGradient>
      <radialGradient id="gp"><stop offset="0" stop-color="#ffe7a8"/><stop offset="1" stop-color="#ffe7a8" stop-opacity="0"/></radialGradient></defs>
      <rect width="400" height="170" fill="url(#gk)"/>${yildiz}
      <path id="yay" d="M 18 160 Q 200 -20 382 160" fill="none" stroke="#f2b84b" stroke-width="1" stroke-dasharray="3 5" opacity=".55"/>
      <path class="iz" d="M 18 160 Q 200 -20 382 160" fill="none" stroke="#f2b84b" stroke-width="2" pathLength="1"/>
      <g class="iss"><circle r="9" fill="url(#gp)"/><circle r="2.6" fill="#fff8e1"/></g>
      ${sehir}<text x="12" y="150" fill="#8ea0bf" font-size="9" font-family="IBM Plex Mono,monospace">B</text><text x="380" y="150" fill="#8ea0bf" font-size="9" font-family="IBM Plex Mono,monospace">D</text>`;
    yerlestir(kart, svg, EN() ? "Illustration · the site computes real passes for your city" : "Temsili çizim · gerçek geçişleri site şehrin için hesaplıyor");
    // İstasyon ve izi aynı saatle: 9 saniyede bir geçiş
    const yay = svg.querySelector("#yay"), iz = svg.querySelector(".iz"), iss = svg.querySelector(".iss");
    const uzun = yay.getTotalLength(), SURE = 9000;
    const koy = (u) => { const p = yay.getPointAtLength(u * uzun); iss.setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`); iz.style.strokeDashoffset = 1 - u; };
    if (AZ_HAREKET) { koy(0.5); return; }
    const bas = performance.now();
    (function adim(t) { koy(((t - bas) % SURE) / SURE); requestAnimationFrame(adim); })(bas);
  }

  const KARTLAR = {"s-deniz": deniz, "s-yangin": yangin, "s-dizi": dizi, "s-uydu": gok};
  const gozcu = new IntersectionObserver((girdiler) => {
    for (const g of girdiler) {
      if (!g.isIntersecting) continue;
      gozcu.unobserve(g.target);
      const sinif = Object.keys(KARTLAR).find(s => g.target.classList.contains(s));
      Promise.resolve().then(() => KARTLAR[sinif](g.target)).catch(() => { /* ekran görüntüsü kalır */ });
    }
  }, {rootMargin: "300px 0px"});
  for (const s of Object.keys(KARTLAR)) { const k = document.querySelector(`a.site.${s}`); if (k) gozcu.observe(k); }
})();

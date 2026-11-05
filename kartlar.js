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
  let _harita = null;
  const harita = () => _harita || (_harita = json("veri/kart-harita.json"));

  // Coğrafi kutuyu kabın içine sığdıran izdüşüm (orta enlemde boylam kısaltılır)
  function izdusum(W, H, [bati, guney, dogu, kuzey], pay = 0.94) {
    const kx = Math.cos(((guney + kuzey) / 2) * Math.PI / 180);
    const olcek = Math.min(W / ((dogu - bati) * kx), H / (kuzey - guney)) * pay;
    const ox = (W - (dogu - bati) * kx * olcek) / 2, oy = (H - (kuzey - guney) * olcek) / 2;
    return {x: (lon) => ox + (lon - bati) * kx * olcek, y: (lat) => oy + (kuzey - lat) * olcek};
  }
  function tuval(kap) {
    const cv = document.createElement("canvas"); cv.className = "kart-cv"; kap.append(cv);
    return () => {
      const dpr = devicePixelRatio || 1, W = kap.clientWidth, H = kap.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + "px"; cv.style.height = H + "px";
      const c = cv.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0);
      return {c, W, H};
    };
  }
  function dongu(kap, kare) {   // yalnız kart görünürken çizer
    let gorunur = true;
    new IntersectionObserver(([e]) => { gorunur = e.isIntersecting; }).observe(kap);
    (function adim(t) { if (gorunur && !document.hidden) kare(t); requestAnimationFrame(adim); })(performance.now());
  }
  // halkalar: [[x,y]…] listesi ya da [plaka, [[x,y]…]] listesi; renk(plaka) verilirse her il kendi rengiyle
  function ilCiz(c, halkalar, p, renk) {
    for (const r of halkalar) {
      const plaka = typeof r[0] === "number" ? r[0] : null, h = plaka === null ? r : r[1];
      if (renk) c.fillStyle = renk(plaka);
      c.beginPath(); h.forEach(([x, y], i) => i ? c.lineTo(p.x(x), p.y(y)) : c.moveTo(p.x(x), p.y(y))); c.closePath(); c.fill(); c.stroke();
    }
  }

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
    const v = await harita();
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
      ilCiz(h, v.sinir, {x: px, y: py});
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

  // ---------------------------------------------------------------- Barajlar: 10 depo
  async function baraj(kart) {
    const o = await json(`${SITE}/barajlar-uzaydan/veri/ozet.json`);
    const kap = document.createElement("div"); kap.className = "baraj-kap";
    kap.innerHTML = o.barajlar.filter(b => b.son).map((b, i) => {
      const g = b.gecen_yil && b.gecen_yil.yuzde;
      const ipucu = `${b.ad}: %${sayi(b.son.yuzde)}` + (g != null ? (EN() ? ` (a year ago %${sayi(g)})` : ` (bir yıl önce %${sayi(g)})`) : "");
      return `<div class="depo" title="${ipucu}"><div class="depo-ic"><i class="su" style="--y:${b.son.yuzde};animation-delay:${i * 90}ms"></i>` +
        (g != null ? `<b class="gecen" style="--g:${g}"></b>` : "") +
        `</div><span class="depo-y">%${sayi(b.son.yuzde)}</span><span class="depo-ad">${b.ad}</span></div>`;
    }).join("");
    yerlestir(kart, kap, EN() ? "Water surface vs. fullest, by satellite · line: a year ago" : "Su yüzeyi, en dolu hâline göre · çizgi: bir yıl önce");
  }

  // ---------------------------------------------------------------- Deprem: son günler, zaman sırasıyla
  async function deprem(kart) {
    const [v, d] = await Promise.all([harita(), json(`${SITE}/turkiye-sallandi/veri/son.json`)]);
    const A = Object.fromEntries(d.alanlar.map((a, i) => [a, i]));
    const ol = d.olaylar.map(o => ({t: o[A.t], la: o[A.enlem], lo: o[A.boylam], m: o[A.m]})).filter(o => o.m != null).sort((a, b) => a.t - b.t);
    const bas = ol[0].t, son = ol.at(-1).t, gun = Math.round((son - bas) / 86400);
    const kap = document.createElement("div"); kap.className = "deprem-kap";
    const etiket = document.createElement("div"); etiket.className = "deprem-saat"; kap.append(etiket);
    yerlestir(kart, kap, EN() ? `Last ${gun} days, sped up · AFAD, Kandilli, EMSC` : `Son ${gun} gün, hızlandırılmış · AFAD, Kandilli, EMSC`);
    const boyutla = tuval(kap);
    let c, W, H, p, zemin;
    const hazirla = () => {
      ({c, W, H} = boyutla()); p = izdusum(W, H, [25.6, 35.8, 44.9, 42.2]);
      zemin = document.createElement("canvas"); zemin.width = c.canvas.width; zemin.height = c.canvas.height;
      const z = zemin.getContext("2d"); z.setTransform(devicePixelRatio || 1, 0, 0, devicePixelRatio || 1, 0, 0);
      z.fillStyle = "#ebe4d6"; z.strokeStyle = "#d3c9b7"; z.lineWidth = 0.5;
      ilCiz(z, v.sinir, p);
    };
    hazirla(); addEventListener("resize", hazirla);
    const SURE = 14000, SONRA = 2500, OMUR = 0.06;   // 14 sn'de bütün dönem; her halka dönemin %6'sı kadar yayılır
    const fmt = (t) => new Date(t * 1000).toLocaleString(EN() ? "en-GB" : "tr-TR", {day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul"});
    const ciz = (u) => {
      c.clearRect(0, 0, W, H); c.drawImage(zemin, 0, 0, W, H);
      const simdi = bas + (son - bas) * Math.min(u, 1);
      let n = 0;
      for (const o of ol) {
        if (o.t > simdi) break;
        n++;
        const yas = (simdi - o.t) / ((son - bas) * OMUR);
        const x = p.x(o.lo), y = p.y(o.la), r0 = 0.8 + Math.max(0, o.m) ** 1.6 * 0.9, buyuk = o.m >= 3;
        c.fillStyle = buyuk ? "rgba(201,60,32,.85)" : "rgba(60,52,44,.33)";
        c.beginPath(); c.arc(x, y, buyuk ? r0 * 0.6 : 1.1, 0, 7); c.fill();
        if (yas < 1) {
          c.strokeStyle = buyuk ? `rgba(201,60,32,${1 - yas})` : `rgba(60,52,44,${0.6 * (1 - yas)})`;
          c.lineWidth = buyuk ? 1.6 : 0.8;
          c.beginPath(); c.arc(x, y, r0 + yas * r0 * 3, 0, 7); c.stroke();
        }
      }
      etiket.innerHTML = `<b>${fmt(simdi)}</b><span>${sayi(n)} ${EN() ? "earthquakes" : "deprem"}</span>`;
    };
    if (AZ_HAREKET) { ciz(1); return; }
    const t0 = performance.now();
    dongu(kap, (t) => ciz(((t - t0) % (SURE + SONRA)) / SURE));
  }

  // ---------------------------------------------------------------- Uçaklar: son ölçümdeki konumlar
  async function ucak(kart) {
    const [v, d] = await Promise.all([harita(), json(`${SITE}/istanbul-semalari/veri/son.json`)]);
    const kap = document.createElement("div"); kap.className = "ucak-kap";
    const etiket = document.createElement("div"); etiket.className = "ucak-sayi"; kap.append(etiket);
    const dk = Math.max(0, Math.round((Date.now() / 1000 - d.t) / 60));
    yerlestir(kart, kap, EN() ? `Positions ${dk} min ago · OpenSky` : `${dk} dakika önceki konumlar · OpenSky`);
    const boyutla = tuval(kap);
    const ucaklar = d.ucaklar.filter(u => u.la && u.lo && !u.g);
    const ciz = () => {
      const {c, W, H} = boyutla(), p = izdusum(W, H, [27.9, 40.75, 29.95, 41.62], 1.02);
      c.fillStyle = "#0b1422"; c.fillRect(0, 0, W, H);
      c.fillStyle = "#132238"; c.strokeStyle = "#2a4466"; c.lineWidth = 1;
      ilCiz(c, v.istanbul, p);
      for (const u of ucaklar) {
        const iniyor = u.v != null && u.v < -1, renk = iniyor ? "#7cc4ff" : "#ffcf5a";
        c.save(); c.translate(p.x(u.lo), p.y(u.la)); c.rotate((u.y || 0) * Math.PI / 180);
        c.strokeStyle = renk; c.globalAlpha = 0.35; c.lineWidth = 1.2;   // arkadaki iz: yer hızıyla orantılı
        c.beginPath(); c.moveTo(0, 4); c.lineTo(0, 4 + Math.min(40, (u.h || 300) / 20)); c.stroke();
        c.globalAlpha = u.i ? 1 : 0.4; c.fillStyle = renk;   // il sınırı dışındakiler soluk
        c.beginPath(); c.moveTo(0, -6); c.lineTo(4.5, 4); c.lineTo(0, 2); c.lineTo(-4.5, 4); c.closePath(); c.fill();
        c.restore();
      }
    };
    const icerde = ucaklar.filter(u => u.i).length;
    etiket.innerHTML = `<b>${icerde}</b><span>${EN() ? "aircraft over the province" : "uçak il sınırı içinde"}</span>` +
      `<small><i class="in"></i>${EN() ? "descending" : "alçalıyor"} <i></i>${EN() ? "climbing or cruising" : "yükseliyor ya da seyirde"}</small>`;
    ciz(); addEventListener("resize", ciz);
  }

  // ---------------------------------------------------------------- Tohum: eğitim boyunca gerçek çıktılar
  async function tohum(kart) {
    const anlar = await json("veri/kart-tohum.json");
    const kap = document.createElement("div"); kap.className = "tohum-kap";
    kap.innerHTML = `<div class="tohum-fidan"><svg viewBox="0 0 40 100" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
        <path class="govde" d="M20 100 C 19 80, 22 60, 20 5" stroke="#2f7a3d" stroke-width="3" fill="none" stroke-linecap="round" pathLength="1"/>
        <g class="yapraklar" fill="#3f8f4c"></g></svg></div>
      <div class="tohum-yazi"><div class="tohum-ust"><span>${EN() ? "step" : "adım"} <b class="t-adim">0</b></span><span>${EN() ? "real words" : "gerçek kelime"} <b class="t-oran">%0</b></span></div>
        <div class="tohum-cubuk"><i></i></div><div class="tohum-metin"></div></div>`;
    yerlestir(kart, kap, EN() ? "Tohum's real outputs during training, each starting with \"Türkiye\"" : "Tohum'un eğitim sırasındaki gerçek çıktıları, hepsi \"Türkiye\" ile başlıyor");
    const govde = kap.querySelector(".govde"), yap = kap.querySelector(".yapraklar"), metin = kap.querySelector(".tohum-metin");
    const enSon = anlar.at(-1).adim;
    yap.innerHTML = Array.from({length: 10}, (_, i) => {
      const y = 90 - i * 8.5, sag = i % 2;
      return `<ellipse cx="${sag ? 25 : 15}" cy="${y}" rx="5.5" ry="2.6" transform="rotate(${sag ? -30 : 30} ${sag ? 25 : 15} ${y})" opacity="0"/>`;
    }).join("");
    const yapraklar = [...yap.children];
    const goster = (k) => {
      const a = anlar[k], oran = (a.adim / enSon) ** 0.45;
      kap.querySelector(".t-adim").textContent = sayi(a.adim);
      kap.querySelector(".t-oran").textContent = "%" + sayi(a.gercek || 0);
      kap.querySelector(".tohum-cubuk i").style.width = `${Math.max(2, oran * 100)}%`;
      govde.style.strokeDasharray = "1 1"; govde.style.strokeDashoffset = String(1 - Math.max(0.05, oran));
      yapraklar.forEach((e, i) => { e.setAttribute("opacity", i < Math.round(oran * yapraklar.length) ? "1" : "0"); });
      return a.metin.replace(/\s+/g, " ").slice(0, 120);
    };
    if (AZ_HAREKET) { metin.textContent = goster(anlar.length - 1); return; }
    let k = 0, harf = 0, hedef = goster(0), bekle = 0;
    const KARE = 22;   // her 22 ms'de bir harf
    let son = 0;
    dongu(kap, (t) => {
      if (t - son < KARE) return; son = t;
      if (harf < hedef.length) { harf++; metin.textContent = hedef.slice(0, harf); return; }
      if (++bekle < 70) return;
      bekle = 0; harf = 0; k = (k + 1) % anlar.length; hedef = goster(k); metin.textContent = "";
    });
  }

  // ---------------------------------------------------------------- Hava: dünün PM2,5'i il il
  async function hava(kart) {
    const [v, d] = await Promise.all([harita(), json(`${SITE}/kac-sigara/veri/veri.json`)]);
    const SIG = d.kurallar.sigara_ugm3, deger = {};
    let gun = null;
    for (const il of d.iller) {
      let i = il.pm.length - 1; while (i >= 0 && il.pm[i] == null) i--;
      if (i >= 0 && il.pm.length - 1 - i <= 2) { deger[il.plaka] = il.pm[i]; gun = gun == null ? i : Math.max(gun, i); }
    }
    const tarih = new Date(Date.parse(d.ilk_gun + "T00:00:00Z") + gun * 864e5);
    const ADIM = [[0, "#e9eef2"], [5, "#d4e4d1"], [10, "#b9d7a8"], [15, "#f1d27a"], [25, "#eea152"], [35, "#de6a3c"], [55, "#a8322b"], [80, "#5e1a1f"]];
    const renk = (p) => { const x = deger[p]; if (x == null) return "#dfdcd5"; let c = ADIM[0][1]; for (const [s, r] of ADIM) if (x >= s) c = r; return c; };
    const kap = document.createElement("div"); kap.className = "hava-kap";
    const lejant = document.createElement("div"); lejant.className = "hava-lejant";
    lejant.innerHTML = `<b>${tarih.toLocaleDateString(EN() ? "en-GB" : "tr-TR", {day: "numeric", month: "long", timeZone: "UTC"})}</b>` +
      `<span class="hava-olcek">${[["#b9d7a8", "<10"], ["#f1d27a", "15+"], ["#eea152", "25+"], ["#de6a3c", "35+"], ["#a8322b", "55+"]].map(([r, t]) => `<i style="background:${r}"></i>${t}`).join("")}</span>` +
      `<small>PM2,5 µg/m³ · ${EN() ? "grey: too few readings" : "gri: yeterli ölçüm yok"}</small>`;
    kap.append(lejant);
    yerlestir(kart, kap, EN() ? "Yesterday's fine dust, province by province · Ministry stations" : "Dünkü ince toz, il il · Bakanlık istasyonları");
    const boyutla = tuval(kap);
    const ipucu = document.createElement("div"); ipucu.className = "harita-ipucu"; kap.append(ipucu);
    let p, W, H;
    const ciz = () => {
      const t = boyutla(); W = t.W; H = t.H; p = izdusum(W, H, [25.6, 35.8, 44.9, 42.2], 0.9);
      t.c.strokeStyle = "rgba(255,255,255,.7)"; t.c.lineWidth = 0.5; ilCiz(t.c, v.sinir, p, renk);
    };
    ciz(); addEventListener("resize", ciz);
    // üzerine gelince il ve değer: en yakın il merkezini bul (il merkezleri harita verisinde yok; halkaların ortalaması yeter)
    const merkez = {};
    for (const [pl, h] of v.sinir) { const m = merkez[pl] || (merkez[pl] = [0, 0, 0]); for (const [x, y] of h) { m[0] += x; m[1] += y; m[2]++; } }
    const adlar = Object.fromEntries(d.iller.map(i => [i.plaka, i.ad]));
    kap.addEventListener("pointermove", (e) => {
      const r = kap.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
      let en = null, ed = 1e9;
      for (const [pl, [sx, sy, n]] of Object.entries(merkez)) { const dx = p.x(sx / n) - mx, dy = p.y(sy / n) - my, dd = dx * dx + dy * dy; if (dd < ed) { ed = dd; en = +pl; } }
      if (ed > 900) { ipucu.hidden = true; return; }
      const x = deger[en];
      ipucu.hidden = false; ipucu.style.left = mx + "px"; ipucu.style.top = my + "px";
      ipucu.textContent = x == null ? `${adlar[en]}: —` : `${adlar[en]}: ${sayi(x, 1)} µg/m³ ≈ ${sayi(x / SIG, 1)} ${EN() ? "cig." : "sigara"}`;
    });
    kap.addEventListener("pointerleave", () => { ipucu.hidden = true; });
  }

  // ---------------------------------------------------------------- Gece: ışıklar yıl yıl
  async function gece(kart) {
    const [v, d] = await Promise.all([harita(), json(`${SITE}/turkiye-geceleri/veri/veri.json`)]);
    const yillar = d.ozet.yillar, yog = {};
    for (const il of d.iller) yog[+il.plaka] = il.isik.map(x => x / il.alan);
    const tum = Object.values(yog).flat().filter(x => x > 0), lo = Math.log(Math.min(...tum)), hi = Math.log(Math.max(...tum));
    const kap = document.createElement("div"); kap.className = "gece-kap";
    const yil = document.createElement("div"); yil.className = "gece-yil"; kap.append(yil);
    yerlestir(kart, kap, EN() ? "Night light per km², each province · VIIRS" : "Km² başına gece ışığı, il il · VIIRS uydusu");
    const boyutla = tuval(kap);
    let k = 0;
    const ciz = () => {
      const {c, W, H} = boyutla(), p = izdusum(W, H, [25.6, 35.8, 44.9, 42.2], 0.9);
      c.fillStyle = "#070a12"; c.fillRect(0, 0, W, H);
      c.strokeStyle = "rgba(255,255,255,.08)"; c.lineWidth = 0.5;
      ilCiz(c, v.sinir, p, (pl) => {
        const x = yog[pl] && yog[pl][k]; if (!x) return "#0d1220";
        const u = Math.max(0, Math.min(1, (Math.log(x) - lo) / (hi - lo)));
        return `rgb(${Math.round(20 + 235 * u)},${Math.round(22 + 180 * u ** 1.3)},${Math.round(40 + 60 * u ** 3)})`;
      });
      const top = d.ozet.turkiye[k] / d.ozet.turkiye[0];
      yil.innerHTML = `<b>${yillar[k]}</b><span>${EN() ? "Turkey total" : "Türkiye toplamı"}: ${k ? "×" + sayi(top, 2) : (EN() ? "baseline" : "başlangıç")}</span>`;
    };
    ciz(); addEventListener("resize", ciz);
    if (AZ_HAREKET) return;
    let son = 0;
    dongu(kap, (t) => { if (t - son < (k === yillar.length - 1 ? 2600 : 700)) return; son = t; k = (k + 1) % yillar.length; ciz(); });
  }

  // ---------------------------------------------------------------- Meclis: her yıl yükselen kelimeler
  async function meclis(kart) {
    const y = await json(`${SITE}/meclisin-dili/veri/yukselen.json`);
    const yillar = Object.keys(y).sort();
    const kap = document.createElement("div"); kap.className = "meclis-kap";
    kap.innerHTML = `<div class="meclis-yil"></div><div class="meclis-kelimeler"></div>`;
    yerlestir(kart, kap, EN() ? "Words that suddenly rose in parliament that year" : "O yıl Meclis'te birden yükselen kelimeler");
    const yilE = kap.querySelector(".meclis-yil"), kel = kap.querySelector(".meclis-kelimeler");
    let k = Math.max(0, yillar.indexOf("2001"));
    const goster = () => {
      const liste = (y[yillar[k]]["1"] || []).filter(w => w[0].length > 3).sort((a, b) => b[1] - a[1]).slice(0, 7);
      const en = liste[0] ? liste[0][1] : 1;
      yilE.textContent = yillar[k];
      kel.innerHTML = liste.map((w, i) => `<span style="--b:${(0.75 + 0.9 * Math.sqrt(w[1] / en)).toFixed(2)}em;animation-delay:${i * 120}ms">${w[0]} <small>×${sayi(w[1], 0)}</small></span>`).join("");
    };
    goster();
    if (AZ_HAREKET) return;
    setInterval(() => { if (!document.hidden) { k = (k + 1) % yillar.length; goster(); } }, 3200);
  }

  // ---------------------------------------------------------------- İETT: hat hat dakiklik
  async function iett(kart) {
    const o = await json(`${SITE}/iett-dakiklik/veri/ozet.json`);
    const tum = o.hatlar.filter(h => h.kalkis).sort((a, b) => b.dakik - a.dakik);
    const hatlar = tum.length > 7 ? tum.slice(0, 4).concat(tum.slice(-3)) : tum;   // en dakik 4 ve en az dakik 3
    const kap = document.createElement("div"); kap.className = "iett-kap";
    kap.innerHTML = hatlar.map((h, i) => `<div class="iett-satir"><b>${h.hat}</b><span class="iett-cubuk"><i style="--d:${h.dakik};animation-delay:${i * 80}ms"></i><i class="gec" style="--g:${h.gec5};--d:${h.dakik};animation-delay:${i * 80}ms"></i></span><em>%${h.dakik}</em></div>`).join("");
    yerlestir(kart, kap, EN() ? `On time (−1…+5 min) vs. 5+ min late · ${o.meta.gunler.length} days, early data` : `Zamanında (−1…+5 dk) ve 5 dk'dan fazla geç · ${o.meta.gunler.length} gün, ilk veriler`);
  }

  // ---------------------------------------------------------------- Mevzuat: yıl yıl düzenleme sayısı
  async function mevzuat(kart) {
    const o = await json(`${SITE}/mevzuat-haritasi/veri/ozet.json`);
    const yillar = o.yillar.filter(y => o.yil_tur[y]);
    const top = (y) => Object.values(o.yil_tur[y]).reduce((a, b) => a + b, 0);
    const en = Math.max(...yillar.map(top));
    const kap = document.createElement("div"); kap.className = "mevzuat-kap";
    kap.innerHTML = `<div class="mz-sutunlar">${yillar.map((y, i) => {
      const t = top(y), k = (o.yil_tur[y].kanun || 0) + (o.yil_tur[y].khk || 0) + (o.yil_tur[y].cbk || 0);
      return `<div class="mz-yil" title="${y}: ${sayi(t)} ${EN() ? "items" : "düzenleme"}, ${sayi(k)} ${EN() ? "laws/decrees" : "kanun/kararname"}" style="--h:${(t / en * 100).toFixed(1)};--k:${(k / t * 100).toFixed(1)};animation-delay:${i * 35}ms"><i></i></div>`;
    }).join("")}</div><div class="mz-eksen"><span>${yillar[0]}</span><span>${yillar.at(-1)}${o.son.slice(0, 4) === yillar.at(-1) ? (EN() ? " (so far)" : " (şimdiye dek)") : ""}</span></div>`;
    yerlestir(kart, kap, EN() ? "Items in the Official Gazette per year · red: laws and decrees" : "Resmî Gazete'de yıl yıl düzenleme · kırmızı: kanun ve kararnameler");
  }

  // ---------------------------------------------------------------- Enflasyon: hal fiyatları ve TÜFE
  async function enflasyon(kart) {
    const o = await json(`${SITE}/sepet-enflasyonu/veri/ozet.json`);
    const aylar = o.hal.aylar.filter(a => a.yillik != null);
    const en = Math.max(...aylar.map(a => Math.max(a.yillik, a.tufe_yillik || 0)));
    const AY = EN() ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] : ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
    const kap = document.createElement("div"); kap.className = "enf-kap";
    const nokta = aylar.map((a, i) => `${((i + 0.5) / aylar.length * 100).toFixed(2)},${(100 - (a.tufe_yillik || 0) / en * 100).toFixed(2)}`).join(" ");
    kap.innerHTML = `<div class="enf-cizim">${aylar.map((a, i) => `<div class="enf-ay" title="${a.ay}: ${EN() ? "wholesale produce" : "hal"} %${sayi(a.yillik, 1)}, TÜFE %${sayi(a.tufe_yillik || 0, 1)}" style="--h:${(a.yillik / en * 100).toFixed(1)};animation-delay:${i * 70}ms"><i></i><span>${AY[+a.ay.slice(5) - 1]}</span></div>`).join("")}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="${nokta}" fill="none" stroke="#1b1b1b" stroke-width="1.6" vector-effect="non-scaling-stroke" stroke-dasharray="4 3"/></svg></div>
      <div class="enf-lejant"><span><i></i>${EN() ? "Istanbul wholesale produce, yearly change" : "İstanbul hal fiyatları, yıllık değişim"}</span><span><b></b>${EN() ? "CPI, yearly" : "TÜFE, yıllık"}</span></div>`;
    yerlestir(kart, kap, null);
  }

  // ---------------------------------------------------------------- Vikipedi: her günün en çok okunanı
  async function viki(kart) {
    const s = await json(`${SITE}/turkiye-merak/veri/son.json`);
    const ay = s.son.slice(0, 7), onceki = new Date(Date.parse(ay + "-01T00:00:00Z") - 864e5).toISOString().slice(0, 7);
    const [a, b] = await Promise.all([json(`${SITE}/turkiye-merak/veri/gun/${ay}.json`), json(`${SITE}/turkiye-merak/veri/gun/${onceki}.json`).catch(() => ({}))]);
    const gunler = {...b, ...a};
    const son7 = Object.keys(gunler).sort().slice(-6).reverse().map(g => [g, gunler[g].top && gunler[g].top[0]]).filter(x => x[1]);
    const en = Math.max(...son7.map(x => x[1][1]));
    const kap = document.createElement("div"); kap.className = "viki-kap";
    kap.innerHTML = son7.map(([g, t], i) => {
      const d = new Date(g + "T12:00:00Z").toLocaleDateString(EN() ? "en-GB" : "tr-TR", {day: "numeric", month: "short", timeZone: "UTC"});
      return `<div class="viki-satir" style="--w:${(t[1] / en * 100).toFixed(1)};animation-delay:${i * 90}ms"><span class="viki-gun">${d}</span><b>${t[0].replace(/_/g, " ")}</b><em>${sayi(t[1])}</em></div>`;
    }).join("");
    yerlestir(kart, kap, EN() ? "Most-read Turkish Wikipedia article, each of the last 6 days" : "Son 6 günün her birinde en çok okunan madde");
  }

  async function maas(kart) {
    const v = await (await fetch("https://birtohum.github.io/maasim-kac-ekmek/veri/asgari.json")).json();
    const s = v.seri, son = s[s.length - 1];
    const zam = [...s].reverse().find((x, i, a) => i === a.length - 1 || a[i + 1].net !== x.net);
    const kayip = (1 - son.bugun / zam.bugun) * 100, kayipY = kayip.toLocaleString(EN() ? "en-GB" : "tr-TR", {maximumFractionDigits: 1});
    const AY = EN() ? ["January","February","March","April","May","June","July","August","September","October","November","December"] : ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
    const zAy = AY[+zam.ay.slice(5) - 1];
    kart.querySelector("#maas-baslik").innerHTML = EN() ? `The minimum wage paid in ${zAy} has lost <em>${kayipY}%</em> of its value since.` : `${zAy} zammıyla gelen asgari ücret, bugünün fiyatlarıyla <em>%${kayipY}</em> eridi.`;
    const W = 520, H = 190, sol = 18, sag = 10, ust = 14, alt = 20, ymax = Math.max(...s.map(x => x.bugun)) * 1.06;
    const x = i => sol + i / (s.length - 1) * (W - sol - sag), y = v => ust + (1 - v / ymax) * (H - ust - alt);
    const yol = s.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.bugun).toFixed(1)}`).join("");
    let g = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${EN() ? "Net minimum wage in today's prices, 2016–" : "Net asgari ücret bugünün fiyatlarıyla, 2016–"}${son.ay.slice(0, 4)}">`;
    g += `<path d="${yol}L${x(s.length - 1)},${y(0)}L${x(0)},${y(0)}Z" fill="#b8742a" opacity=".14"/><path d="${yol}" fill="none" stroke="#7a4310" stroke-width="2"/>`;
    s.forEach((p, i) => { if (p.ay.endsWith("-01") && +p.ay.slice(0, 4) % 2 === 0) g += `<text x="${x(i)}" y="${H - 5}" font-size="11" fill="#7a6a55" text-anchor="middle" font-family="IBM Plex Mono,monospace">${p.ay.slice(0, 4)}</text>`; });
    g += `<circle cx="${x(s.length - 1)}" cy="${y(son.bugun)}" r="4" fill="#b3261e"/></svg>`;
    const kap = kart.querySelector("#maas-testere");
    kap.innerHTML = g + `<p>${EN() ? "Net minimum wage in today's money" : "Net asgari ücret, bugünün parasıyla"} · 2016–${son.ay.slice(0, 4)}</p>`;
  }

  const KARTLAR = {"s-maas": maas, "s-mevzuat": mevzuat, "s-enflasyon": enflasyon, "s-viki": viki, "s-hava": hava, "s-gece": gece, "s-meclis": meclis, "s-iett": iett, "s-tohum": tohum, "s-deniz": deniz, "s-yangin": yangin, "s-dizi": dizi, "s-uydu": gok, "s-baraj": baraj, "s-deprem": deprem, "s-ucak": ucak};
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

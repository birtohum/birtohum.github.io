"use strict";
// Proje hikâyeleri: karta basınca tam ekran pencere. Canlı siteler pencerede gerçek haliyle (iframe) açılır.
// Adres: #proje/<id> ya da #site/<depo>; geri tuşu ve Esc pencereyi kapatır.

const G = "gorsel/";
const HIKAYE = {
  "Usta": {id: "usta", sahne: "usta",
    soru: "Bir yapay zekâ ajanı \"bitti\" dediğinde iş gerçekten bitmiş mi? Kodu hiç görmeyen ikinci bir model bunu yakalayabilir mi?",
    sayilar: [["1.026", "gizli testli koşu"], ["%58", "Usta (tek başına %60)"], ["%94", "yakalanan kod mutantı"], ["≈ 31 $", "toplam API harcaması"]],
    yaptim: ["Türkçe bir görev yazıyorsun ya da sesle söylüyorsun. Bir model kodu internetsiz, kapalı bir alanda yazıp çalıştırıyor. Aynı anda Muse Spark, ayrı çağrılarda ve kodu hiç görmeden görev metninden kabul testleri ve bir referans çözüm yazıyor; referansın geçemediği testler atılıyor.",
      "Kalan testler önce bir hakeme gidiyor: görev bunu gerçekten istiyor mu? İstiyorsa hata çıktısı ajana geri dönüyor, üç düzeltme turuna kadar. Çalışan bir testi bozan tur geri alınıyor. Sonra 114 zor görevi üçer kez, kimsenin görmediği gizli testlerle ölçtüm."],
    ogrendim: "Hatalar çoğunlukla kodda değil, görevin okunuşundaydı. Faturadaki \"toplam\" KDV dahil mi hariç mi, metin söylemiyordu; kodu yazan da testi yazan da aynı şekilde okudu. Aynı model ailesinden iki modelin birbirini onaylaması doğrulama gibi görünüyor ama değil.",
    link: [["Kod ↗", "https://github.com/birtohum/usta"], ["3 dk demo ↗", "https://www.youtube.com/watch?v=f9RjvBsFDiU"]]},
  "Tohum": {id: "tohum", sahne: {img: G + "p-tohum.webp", alt: "Tohum'un tarayıcıda çalışan büyüme albümü"},
    soru: "Hiçbir şey bilmeyen bir model Türkçeyi harf harf öğrenebilir mi? Açık bir model, Türkçe konuşan bir asistana dönüşebilir mi?",
    sayilar: [["4,8 M", "parametre, sıfırdan"], ["21 dk", "eğitim, RTX 3060"], ["10–2", "30 soruda resmi Qwen3-8B'ye karşı"], ["156.334", "örnek, herkese açık veri seti"]],
    yaptim: ["Önce kendi ekran kartımda 4,8 milyon parametrelik, harf düzeyinde bir dil modelini sıfırdan eğittim. Eğitim boyunca aynı cümleye on bir farklı yaşta nasıl devam ettiğini gösteren, tarayıcıda çalışan bir \"büyüme albümü\" yaptım.",
      "Sonra Qwen3 8B ve 14B'yi yaklaşık 100 bin Türkçe talimat örneğiyle LoRA ile eğittim. 8B, 30 soruluk testte resmi modeli 10–2 geçti (15 berabere). 14B'de bağımsız hakem karnesi 7,79'a 7,37 çıktı, ama güven aralıkları çakışıyor."],
    ogrendim: "Tercih eğitimi (DPO) ölçülebilir kazanç vermedi; bıraktım. Bir sürümün model dosyaları Colab kapanınca kayboldu; o günden beri her ağırlığı ilk iş yedekliyorum. Biriken veriyi herkes kullanabilsin diye açtım.",
    gorseller: [[G + "p-tohum.webp", "Büyüme albümü: kayıp düştükçe aynı cümle nasıl değişiyor (gerçek ekran görüntüsü)"]],
    link: [["Veri seti (Hugging Face) ↗", "https://huggingface.co/datasets/egenksban10/tohum-tr-talimat"]]},
  "Kripto RL botu": {id: "kripto", sahne: {img: G + "p-kripto.webp", alt: "Test döneminde ajanın ve al-ve-tut stratejisinin portföy değeri", tam: true},
    soru: "Pekiştirmeli öğrenen bir ajan, Bitcoin'i alıp beklemekten daha iyi alım-satım yapabilir mi?",
    sayilar: [["0 / 4", "dönemde al-ve-tut'u geçti"], ["−%18,2", "ajan, piyasa +%1,9 iken"], ["≈ 19 ay", "walk-forward test"], ["0 ₺", "gerçek para"]],
    yaptim: ["Binance'in herkese açık geçmiş fiyatlarıyla, API anahtarı ve gerçek para olmadan çalışan bir RL ajanı kurdum. Üç aşamada ödül fonksiyonunu değiştirdim: ham getiri, al-ve-tut'a göre fazladan getiri artı işlem cezası, ve dört farklı piyasa döneminde doğrulama."],
    ogrendim: "Tek bir test dönemi yanıltabilir; dört döneme birlikte bakınca tesadüf değil, tutarlı bir başarısızlık çıktı. Bunu saklamak yerine raporun en üstüne yazdım.",
    gorseller: [[G + "p-kripto.webp", "Test dönemlerinden biri: mavi ajan, turuncu al-ve-tut (projenin kendi raporundan)"]]},
  "Gazete Özeti": {id: "gazete", sahne: {img: G + "p-gazete.webp", alt: "Gazete Özeti sayfası"},
    soru: "Resmî Gazete'yi her sabah okumaya kimin vakti var? Peki yapay zekâ özetinin uydurmadığından nasıl emin olursun?",
    sayilar: [["172 / 180", "iddia doğrulanıp yayımlandı"], ["25 / 25", "elle denetimde doğru"], ["≈ 0,04 $", "günlük maliyet"]],
    yaptim: ["Günün fihristini ve mükerrer sayıları çekiyor, taranmış PDF'leri okuyor, her düzenlemeyi sade Türkçeyle özetliyor. Özetteki her iddia gazetedeki birebir bir alıntıyla eşleşmek zorunda; eşleşmeyen iddia yayımlanmıyor. Okuyan her maddenin altında \"metindeki dayanak\"ı açıp görebiliyor."],
    ogrendim: "Denetleyen hakem özetleyenle aynı model, yani bağımsız değil. Atlanan madde olup olmadığını (eksiksizliği) henüz ölçmedim; sıradaki iş gerçek okurlarla bir hafta denemek.",
    gorseller: [[G + "p-gazete.webp", "1 Kasım 2026 sayısı: 36 iddianın 33'ü metinle doğrulandı (gerçek çıktı)"]],
    link: [["Kod ↗", "https://github.com/birtohum/gazete-ozeti"]]},
  "Yorum Yanıtlayıcı": {id: "yorum", sahne: {img: G + "p-yorum.webp", alt: "Yorum Yanıtlayıcı arayüzü"},
    soru: "Esnaf her müşteri yorumuna cevap yazmak istiyor ama vakti yok. Yapay zekâ söz vermeden, uydurmadan cevap yazabilir mi?",
    sayilar: [["15 / 15", "hiç görülmemiş kuaför yorumu kabul"], ["60 / 60", "geliştirme setinde"], ["≈ 0,001 $", "yorum başına"]],
    yaptim: ["Yorumlar yapıştırılıyor; yanıtlar yalnızca işletmenin girdiği bilgilere dayanıyor. Kod; verilmemiş bir indirim ya da iade sözünü, kaynağı olmayan sayıyı ve telefonu yakalıyor, sorunlu taslak bir kez yeniden yazılıyor. Sağlık, güvenlik ya da hukuk şikâyetinde olaya dair bilgi verilmiyor."],
    ogrendim: "Bir sürümde alerji yanıtındaki hata denetleyen modelden kaçtı; bunu modele değil kurala bağlayarak çözdüm. Test yorumlarını ve değerlendirmeyi tek kişi yaptı; gerçek bir esnafla henüz denenmedi.",
    gorseller: [[G + "p-yorum.webp", "Arayüz: işletme bilgisi solda, yorumlar sağda (gerçek ekran görüntüsü)"]],
    link: [["Kod ↗", "https://github.com/birtohum/yorum-yanitlayici"]]},
  "Tişört Atölyesi": {id: "tisort", sahne: {img: G + "p-atolye.webp", alt: "Tişört Atölyesi'nin ilk ekranı"},
    soru: "70 yaşında biri de 10 yaşında biri de ilk bakışta tişört tasarlayabilir mi?",
    sayilar: [["≈ 45 sn", "iki tasarım birlikte"], ["≈ 4 sent", "tasarım başına"], ["3", "adım: fikir, yazı, tasarım"]],
    yaptim: ["Eniştem Etsy'de tişört satıyor. Fikir Türkçe yazılıyor, sesle söyleniyor ya da hazır bir karta dokunuluyor. Model fikri İngilizce bir çizim tarifine çevirip Türkçe anlamıyla üç slogan öneriyor; iki tasarım aynı anda çiziliyor. Beklerken gerçek aşamalar, kalan süre ve ipuçları görünüyor.",
      "Sonuçta beş tişört renginde önizleme var. Koyu tişörtte kaybolan çizgiler için uyarı çıkıyor ve tek tuşla koyu sürüm hazırlanıyor. Etsy başlığı, 13 etiket ve açıklama kopyala düğmeleriyle geliyor."],
    ogrendim: "Günün gündeminden fikir çıkarmayı denedim: 10 öğenin 10'u da kişi, takım ya da trajediydi ve elendi. Takvim ve mevsimsellik çok daha güvenli. Yayın kararı hep tasarımcıda kalıyor.",
    gorseller: [[G + "p-tisort-tasarim.webp", "Denemede çıkan gerçek bir tasarım: \"sabah kahvesini içmeden konuşmayan huysuz baykuş\""]],
    link: [["Kod ↗", "https://github.com/birtohum/tisort-bulteni"]]},
  "Bizim Masa": {id: "bizimmasa", sahne: "masa",
    soru: "Annem ve babam telefonda birlikte oyun oynayabilir mi? Giriş yok, şifre yok, reklam yok, yabancı yok.",
    sayilar: [["13+", "oyun"], ["0", "şifre, reklam"], ["35", "commit"]],
    yaptim: ["Expo ile yaptığım, Play Store'a konmayan, APK olarak kurulan bir aile oyun salonu. Kızma Birader, Tombala, Sudoku, Bir Kelime Bir İşlem, Atasözü, Hafıza ve daha fazlası; büyük yazı, büyük düğmeler, sürükleme yerine dokunma. Sırada Okey var.",
      "Her telefon kendi; oyun durumu Firebase'de, sıra sırayla (\"sıra sende\") ya da canlı. Her oyunun kuralları testli, ayrı bir motor dosyasında ve hamleler sunucu tarafında bu motorla doğrulanıyor. Bota karşı da oynanabiliyor."],
    ogrendim: "Az ama iyi oyun. Her aşamadan sonra annemle babamın tepkisine göre yön değiştirdim.",
    not: "Çizim, ekran görüntüsü değil. Ortadaki uygulamanın gerçek simgesi."},
  "Seslendir.io": {id: "seslendir", sahne: "ses",
    soru: "Arkadaşlarınla bir sahneyi birbirinizi hiç duymadan seslendirip, sonucu ilk kez birlikte izleseniz ne olur?",
    sayilar: [["283", "commit"], ["Gerçek", "oyuncularla yayındaydı"], ["Durdu", "şu an kapalı"]],
    yaptim: ["Çok oyunculu bir \"kör dublaj\" parti oyunu: odaya girilir, bir sahne ve rastgele bir karakter gelir, herkes kendi repliğini başkalarını duymadan kaydeder. Bitmiş dublaj herkes için aynı anda oynatılır.",
      "Kendi sunucusunda (Oracle VPS, pm2, Caddy) çalışıyordu: sıralama tablosu, profiller, herkese açık durum sayfası, yönetici araçları ve kötüye kullanım için IP engelleme."],
    ogrendim: "Gerçek kullanıcıların olduğu bir sistemi canlıda tutmak kod yazmaktan farklı bir iş: dağıtım, yedek, güvenlik ve sunucu faturası.",
    not: "Çizim, ekran görüntüsü değil. Sunucu şu an kapalı."},
  "Kaynaş": {id: "kaynas", sahne: "kaynas",
    soru: "Arkadaş edinmekte zorlanan bir genç, güvenle yaşıtlarıyla nasıl tanışır?",
    sayilar: [["15–24", "yaş"], ["0", "fotoğraf, çizim avatar"], ["Veli", "onayı 18 yaş altına"]],
    yaptim: ["Ortak ilgi alanları üzerinden yaşıtları eşleştiren bir platform. Google ile giriş, takma ad ve çizim avatar; 18 yaş altı için QR kod ya da bağlantıyla veli onayı ve veli paneli (hesap durumu, arkadaş listesi, izni geri alma). Mesajlaşma yalnızca arkadaşlar arasında."],
    ogrendim: "Tasarımın çoğu \"ne yapılamaz\" kurallarından oluşuyor: yabancıdan mesaj yok, fotoğraf yok, velinin geri alabileceği izin. Şu an kurulum aşamasında; veritabanı hesabının bağlanması bekleniyor.",
    not: "Çizim, ekran görüntüsü değil."},
  "Mahalle Site": {id: "mahalle", sahne: {img: G + "p-mahalle.webp", alt: "Örnek kafe sitesi"},
    soru: "Google'da beş yıldızlı ama sitesi olmayan mahalle esnafına site yapmak ne kadar zor?",
    sayilar: [["1", "sayfa, hızlı"], ["0 ₺", "barındırma"], ["Önce", "izin, sonra yayın"]],
    yaptim: ["Tek sayfalık, telefonda hızlı açılan siteler. Önce önizleme hazırlanıp işletmeye gönderiliyor; işletme \"evet\" derse yayına alınıyor. Cloudflare Pages'te ücretsiz duruyor; müşteri takibi ve teklif süreci bir tabloyla yürüyor."],
    ogrendim: "Gerçek bir işletmenin sitesi ancak işletme onay verdikten sonra yayımlanıyor; önizlemeler arama motorlarına kapalı.",
    gorseller: [[G + "p-mahalle.webp", "Örnek site \"Mola Kahve\" (gerçek bir işletme değil, şablon)"]],
    link: [["Örnek siteyi aç ↗", "https://mahallesite.pages.dev/kafe/"]]},
  "S.": {id: "s-app", sahne: {img: G + "p-s-app.webp", alt: "S. uygulamasında biten bir görev"},
    soru: "Teknik bilgisi olmayan biri bilgisayarına bir iş verip arkasına yaslanabilir mi?",
    sayilar: [["149", "commit"], ["4", "aşama: inceleme, çalışma, kontrol, bitti"], ["Windows", "kurulum dosyası"]],
    yaptim: ["Görevi yazıyorsun; uygulama bilgisayardaki Claude Code'u görev sonuna kadar yürütüyor. İşini kendisi kontrol ediyor, eksik bulursa yeniden deniyor. Kullanım hakkı göstergesi, geri alma, dosyalar ve görev öncesi fikir danışmak için sohbet ekranı var."],
    gorseller: [[G + "p-s-app.webp", "Gerçek ekran: kontrol bir eksik buldu, ikinci denemede iş 92/100 ile tamamlandı"]]},
  "Zabıta Geliyor!": {id: "zabita", sahne: {img: G + "p-zabita.webp", alt: "Zabıta Geliyor! oyunundan bir ekran", tam: true},
    soru: "Seyyar tezgâhla mal satıp zabıtadan kaçmak, arkadaşlarla oynanınca ne kadar komik olur?",
    sayilar: [["Godot", "oyun motoru"], ["0 ₺", "bütçe"], ["Prototip", "erken aşama"]],
    yaptim: ["Tek başına ya da arkadaşlarla oynanan bir kaos oyunu: herkesin kendi arabası var, ortak ya da rakip günlük kira hedefi. Mikrofona bağırarak müşteri çekiyorsun; zabıta yaklaştıkça kaçman gerekiyor."],
    gorseller: [[G + "p-zabita.webp", "Oyundan gerçek ekran: kasa, kira hedefi, \"Zabıta 37 m\" ve bağırma göstergesi"]]},
  "DDNet Ödül": {id: "ddnet", sahne: "ddnet",
    soru: "Bir oyunda hile yapmadan, yalnızca daha iyi geri bildirimle daha keyifli oynanabilir mi?",
    sayilar: [["49", "commit"], ["C++", "istemci kodu"], ["0", "hile"]],
    yaptim: ["DDNet'in açık kaynak C++ kodunda kendi istemcimi yaptım: isabetlerde ödül efektleri, sakin bir ekran ve kavgada yol gösteren görsel ve sesli ipuçları. Kural en baştan belli: otomatik nişan, otomatik vuruş ya da kanca yok."],
    not: "Çizim, ekran görüntüsü değil."},
  "Hardstyle Studio": {id: "hardstyle", sahne: "hard",
    soru: "Herhangi bir şarkı, kendi yapısına uyan bir hardstyle versiyonuna otomatik çevrilebilir mi?",
    sayilar: [["Demucs", "kanal ayrıştırma"], ["Stem + MIDI", "DAW'a aktarım"], ["6", "commit"]],
    yaptim: ["Şarkıyı Demucs ile vokal, davul, bas ve diğer kanallara ayırıyor, vuruşu ve akorları buluyor. Nakaratları drop'a çevirip önüne build-up koyuyor, kick'leri şarkının vuruşuna ve akorlarına kilitliyor. Sonuç ekranında drop'lar, ölçüler, seviyeler ve hedef BPM düzeltilip yeniden oluşturulabiliyor."],
    not: "Çizim, ekran görüntüsü değil."},
};

const SITELER = {
  "mevzuat-haritasi": "Mevzuat Haritası", "meclisin-dili": "Meclis'in Dili", "kac-sigara": "Kaç Sigara?",
  "sepet-enflasyonu": "Sepet Enflasyonu", "iett-dakiklik": "İETT Dakiklik",
};

// ---------------------------------------------------------------- sahne çizimleri
function sahneUsta() {
  const satirlar = [
    ["g", "$ usta"], ["", "› Görev: \"vade.py: tatile denk gelen ödeme gününü ilk iş gününe kaydır\""],
    ["s", "  Muse Spark kabul testlerini yazıyor (kodu görmeden)…"], ["s", "  Yürütücü kodu yazıyor: Write vade.py · Bash pytest"],
    ["y", "  ✓ 54/54 kabul testi geçti · 1. tur"], ["g", "  Gizli testler (kimsenin görmediği):"],
    ["k", "  ✗ 114 görevde: tek başına %60 · Usta %58"], ["g", "  → kazanç yok. Nedeni aşağıda."],
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
  return `<div class="rol"><span>🎤 Kaptan</span><span>🎤 Ejderha</span></div><div class="dalga">${bar}</div><div class="rol"><span>🎤 Aslan</span><span>🎤 Astronot</span></div>`;
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
  const od = [["+1", 22, 30, 0], ["İSABET", 64, 26, .8], ["+1", 40, 64, 1.6]];
  return `<div class="tee"></div>${od.map(([t, x, y, d]) => `<div class="od" style="left:${x}%;top:${y}%;animation-delay:${d}s">${t}</div>`).join("")}<div class="kural">otomatik nişan YOK · hile YOK</div>`;
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
    <h2 class="h-blok">${p.em} ${esc(p.ad)}</h2>
    <p class="h-soru h-blok">${esc(h.soru)}</p>
    <div class="h-sayilar h-blok">${h.sayilar.map(([b, s]) => `<div><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join("")}</div>
    <div class="h-blok"><h3>Ne yaptım</h3>${h.yaptim.map(t => `<p>${esc(t)}</p>`).join("")}</div>
    ${gorsel.map(([src, alt]) => `<figure class="h-blok"><img src="${src}" alt="${esc(alt)}" loading="lazy"><figcaption>${esc(alt)}</figcaption></figure>`).join("")}
    ${h.ogrendim ? `<div class="h-ogren h-blok"><h3>Ne öğrendim</h3><p>${esc(h.ogrendim)}</p></div>` : ""}
    ${h.link ? `<div class="h-linkler h-blok">${h.link.map(([y, u]) => `<a class="p-dugme sari" href="${u}" target="_blank" rel="noopener">${esc(y)}</a>`).join("")}</div>` : ""}
    <button class="h-sonraki h-blok" data-sonraki="${sonraki.id}"><span><small>Sonraki proje</small><b>${esc(sonrakiAd)}</b></span><span class="ok" aria-hidden="true">→</span></button>
  </div>`;
}

function ac(tur, id, yeni = true) {
  let baslik, icerik, ust = "";
  if (tur === "site") {
    if (!SITELER[id]) return;
    baslik = `${SITELER[id]}<small>canlı site</small>`;
    ust = `<a class="p-dugme p-gizle-mobil" href="https://github.com/birtohum/${id}" target="_blank" rel="noopener">Kod ↗</a>
      <a class="p-dugme sari" href="https://birtohum.github.io/${id}/" target="_blank" rel="noopener">Yeni sekmede ↗</a>`;
    icerik = `<div class="p-icerik cerceve"><div class="p-yukleniyor">Site açılıyor…</div>
      <iframe src="https://birtohum.github.io/${id}/" title="${esc(SITELER[id])}" loading="eager" allow="geolocation; clipboard-write"></iframe>
      <div class="p-ipucu">Bu gerçek site: içinde dolaşabilirsin</div></div>`;
  } else {
    const p = PROJELER.find(x => HIKAYE[x.ad] && HIKAYE[x.ad].id === id);
    if (!p) return;
    baslik = `${esc(p.ad)}<small>proje hikâyesi</small>`;
    ust = `<button class="p-dugme p-gizle-mobil" data-yon="-1" aria-label="Önceki proje">←</button><button class="p-dugme p-gizle-mobil" data-yon="1" aria-label="Sonraki proje">→</button>`;
    icerik = `<div class="p-icerik">${hikayeHTML(p)}</div>`;
  }
  pencere.innerHTML = `<div class="p-cubuk"><div class="p-baslik" id="p-baslik">${baslik}</div>${ust}<button class="p-dugme" data-kapat aria-label="Kapat">✕</button></div>${icerik}`;
  pencere.dataset.tur = tur; pencere.dataset.id = id;
  if (pencere.hidden) {
    acanEleman = document.activeElement;
    perde.hidden = pencere.hidden = false; document.body.classList.add("kilit");
    requestAnimationFrame(() => { perde.classList.add("acik"); pencere.classList.add("acik"); });
  }
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
  d.className = "ac"; d.innerHTML = `Hikâyesini aç <span aria-hidden="true">→</span>`;
  d.setAttribute("aria-label", `${p.ad}: hikâyesini aç`);
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

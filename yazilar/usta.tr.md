# Kendi kodunu denetleyen bir yapay zekâ ajanı yaptım. 1.026 denemenin sonunda, denetlemeyenden daha iyi değildi.

*"Yapay zekâ yapay zekâyı denetlesin" fikri üzerine küçük ve dürüst bir deney. Bütün görevler, testler ve kayıtlar açık.*

Kodlama ajanı yapan herkes aynı şeyi istiyor: "bitti" demekle kalmayan, bittiğini *kanıtlayan* bir ajan. Akla gelen ilk
tarif de belli: ikinci bir model birincinin işini denetlesin. Testleri ayrı yazsın, kodu yazana hiç göstermesin,
çalıştırsın, kalanları geri göndersin, tekrar etsin.

Meta AI Developer Hackathon'da tam olarak bunu yaptım. Sonuç beni şaşırttı ve bu yazı o yüzden var.

## Kurulum

**Usta**, Türkçe konuşanlar için bir kodlama ajanı. Görevi Türkçe veriyorsun, yazıyla ya da sesle. Örneğin "Türk
IBAN'ını doğrulayan bir işlev yaz" ya da "şu fatura satırlarını topla; Türkçe sayı biçimi, KDV %1/10/20". Sonra:

1. Bir **yürütücü** model, kodu internetsiz, kapalı bir çalışma alanında araç çağrılarıyla yazıp çalıştırıyor.
2. Bir doğrulayıcı model, **ayrı çağrılarda** ve yalnızca görev metnine bakarak kabul testleri yazıyor. Kodu hiç
   görmüyor; yürütücü de testleri hiç görmüyor.
3. Yapay zekânın yazdığı testler de yanlış olabilir. Bu yüzden doğrulayıcı bir de referans çözüm yazıyor; referansın
   geçemediği testler atılıyor.
4. Kalan testler, yalnızca görev metninin açıkça istediği şeyleri dayatan bir **hakeme** gidiyor. Sonra hata çıktısı
   en fazla üç düzeltme turu için yürütücüye geri dönüyor. Daha önce geçen bir testi bozan tur geri alınıyor.

En güçlü sürüm daha da ileri gitti:
- birbirinden bağımsız üç test yazarı;
- hangi testin kalacağına çoğunluk oyuyla karar;
- mutasyon testi: doğrulayıcı, referans çözümün bilerek bozulmuş 12–16 sürümünü yazıyor ve testler bunları
  yakalayana kadar ekleniyor.

Sonunda kabul testleri bu mutantların **%94'ünü yakalıyordu**. Kâğıt üzerinde çok güçlü bir doğrulayıcı.

## Nasıl ölçtüm

Üç kipi karşılaştırdım:

- **(a)** yürütücü tek başına,
- **(b)** yürütücüye "kendi testlerini yaz ve geçir" denmiş hali,
- **(c)** Usta: bağımsız testler, hakem, düzeltme döngüsü.

Görevler, Türkiye'ye özgü 114 çok zor kodlama göreviydi: vergi kimlik numaraları, IBAN sağlama haneleri, faturada KDV,
resmî tatile denk gelip kayan tarihler, Türkçe sayı biçimleri. Her görevin, ne yürütücünün ne de Usta'nın test
yazarının gördüğü 12–20 **gizli testi** vardı. Her görev her kipte 3 kez koşuldu: **1.026 koşu**, sıfır altyapı hatası.

## Sonuç

| Kip | Geçme oranı (%95 güven aralığı) | "Bitti" hükümlerinden gerçekten doğru çıkanlar |
|---|---|---|
| (a) yürütücü tek başına | **%60,2** (52–68) | %63 |
| (b) + kendi testleri | %56,7 (49–64) | %61 |
| (c) Usta | %57,6 (49–65) | %60 |

Usta eksi tek başına: **−2,6 puan** (%95 güven aralığı −9,1 … +3,2). Anlamlı bir fark yok; nokta tahmini hatta biraz
*eksi*.

İkinci sütun birinciden daha önemli. Usta "doğrulandı" dediğinde %60 oranında haklıydı. Yürütücü kendi kendine "bitti"
dediğinde %63 oranında haklıydı. **Doğrulama rozeti, hükmü daha güvenilir yapmadı.**

Aynı şey iki başka görev setinde de (157 ve 34 görev), iki farklı yürütücüyle (Muse Spark ve açık ağırlıklı Muse
Glimmer 30B), doğrulayıcının dört farklı sürümünde de geçerliydi. Hiçbir kip, yürütücüyü tek başına anlamlı biçimde
geçemedi.

## Neden işe yaramadı

Biraz sadeleştirilmiş bir görev:

> *Bir muhasebe ofisi için `topla(csv_yolu)` yaz. Sütunlar `tutar;adet;kdv_oran`. Türkçe sayı biçimi. Boş adet 1
> sayılır… Sonuç sözlüğü `toplam`, `kdv_toplam` ve `bozuk_satir` içersin.*

Girdi: tek satır, tutar 10,00, adet 2, KDV %10. `toplam` kaç?

- Yürütücü **22,00** dedi: KDV *dahil* toplam. Dokuz koşunun dokuzunda da (üç kip × üç tekrar) bu cevabı verdi.
- Üç Usta koşusunun üçünde de kabul testleri (36 ile 61 arası) bu kodla geçti. Ya 22,00 bekliyorlardı ya da bunu hiç
  denemediler; Usta da "doğrulandı" dedi.
- Gizli test **20,00** bekliyordu: KDV *hariç* toplam; KDV ayrıca `kdv_toplam`'da.

Görev metni hangisini kastettiğini hiç söylemiyor. Burada bir kod hatası yoktu. Belirsiz bir tarifin iki okunuşu
ayrıştı ve kodu yazan model ile denetimi yazan model aynı tarafa düştü.

Yürütücünün tek başına bütün koşularının ve Usta'nın bütün koşularının gizli testte kaldığı, ama Usta'nın kendi
testlerinin her seferinde geçtiği 16 görev vardı. Hepsi belirsizlik değil. Örneğin biri, kabul testlerinin hiç
denemediği düpedüz bir tür hatası (`float` ile `Decimal` karışıyor). Ama aynı şekil tekrar tekrar çıktı: denetimler,
yanlış giden şeyi hiç yoklamıyordu.

Başarısızlıkların çoğunun ardındaki örüntü bu:

1. **Hatalar çoğunlukla kodu yazmakla değil, görevi okumakla ilgiliydi.** Yürütücü çoğu zaman görevin biraz farklı bir
   okunuşu için doğru kod yazdı.
2. **Aynı model ailesinden gelen bir doğrulayıcı aynı okunuşları paylaşıyor.** Testleri ayrı çağrılarda bağımsız
   yazmak, onları *yargıda* bağımsız yapmıyor. Kodu yazan da denetleyen de görevi aynı okuyor; anlaşıyorlar ve bu
   anlaşma doğrulama gibi görünüyor.
3. **Mutasyon puanları yanlış şeyi ölçüyor.** Mutantların %94'ünü yakalamak, testlerin *küçük kod değişikliklerine*
   duyarlı olduğunu gösteriyor. Kodun *aslında ne yapması gerektiğine* ise körler.
4. **Yani darboğaz düzeltme değil, kapsama.** 342 Usta koşusunun yalnızca 38'inde bir düzeltme turu çalıştı. Testler
   bir gereksinimi yoklamıyorsa, döngünün düzeltecek bir şeyi olmuyor.

Bunun rahatsız edici bir sonucu da var. Yukarıdaki örnekte gizli test de aynı modelden, başka bir çağrıda geldi. KDV
konusunda kimin "haklı" olduğu da bir yargı. Yürütücü hatası diye ölçtüğüm şeyin bir kısmı aslında ölçüt setinin
kendi belirsizliği. Üç hakem de aynı model ailesinden olduğu için mutlak geçme oranları büyük ihtimalle iyimser; gerçek
tablo, tablonun gösterdiğinden daha gürültülü.

## Buradan ne çıkarırdım

- **İki model aynı aileden geliyor ve görevi aynı okuyorsa, "ikinci model birinciyi denetlesin" doğrulama değildir.**
  Çökmeleri ve küçük hataları yine yakalayabilir, ama burada en çok önemli olan hataları yakalamaz.
- **Böyle bir döngü kuruyorsan, gizli testlere karşı ölç.** Döngülü ve döngüsüz, aynı görevlerde, tekrarlı koşularla
  ölç. Bu olmadan yeşil bir rozet sadece bir histir.
- **Daha umut verici yönler kodla değil, tarifle ilgili:** bir gereksinim belirsizse kullanıcıya sormak ("toplam KDV
  dahil mi, hariç mi?"), farklı model ailelerinden doğrulayıcılar, ve aynı görev metninden değil gerçek örneklerden
  türetilen testler.

## Usta ne işe yarıyor

Baştan sona hâlâ çalışıyor: Türkçe ses ya da yazı, sonra kod, sonra testler, sonra hangi testin hangi turda geçtiğini,
hangisinin dayatılmadığını ve nedenini gösteren bir kanıt ekranı. Bu kayıt işe yarar. Sadece bir garanti değil ve
README de bunu söylüyor.

Her şey açık: kod, gizli testleriyle üç görev setinin hepsi, her koşunun kaydı ve analiz betikleri. Projenin bütün API
harcaması yaklaşık 31 $.

**Kod:** https://github.com/birtohum/usta · **Demo (3 dk):** https://www.youtube.com/watch?v=f9RjvBsFDiU

*Gizli testlerde yürütücüyü tek başına gerçekten **geçen** bir doğrulama döngüsü gördüysen, sayılarını görmeyi çok
isterim.*

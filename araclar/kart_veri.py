"""Canlı site kartları için küçük veri dosyası: Türkiye sınırı (sadeleştirilmiş) ve 2021'de uyduların
orman ve makilikte gördüğü yangın noktaları (ay bilgisiyle). Kaynak: orman-yanginlari-uzaydan sitesinin verisi.
    python araclar/kart_veri.py"""
import json
import urllib.request
from pathlib import Path

KOK = Path(__file__).resolve().parent.parent
SITE = "https://birtohum.github.io/orman-yanginlari-uzaydan/veri"


def al(yol):
    with urllib.request.urlopen(f"{SITE}/{yol}", timeout=60) as r:
        return json.loads(r.read())


def sadelestir(halka, adim=0.06):
    """Ardışık noktalar arasında ~adim dereceden kısa sıçramaları atar; 2 ondalık yeterli."""
    cikti, son = [], None
    for x, y in halka:
        if son is None or abs(x - son[0]) + abs(y - son[1]) >= adim:
            cikti.append([round(x, 2), round(y, 2)]); son = (x, y)
    return cikti if len(cikti) >= 4 else None


def main():
    sinir = al("sinirlar.json")
    halkalar = [s for il in sinir for h in il["h"] if (s := sadelestir(h))]
    yil = al("harita/2021.json")
    noktalar = [[x, y, ay] for x, y, ay, sn, n in yil["n"] if sn == 0]   # yalnız orman ve makilik
    istanbul = [s for il in sinir if il["ad"] == "İstanbul" for h in il["h"] if (s := sadelestir(h, 0.008))]
    cikti = {"kaynak": "NASA FIRMS (VIIRS), orman-yanginlari-uzaydan", "yil": 2021, "sinir": halkalar, "n": noktalar, "istanbul": istanbul}
    (KOK / "veri" / "kart-harita.json").write_text(json.dumps(cikti, separators=(",", ":")), encoding="utf-8")
    print(f"İstanbul {sum(map(len, istanbul))} köşe; {len(halkalar)} halka, {sum(map(len, halkalar))} köşe, {len(noktalar)} orman noktası")


if __name__ == "__main__":
    main()

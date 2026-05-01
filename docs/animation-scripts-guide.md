# Animasyon Scriptleri — Kullanım Kılavuzu

Bu kılavuz 4 animation scriptinin nasıl çalıştığını, hangi data-attribute'ları kullandığını ve Webflow'da nasıl kurgulandığını açıklar.

---

## İçindekiler

1. [ScrollColor](#1-scrollcolor-100)
2. [ScrollScale](#2-scrollscale-100)
3. [FillText](#3-filltext-100)
4. [ImgReveal](#4-imgreveal-100)

---

## 1. ScrollColor `1.0.0`

**Ne yapar:** Section'ın arka plan rengini scroll pozisyonuna göre değiştirir.

**Bağımlılıklar:** GSAP, ScrollTrigger, Lenis (`window.__lenis` beklenir)

### İki mod vardır

| Mod | Nasıl çalışır |
|---|---|
| **Toggle (varsayılan)** | Section viewport'a girince renk geçişi tetiklenir (0.7s, ease: power2.inOut). Çıkınca geri döner (tersine çevrilebilir). |
| **Scrub** | Renk değişimi scroll pozisyonuyla eşzamanlı hareket eder — ileri/geri scroll'da renk de ileri/geri gider. |

### Data Attribute'lar

| Attribute | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|
| `data-scroll-color` | **Evet** | — | Hedef renk. Hex, rgb, oklch her format çalışır. |
| `data-scroll-color-from` | Hayır | Elementin mevcut `background-color`'ı | Geçişin başladığı renk. |
| `data-scroll-color-start` | Hayır | `"top 70%"` | ScrollTrigger start noktası. |
| `data-scroll-color-end` | Hayır | `"top 20%"` | Sadece scrub modunda bitiş noktası. |
| `data-scroll-color-reverse` | Hayır | `"true"` | `"false"` yapılırsa section viewport'tan çıkınca renk geri dönmez. |
| `data-scroll-color-scrub` | Hayır | `"false"` | `"true"` yapılırsa scrub moduna geçer. |

### Örnekler

```html
<!-- En basit kullanım — section viewport'a girince siyaha döner -->
<section data-scroll-color="#000">...</section>

<!-- Geri dönmez — bir kez tetiklenince kalır -->
<section data-scroll-color="#0a0a0a" data-scroll-color-reverse="false">...</section>

<!-- Scrub modu — scroll pozisyonuyla eşzamanlı -->
<section
  data-scroll-color="oklch(20% 0.05 260)"
  data-scroll-color-scrub="true"
  data-scroll-color-start="top 80%"
  data-scroll-color-end="top 30%"
>...</section>

<!-- Özel başlangıç rengi -->
<section
  data-scroll-color="#1a1a2e"
  data-scroll-color-from="#ffffff"
>...</section>
```

---

## 2. ScrollScale `1.0.0`

**Ne yapar:** Section'a iki farklı scale efekti uygular:
- **Enter:** Aşağıdan gelirken büyükten (1+amount) normal boyuta (1) iner.
- **Exit:** Üstten çıkarken normalden küçüğe (1-amount×0.6) iner + opacity 0.5'e düşer.

Sadece `transform` ve `opacity` kullanır — GPU composited, layout/paint tetiklemez.

**Bağımlılıklar:** GSAP, ScrollTrigger, Lenis (`window.__lenis` beklenir)

### Varsayılan değerler

| Parametre | Değer |
|---|---|
| `amount` | `0.08` |
| `scrub` | `2` |
| Enter aralığı | `top bottom` → `top top` |
| Exit aralığı | `bottom bottom` → `bottom top` |

### Data Attribute'lar

| Attribute | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|
| `data-scroll-scale` | **Evet** | `0.08` | Scale miktarı. Boş bırakılırsa varsayılan kullanılır. |
| `data-scroll-scale-enter` | Hayır | `"true"` | `"false"` yapılırsa enter animasyonu devre dışı kalır. |
| `data-scroll-scale-exit` | Hayır | `"true"` | `"false"` yapılırsa exit animasyonu devre dışı kalır. |

### Örnekler

```html
<!-- Hem enter hem exit (varsayılan) -->
<section data-scroll-scale>...</section>

<!-- Daha belirgin efekt -->
<section data-scroll-scale="0.12">...</section>

<!-- Sadece exit efekti (enter yok) -->
<section data-scroll-scale data-scroll-scale-enter="false">...</section>

<!-- Sadece enter efekti (exit yok) -->
<section data-scroll-scale data-scroll-scale-exit="false">...</section>
```

### Görsel mantık

```
Scroll aşağı ↓

[Ekran dışı — büyük] → [top bottom] → enter başlar
                                         ↓ scale: 1.08 → 1.0
                      → [top top]   → enter biter, section normal görünür
                                         ↓ kullanıcı okur
                      → [bottom bottom] → exit başlar
                                         ↓ scale: 1.0 → 0.95, opacity: 1 → 0.5
                      → [bottom top] → exit biter, section kaybolur
```

---

## 3. FillText `1.0.0`

**Ne yapar:** `.fill-text` class'lı elementlerin içindeki metni satır satır karanlıktan aydınlığa (siyahtan açık griye) doldurur. Efekt scroll scrub ile eşzamanlıdır — yukarı scroll edince geri döner.

**Bağımlılıklar:** GSAP, ScrollTrigger, **SplitText** (GSAP premium plugin)

### Nasıl çalışır

1. `document.fonts.ready` beklenir — font yüklenmeden önce split edilirse hatalı satır kırılımları oluşur.
2. SplitText metni satırlara (`lines`) böler.
3. Her satıra `linear-gradient(to right, #000 50%, #ccc 50%)` uygulanır, `background-size: 200%` ile.
4. Scroll ilerledikçe `backgroundPositionX` `100%`'den `0%`'a gider → koyu renk satırı kaplar.

### Kullanım

Data attribute yoktur — sadece class yeterlidir:

```html
<p class="fill-text">Bu metin scroll ile dolar.</p>
<h2 class="fill-text">Bu başlık da dolar.</h2>
```

### ScrollTrigger ayarları

| Parametre | Değer |
|---|---|
| `start` | `top 85%` |
| `end` | `top 55%` |
| `scrub` | `true` |

Her satır kendi ScrollTrigger'ına sahiptir — satırlar sırayla dolar.

### Renkleri değiştirmek

Script içindeki gradient'i düzenle:

```js
backgroundImage: 'linear-gradient(to right, #000 50%, #ccc 50%)',
//                                           ^^^^ dolu renk   ^^^^ boş renk
```

---

## 4. ImgReveal `1.0.0`

**Ne yapar:** `data-img-reveal` attribute'u olan elementleri scroll'la birlikte görünür kılar. Element görünmez (opacity: 0), küçük (scale: 0.9) ve aşağıda (y: 40px) başlar; scroll ilerledikçe normale döner. Yukarı scroll edince geri döner.

**Bağımlılıklar:** GSAP, ScrollTrigger

### Başlangıç → Bitiş değerleri

| Özellik | Başlangıç | Bitiş |
|---|---|---|
| `opacity` | `0` (autoAlpha) | `1` |
| `scale` | `0.9` | `1` |
| `y` | `40px` | `0px` |
| `ease` | — | `power2.out` |

### ScrollTrigger ayarları

| Parametre | Değer |
|---|---|
| `start` | `top 88%` |
| `end` | `top 42%` |
| `scrub` | `1.2` |

### Kullanım

```html
<!-- Herhangi bir element üzerinde çalışır -->
<div data-img-reveal>
  <img src="foto.jpg" alt="">
</div>

<!-- Wrapper olmadan doğrudan img'de de kullanılabilir -->
<img data-img-reveal src="foto.jpg" alt="">

<!-- Birden fazla -->
<div data-img-reveal>...</div>
<div data-img-reveal>...</div>
<div data-img-reveal>...</div>
```

Her element kendi bağımsız ScrollTrigger'ına sahiptir — aynı anda birden fazla element sayfada olabilir.

---

## Yükleme Sırası

```html
<!-- 1. GSAP ve pluginler (CDN) -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<!-- SplitText sadece fill-text için gerekli (GSAP premium) -->

<!-- 2. Lenis (ScrollColor ve ScrollScale için zorunlu) -->
<script src=".../lenis-1.0.0.js"></script>

<!-- 3. Animasyon scriptleri (sıra farketmez) -->
<script defer src=".../scrollcolor-1.0.0.js"></script>
<script defer src=".../scrollscale-1.0.0.js"></script>
<script defer src=".../fill-text-1.0.0.js"></script>
<script defer src=".../img-reveal-1.0.0.js"></script>
```

> **Not:** ScrollColor ve ScrollScale, Lenis yüklenene kadar bekler (max 2 saniye, 20 deneme × 100ms). FillText ve ImgReveal Lenis'e bağımlı değildir.

---

## Hızlı Referans

| Script | Selector | Mod | Lenis gerekli? |
|---|---|---|---|
| ScrollColor | `[data-scroll-color]` | Toggle veya Scrub | Evet |
| ScrollScale | `[data-scroll-scale]` | Scrub (sabit) | Evet |
| FillText | `.fill-text` | Scrub (sabit) | Hayır |
| ImgReveal | `[data-img-reveal]` | Scrub (sabit) | Hayır |

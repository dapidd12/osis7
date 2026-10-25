# Brief: Kotak Curhat OSIS SMAN 1 Kemangkon (landing Kirim Aspirasi)

**Self-authored under explicit creative delegation.** The request was "refactor tampilan, ui, layout agar tidak looping, kemudian gunakan skill scroll craft untuk memperbagus website." Everything below is an authored decision in the brand's voice, not an interview answer. Marked so the verification pass can tell the difference from dead scroll.

## The eight topics

1. **Vibe.** Ramah, hangat, tertata, terpercaya. References from other media: papan pengumuman sekolah yang rapi, kertas warna pastel, buku kas kelas.
2. **Scroll journey.** Beranda menyapa, lalu menjelaskan kenapa suara itu penting dan kenapa aman, lalu satu momen besar saat suara dikirim, lalu formulirnya.
3. **Energy curve.** Tenang (hero), naik (argumen privasi), paling intens di tengah (pelepasan suara), tenang dan fungsional (formulir).
4. **Feeling, stage by stage.** Dinilai menyenangkan. Mengerti. Yakin. **Satu momen yang diingat:** kertas suara yang dilipat terbang masuk ke kotak, dan kotak perlahan menyala.
5. **Something no site they have seen does.** Kotak suara di tengah layar benar-benar menangkap suara: scroll menenggelamkan kertas ke slot, kotak menampungnya, dan angka yang menangkap berkas menyala sebagai jam 06:00 WIB di detik akhirnya (jam reset harian).
6. **Distance from premium-minimal.** Playful, tapi bukan kekanak-kanakan. Keramahan lewat warna dan ruang, bukan lewat efek.
7. **One world, or distinct scenes.** Distinct scenes. Hero, lalu argument, lalu one beat. Kontras antar-scene itu yang membuat beat tengah terasa besar.
8. **Assets.** Logo sekolah (sudah dipakai app: `raw.githubusercontent.com/.../1788314699811-20260902_090434.png`). No footage, no KIE key. No generated imagery: the page is built from type, paper planes, and a drawn box.

## The problem this fixes first

The page looped. Nothing told it to stop:

- `--animate-float`, `--animate-float-slow`, `--animate-float-reverse`, `--animate-pulse-soft`, `--animate-marquee` are `infinite`, and the marquee repeated 8 times per page view to cover the width.
- A full-viewport hero with `useScroll` parallax re-added scroll-linked compositing on every frame, on top of a `body` with `background-attachment: fixed`.
- `WelcomeSplash` rendered `bg-gold-soft`, `text-ink`, `shadow-brutal-sm`, `bg-cream`: none of those tokens exist in `index.css`, so it rendered unstyled.

Decision: **no video, no generated media, and no decorative infinite animation.** Every movement on the page is either driven by the reader's scroll or is dead. That is why this build uses pins and cues rather than `scrub`.

## The feeling curve

```
1  Sapaan      tenang, akrab. Satu headline, satu kalimat. Tidak ada yang bergerak sendiri.
2  Perhatian   napas tertahan. Heading menahan layar, fakta privasi berganti satu per satu.
3  Pelepasan   lega dan percaya. Kertas dilipat, menukik masuk kotak, kotak menyala.
4  Niat       tenang dan jelas. Formulir, lurus, satu label per aksi.
```

Peak: act 3. Itu satu-satunya act yang punya pergerakan besar, dan ia punya span terbesar di halaman.

## The peak

> "Si kertasnya nguber terus, terus masuk ke kotak, dan kotaknya nyala."

Lives in act 3 (`pin`). It gets the largest `data-sc-span`, the only multi-phase choreography, and the only accent glow on the page.

## The tell-someone sentence

> It's the site where you fold a piece of paper with your scroll and push it into the OSIS suggestion box, and the box lights up with the time it opens again tomorrow.

## Authored silence

None. Each act carries copy from its first frame (greet cue on the hero, a ground line on act 3, a heading on act 4), so there is no empty viewport the verification pass could mistake for anticipation.

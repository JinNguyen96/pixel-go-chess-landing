# Pixel Go Chess — trang giới thiệu

Trang web tĩnh giới thiệu game **Pixel Go Chess** (cờ vây pixel ấm áp): hero với cảnh quán trà mưa vẽ bằng canvas, tính năng, ảnh chụp app, nút tải Google Play / App Store kèm mã QR, mục “Web — Sắp ra mắt” có bàn 9×9 thử đặt quân, chính sách quyền riêng tư và `app-ads.txt` cho AdMob.

- Không framework, không bước build: HTML + CSS + JS thuần, deploy thẳng thư mục gốc.
- Không gọi tới bên thứ ba: font Fusion Pixel / VT323 tự host (đã subset), không Google Fonts, không analytics, không cookie. `vercel.json` còn đặt Content-Security-Policy chỉ cho phép `'self'`.
- 5 ngôn ngữ (vi, en, ko, ja, zh-Hans), tự chọn theo `navigator.language` (mặc định en), đổi được bằng menu hoặc `?lang=vi`. Giao diện Tự động / Ngày / Đêm mưa, lưu trong `localStorage`.

## Cấu trúc

| Đường dẫn | Nội dung |
|---|---|
| `index.html`, `privacy.html`, `404.html` | Ba trang |
| `site.config.js` | **Nơi duy nhất** chứa URL store, cờ `available`, email liên hệ, tên chủ sở hữu, `siteUrl` |
| `i18n.js` | Toàn bộ chuỗi giao diện theo ngôn ngữ |
| `assets/css/site.css` | Style (token màu theo `docs/design/tokens.json` của app) |
| `assets/js/` | `boot.js` (chọn ngôn ngữ/giao diện trước khi vẽ), `sprites.js` (sprite lấy từ `sprites.json`), `pixel.js` (cảnh quán trà, bàn 9×9), `main.js` |
| `assets/qr-*.svg` | Mã QR sinh bởi `yarn qr`, đã commit |
| `assets/fonts/` | Font subset + `LICENSES.txt` và thư mục `licenses/` (OFL) |
| `assets/shots/` | Ảnh chụp app thật (WebP 390w và 780w) |
| `assets/og.png`, `favicon.ico`, `assets/icons/` | Ảnh chia sẻ mạng xã hội 1200×630 và favicon |
| `app-ads.txt`, `robots.txt`, `sitemap.xml`, `site.webmanifest` | File ở gốc tên miền |
| `vercel.json`, `.vercelignore` | Cấu hình Vercel (header, cache, bỏ file dev khi deploy) |
| `scripts/` | `qr.mjs`, `seo.mjs`, `fonts.mjs` (chỉ chạy ở máy, không chạy trên Vercel) |

## Xem thử ở máy

```bash
python3 -m http.server 8080
# hoặc
yarn dlx serve .
```

Mở http://localhost:8080. Lưu ý `python3 -m http.server` không tự trả `404.html` cho đường dẫn sai; muốn xem trang 404 thì mở thẳng `/404.html`.

Chỉ cần `yarn install` khi chạy các script bên dưới.

## Cập nhật link store, trạng thái ra mắt, email

Sửa `site.config.js`:

```js
android: { url: 'https://play.google.com/store/apps/details?id=app.pixelgo.game', available: true },
ios: { url: '', appId: '1234567890', available: true },
web: { url: 'https://…', available: false },
contactEmail: 'email-that@cua-ban.com',
owner: 'Tên hiển thị trong dòng ©',
```

- `available: false` → nút bị làm mờ, hiện thẻ “Sắp ra mắt” thay cho QR, **không có link chết**.
- `available: true` → nút thành link thật và hiện QR.
- iOS: điền `url` đầy đủ, hoặc chỉ `appId` (số trong App Store Connect → App Information → Apple ID); script tự tạo `https://apps.apple.com/app/id<appId>`.
- `web.available: true` kèm `web.url` → mục Web hiện nút “Chơi trên trình duyệt”.

Sau khi đổi URL, sinh lại QR rồi commit:

```bash
yarn install
yarn qr        # ghi assets/qr-android.svg, assets/qr-ios.svg (bỏ qua nền tảng chưa có URL)
```

QR dùng mức sửa lỗi M, màu gỗ óc chó `#5b4331` trên giấy washi `#f6f0e2`, giữ vùng trống 4 ô. Nên quét thử bằng điện thoại sau mỗi lần đổi.

## Đổi tên miền (`siteUrl`)

Link canonical, Open Graph, `robots.txt` và `sitemap.xml` cần URL tuyệt đối. Đổi `siteUrl` trong `site.config.js` rồi chạy:

```bash
yarn seo       # thay tên miền cũ bằng mới trong 3 file HTML, viết lại robots.txt và sitemap.xml
yarn sync      # = yarn qr + yarn seo
```

## Font

Font đã được subset theo đúng chữ trang dùng. Nếu thêm chữ mới vào `i18n.js` hoặc HTML (nhất là tiếng Hàn/Nhật/Trung), chạy lại:

```bash
PIXEL_GO_FONTS=../pixel-go/assets-src/fonts yarn fonts
```

Script đọc font gốc trong repo app (chỉ đọc), ghi `assets/fonts/pg-*.woff2` và chép giấy phép OFL. Tiếng Việt dùng VT323 giống app; các ngôn ngữ còn lại dùng Fusion Pixel 12px. Chữ đoạn văn dùng font hệ thống cho dễ đọc.

## AdMob: `app-ads.txt`

File `app-ads.txt` ở gốc đang là mẫu với ID giả:

```
google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0
```

Thay `pub-0000000000000000` bằng publisher ID thật (AdMob → Settings → Account information → Publisher ID, dạng `pub-` + 16 chữ số). Giữ nguyên phần còn lại. `f08c47fec0942fa0` là mã của Google, không đổi.

AdMob chỉ đọc `app-ads.txt` ở **gốc tên miền** của “website nhà phát triển” khai báo trong store:

- Google Play Console → Store presence → Store settings → Website.
- App Store Connect → App Information → Marketing URL / Support URL (AdMob đọc tên miền của trang developer trong listing).
- Tên miền trong listing phải trùng tên miền đang host file này, ví dụ `https://ten-mien-cua-ban.com/app-ads.txt`. Nếu listing ghi `https://ten-mien-cua-ban.com` thì AdMob tìm `https://ten-mien-cua-ban.com/app-ads.txt`.
- **Nên dùng tên miền riêng** (gắn vào Vercel): tên miền `*.vercel.app` do Vercel sở hữu và đổi được theo tên project, nên không phải lựa chọn ổn định cho việc xác minh AdMob lâu dài.
- Sau khi cập nhật, AdMob có thể mất tới 24 giờ để quét lại (AdMob → Apps → app-ads.txt).

`vercel.json` trả `app-ads.txt` với `Content-Type: text/plain; charset=utf-8`.

## Deploy lên Vercel

1. Đẩy repo lên GitHub (`JinNguyen96/pixel-go-chess-landing`, public).
2. Vercel → Add New → Project → Import repo.
3. Framework Preset: **Other**. Build Command: để trống (tắt). Output Directory: `.` (thư mục gốc). Install Command: để trống. `vercel.json` đã đặt sẵn `framework: null`, `buildCommand: null`, `outputDirectory: "."`, và `.vercelignore` bỏ `scripts/`, `package.json`, `yarn.lock`, `README.md` khỏi bản deploy nên Vercel không cài hay build gì.
4. Deploy. Vercel tự trả `404.html` cho đường dẫn không tồn tại.
5. Gắn tên miền riêng: Project → Settings → Domains → Add, làm theo hướng dẫn DNS. Sau đó đổi `siteUrl`, chạy `yarn seo`, commit.

Cache: font, ảnh chụp và icon cache 1 năm (`immutable`), nên **đổi tên file** nếu thay nội dung. CSS/JS/QR/OG cache 1 giờ; HTML và các file `.txt/.xml` luôn kiểm tra lại.

## Việc chủ app cần điền trước khi ra mắt

- [ ] `site.config.js`: `contactEmail`, `owner`, `siteUrl` (sau khi có tên miền) → `yarn seo`.
- [ ] `site.config.js`: `ios.appId` hoặc `ios.url` → `yarn qr`.
- [ ] Bật `android.available` / `ios.available` đúng ngày app lên store.
- [ ] `app-ads.txt`: publisher ID thật.
- [ ] Khai báo tên miền này là website nhà phát triển trong Google Play và App Store Connect; URL chính sách: `<siteUrl>/privacy.html`.
- [ ] Nhờ người bản ngữ đọc lại bản ko / ja / zh-Hans trong `i18n.js`.

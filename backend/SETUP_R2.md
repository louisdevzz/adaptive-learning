# Hướng dẫn thiết lập Cloudflare R2 Public Access

## Vấn đề hiện tại

Lỗi `InvalidArgument - Authorization` xảy ra vì bạn đang sử dụng URL endpoint nội bộ của R2 (`r2.cloudflarestorage.com`) làm public URL. URL này chỉ dùng cho API operations, không phải public access.

## Cách giải quyết

### Bước 1: Enable Public Access cho R2 Bucket

1. Đăng nhập vào [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Vào **R2** từ sidebar
3. Click vào bucket **adaptive-learning**
4. Vào tab **Settings**
5. Tìm mục **Public Access**

### Bước 2: Chọn phương thức Public Access

Bạn có 3 lựa chọn:

#### **Option 1: R2.dev Subdomain (Dễ nhất, Miễn phí)**

1. Trong phần **Public Access**, click **Allow Access**
2. Chọn **R2.dev subdomain**
3. Cloudflare sẽ tạo URL dạng: `https://pub-<account-id>.r2.dev`
4. Copy URL này và cập nhật vào `.env`:

```env
R2_PUBLIC_URL=https://pub-4304c57aede890df0708a25e861320d1.r2.dev
```

> **Lưu ý**: URL có thể khác, hãy copy chính xác từ Cloudflare dashboard

#### **Option 2: Custom Domain (Chuyên nghiệp hơn)**

1. Trong **Public Access**, click **Connect Domain**
2. Nhập domain của bạn (ví dụ: `cdn.yourdomain.com`)
3. Cloudflare sẽ tạo CNAME record
4. Sau khi DNS propagate, cập nhật `.env`:

```env
R2_PUBLIC_URL=https://cdn.yourdomain.com
```

#### **Option 3: Cloudflare Workers (Linh hoạt nhất, cần code)**

Nếu cần custom logic (resize images, authentication, etc.), dùng Workers.

### Bước 3: Kiểm tra Public URL

Sau khi enable, test URL:

```bash
# Thay YOUR_PUBLIC_URL bằng URL bạn vừa lấy được
curl https://YOUR_PUBLIC_URL/
```

Bạn sẽ thấy danh sách files hoặc XML response từ R2.

### Bước 4: Cập nhật .env

Cập nhật file `.env` với đúng public URL:

```env
# Ví dụ với R2.dev subdomain
R2_PUBLIC_URL=https://pub-4304c57aede890df0708a25e861320d1.r2.dev

# HOẶC với custom domain
R2_PUBLIC_URL=https://cdn.yourdomain.com
```

### Bước 5: Restart server

```bash
cd /Users/louisdevzz/Documents/adaptive-learing/backend
pnpm run start:dev
```

## Kiểm tra lại sau khi cấu hình

1. Upload một ảnh test qua API
2. Bạn sẽ nhận được URL dạng: `https://pub-xxx.r2.dev/avatars/xxx.png`
3. Mở URL trong browser - ảnh phải hiển thị được
4. Nếu không hiển thị, kiểm tra lại Public Access settings

## Troubleshooting

### Lỗi "Access Denied"
- Kiểm tra Public Access đã được enable chưa
- Verify bucket name đúng chưa

### Lỗi "NoSuchBucket"
- Kiểm tra `R2_BUCKET_NAME` trong `.env`
- Verify bucket tồn tại trong Cloudflare

### Lỗi "InvalidArgument - Authorization"
- Đảm bảo `R2_PUBLIC_URL` là public URL, không phải storage endpoint
- Storage endpoint: `https://xxx.r2.cloudflarestorage.com` ❌
- Public URL: `https://pub-xxx.r2.dev` ✅

## Alternative: Tạm thời không dùng Public URL

Nếu không muốn enable public access ngay, bạn có thể generate signed URLs:

```typescript
// Sẽ implement sau nếu cần
async generateSignedUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: this.bucketName,
    Key: key,
  });
  return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
}
```

## Khuyến nghị

Với project này, tôi khuyến nghị dùng **Option 1: R2.dev subdomain**:
- Miễn phí
- Dễ setup (1 click)
- Đủ cho development và production nhỏ
- Có thể chuyển sang custom domain sau

Hãy làm theo các bước trên và cập nhật đúng URL vào `.env` file!

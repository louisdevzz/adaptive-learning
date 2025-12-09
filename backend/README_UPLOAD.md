# Cloudflare R2 Upload Integration

Hệ thống upload ảnh avatar và file sử dụng Cloudflare R2 (S3-compatible storage).

## Cài đặt

Các package đã được cài đặt:
- `@aws-sdk/client-s3` - AWS S3 client for Cloudflare R2
- `@aws-sdk/lib-storage` - Upload utilities
- `multer` - File upload middleware
- `uuid` - Generate unique file names

## Cấu hình

### 1. Thiết lập Environment Variables

Thêm các biến môi trường sau vào file `.env`:

```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your-bucket.r2.dev
```

### 2. Lấy Cloudflare R2 Credentials

1. Truy cập [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Chọn **R2 Object Storage** từ menu bên trái
3. Tạo bucket mới hoặc sử dụng bucket có sẵn
4. Vào **Settings** > **R2 API Tokens** > **Create API Token**
5. Chọn quyền **Object Read & Write**
6. Copy Account ID, Access Key ID, và Secret Access Key

### 3. Thiết lập Public URL cho Bucket

1. Trong R2 bucket settings, chọn **Settings** > **Public Access**
2. Chọn **Connect Domain** hoặc **Allow Access**
3. Copy public URL (format: `https://your-bucket.r2.dev`)

## Cấu trúc Code

```
backend/src/
├── config/
│   └── r2.config.ts          # R2 configuration
├── upload/
│   ├── upload.module.ts      # Upload module
│   ├── upload.service.ts     # Upload service logic
│   └── upload.controller.ts  # Upload endpoints
└── app.module.ts             # Import UploadModule
```

## API Endpoints

### 1. Upload Avatar

**POST** `/api/upload/avatar`

Upload avatar image (JPEG, PNG, GIF, WebP, max 5MB)

**Headers:**
```
x-api-key: your-api-key
Cookie: access_token=<jwt_token>
Content-Type: multipart/form-data
```

**Request:**
```bash
curl -X POST http://localhost:8000/api/upload/avatar \
  -H "x-api-key: your-api-key" \
  -b cookies.txt \
  -F "file=@avatar.jpg"
```

**Response:**
```json
{
  "message": "Avatar uploaded successfully",
  "url": "https://your-bucket.r2.dev/avatars/uuid.jpg"
}
```

### 2. Upload File

**POST** `/api/upload/file`

Upload any file (same validation as avatar)

## Sử dụng trong Frontend

### JavaScript/TypeScript

```javascript
// Upload avatar
const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://localhost:8000/api/upload/avatar', {
    method: 'POST',
    headers: {
      'x-api-key': 'your-api-key',
    },
    credentials: 'include',
    body: formData,
  });

  const data = await response.json();
  return data.url;
};

// Update user avatar
const updateUserAvatar = async (userId: string, avatarUrl: string) => {
  const response = await fetch(`http://localhost:8000/api/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'your-api-key',
    },
    credentials: 'include',
    body: JSON.stringify({ avatarUrl }),
  });

  return response.json();
};
```

### React Example

```tsx
import { useState } from 'react';

function AvatarUpload() {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
        },
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();
      setAvatarUrl(data.url);

      // Update user profile
      await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
        },
        credentials: 'include',
        body: JSON.stringify({ avatarUrl: data.url }),
      });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {avatarUrl && <img src={avatarUrl} alt="Avatar" />}
    </div>
  );
}
```

## File Validation

### Supported File Types
- JPEG (`image/jpeg`)
- PNG (`image/png`)
- GIF (`image/gif`)
- WebP (`image/webp`)

### File Size Limit
- Maximum: 5MB

### Error Handling

```typescript
try {
  const url = await uploadAvatar(file);
} catch (error) {
  if (error.statusCode === 400) {
    if (error.message.includes('file type')) {
      // Invalid file type
    } else if (error.message.includes('size')) {
      // File too large
    }
  } else if (error.statusCode === 401) {
    // Not authenticated
  }
}
```

## Security

1. **Authentication Required**: Tất cả upload endpoints yêu cầu JWT token
2. **API Key Required**: Yêu cầu `x-api-key` header
3. **File Type Validation**: Chỉ chấp nhận image formats
4. **File Size Limit**: Maximum 5MB
5. **Unique File Names**: Sử dụng UUID để tránh trùng lặp
6. **CORS Protection**: Chỉ accept từ configured origins

## Troubleshooting

### Error: "Failed to upload file"
- Kiểm tra R2 credentials trong `.env`
- Verify bucket name và permissions
- Check network connectivity

### Error: "Invalid API Key"
- Verify `x-api-key` header
- Check `.env` API_KEY configuration

### Error: "Unauthorized"
- Ensure user is logged in
- Check JWT token validity
- Verify cookie settings

## Performance

- Files được upload trực tiếp lên R2 (không qua server disk)
- Sử dụng AWS SDK multipart upload cho files lớn
- Unique filenames với UUID để cache effectively

## Next Steps

1. Cấu hình R2 bucket với custom domain (optional)
2. Setup CDN cho faster delivery
3. Implement image optimization/resizing
4. Add progress tracking cho uploads
5. Implement file deletion/cleanup

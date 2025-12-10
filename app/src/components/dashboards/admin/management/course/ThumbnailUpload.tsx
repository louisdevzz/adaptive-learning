"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";
import { Button } from "@heroui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface ThumbnailUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  disabled?: boolean;
}

export function ThumbnailUpload({
  value,
  onChange,
  label = "Hình ảnh thumbnail",
  disabled = false,
}: ThumbnailUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const [preview, setPreview] = useState<string>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(value);
  }, [value]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Chỉ hỗ trợ file ảnh: JPEG, PNG, GIF, WebP");
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Kích thước file không được vượt quá 5MB");
      return;
    }

    setError("");
    setUploading(true);

    try {
      // Create local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server - using file endpoint for thumbnails
      const response = await api.upload.file(file);
      onChange(response.url);
      setPreview(response.url);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(
        err.response?.data?.message || "Lỗi khi upload ảnh. Vui lòng thử lại."
      );
      setPreview(value); // Reset to original value
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange("");
    setPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-[#181d27]">
        {label} <span className="text-red-500">*</span>
      </label>

      <div className="flex flex-col gap-3">
        {/* Thumbnail Preview */}
        <div className="relative w-full">
          {preview ? (
            <div className="relative w-[200px] h-60 rounded-lg overflow-hidden border-2 border-[#e9eaeb] bg-[#f0f0f0]">
              <img
                src={preview}
                alt="Thumbnail preview"
                className="w-full h-full object-cover"
              />
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
              {!uploading && preview && (
                <Button
                  isIconOnly
                  size="sm"
                  variant="solid"
                  className="absolute top-2 right-2 bg-red-500 text-white"
                  onPress={handleRemove}
                  isDisabled={disabled}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ) : (
            <div className="w-full h-48 rounded-lg bg-[#f0f0f0] border-2 border-dashed border-[#d5d7da] flex flex-col items-center justify-center gap-2">
              <Upload className="w-8 h-8 text-[#535862]" />
              <p className="text-sm text-[#535862]">Chưa có hình ảnh</p>
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="bordered"
              onPress={handleClick}
              isDisabled={disabled || uploading}
              className="border-[#d5d7da]"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang upload...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  {preview ? "Thay đổi ảnh" : "Chọn ảnh"}
                </>
              )}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled}
          />

          <p className="text-xs text-[#535862]">
            JPEG, PNG, GIF hoặc WebP. Tối đa 5MB.
          </p>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}


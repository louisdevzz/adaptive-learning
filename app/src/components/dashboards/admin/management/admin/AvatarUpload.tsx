"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@heroui/button";
import { Upload, X, Check, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface AvatarUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  disabled?: boolean;
}

export function AvatarUpload({
  value,
  onChange,
  label = "Avatar",
  disabled = false,
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const [preview, setPreview] = useState<string>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      // Upload to server
      const response = await api.upload.avatar(file);
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
      <label className="text-sm font-medium text-[#181d27]">{label}</label>

      <div className="flex items-center gap-4">
        {/* Avatar Preview */}
        <div className="relative">
          {preview ? (
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#e9eaeb]">
              <img
                src={preview}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#f0f0f0] border-2 border-dashed border-[#d5d7da] flex items-center justify-center">
              <Upload className="w-6 h-6 text-[#535862]" />
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex flex-col gap-2 flex-1">
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
                  Chọn ảnh
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

"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUploadAvatar } from "@/hooks/useProfile";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

interface AvatarUploadProps {
  userId: string;
  currentImage?: string | null;
  name: string;
  onUploaded?: (url: string) => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AvatarUpload({
  userId,
  currentImage,
  name,
  onUploaded,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const upload = useUploadAvatar(userId);

  async function handleFile(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Use JPEG, PNG, or WebP");
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("File must be under 5MB");
      return;
    }

    setPreview(URL.createObjectURL(file));
    try {
      const result = await upload.mutateAsync(file);
      onUploaded?.(result.profileImage);
      toast.success("Avatar updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
      setPreview(null);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="group relative">
        <Avatar className="size-24">
          <AvatarImage
            src={preview ?? currentImage ?? undefined}
            alt={name}
          />
          <AvatarFallback className="bg-primary text-lg text-primary-foreground">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <button
          type="button"
          className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition group-hover:opacity-100"
          onClick={() => inputRef.current?.click()}
        >
          <Camera className="size-6 text-white" />
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={upload.isPending}
        onClick={() => inputRef.current?.click()}
      >
        {upload.isPending ? "Uploading..." : "Upload photo"}
      </Button>
    </div>
  );
}

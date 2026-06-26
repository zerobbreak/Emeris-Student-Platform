"use client";

import { useRef, useState } from "react";
import { ImagePlus, Link2, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type ComposeImageAttachmentProps = {
  imageUrl: string;
  imageUrlInput: string;
  isBusy: boolean;
  error?: string;
  onImageUrlInputChange: (value: string) => void;
  onApplyImageUrl: (url: string) => void;
  onClearImage: () => void;
  onUploadFile: (file: File) => Promise<void>;
  isUploading: boolean;
};

export function ComposeImageAttachment({
  imageUrl,
  imageUrlInput,
  isBusy,
  error,
  onImageUrlInputChange,
  onApplyImageUrl,
  onClearImage,
  onUploadFile,
  isUploading,
}: ComposeImageAttachmentProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [linkOpen, setLinkOpen] = useState(false);

  function handleApplyImageLink() {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    onApplyImageUrl(trimmed);
    setLinkOpen(false);
  }

  async function handleImageFileChange(file: File | undefined) {
    if (!file) return;
    try {
      await onUploadFile(file);
      toast.success("Image attached");
    } catch (uploadError) {
      toast.error(
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload image",
      );
    }
  }

  if (imageUrl) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-border/70 bg-muted/20 shadow-sm">
        <div className="aspect-video w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Attached image preview"
            className="size-full object-cover"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          className="absolute top-2.5 right-2.5 bg-background/90 shadow-md backdrop-blur-sm"
          onClick={onClearImage}
          disabled={isBusy}
          aria-label="Remove image"
        >
          <X className="size-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-muted/20 p-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isBusy}
          onClick={() => fileInputRef.current?.click()}
          className="h-8 flex-1 gap-2 rounded-lg text-muted-foreground hover:bg-background hover:text-foreground"
        >
          {isUploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ImagePlus className="size-4" />
          )}
          Add image
        </Button>

        <Popover open={linkOpen} onOpenChange={setLinkOpen}>
          <PopoverTrigger
            disabled={isBusy}
            render={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isBusy}
                className="h-8 flex-1 gap-2 rounded-lg text-muted-foreground hover:bg-background hover:text-foreground"
              >
                <Link2 className="size-4" />
                Paste link
              </Button>
            }
          />
          <PopoverContent align="end" className="w-80">
            <PopoverHeader>
              <PopoverTitle>Image link</PopoverTitle>
              <PopoverDescription>
                Paste a direct URL to a JPEG, PNG, or WebP file.
              </PopoverDescription>
            </PopoverHeader>
            <InputGroup>
              <InputGroupInput
                type="url"
                value={imageUrlInput}
                onChange={(event) => onImageUrlInputChange(event.target.value)}
                placeholder="https://..."
                aria-invalid={!!error}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleApplyImageLink();
                  }
                }}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  variant="default"
                  onClick={handleApplyImageLink}
                >
                  Add
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </PopoverContent>
        </Popover>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          void handleImageFileChange(file);
        }}
      />
    </>
  );
}

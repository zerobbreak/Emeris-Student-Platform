"use client";

import { useRef, useState } from "react";
import { ImagePlus, Link2, Loader2, Send, X } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { useCreateFeedPost, useUploadFeedImage } from "@/hooks/useFeed";
import { getCourseLabel } from "@/lib/constants/itCourses";
import { createFeedPostSchema } from "@/lib/validators/feedValidator";
import type { AuthUser } from "@/types/auth";
import type { PublicProfile } from "@/types/profile";
import { cn } from "@/lib/utils";

const MAX_TEXT_LENGTH = 2000;

const hiveWash = {
  backgroundImage:
    "radial-gradient(circle at 12% 88%, #7ec8a4 0%, transparent 48%), radial-gradient(circle at 88% 12%, #c6a45b 0%, transparent 42%)",
};

type CreatePostDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AuthUser;
  profile: PublicProfile | undefined;
  placeholder?: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function authorSubtitle(profile: PublicProfile | undefined) {
  const course = getCourseLabel(profile?.course ?? null);
  const parts = [course, profile?.year ? `Year ${profile.year}` : null].filter(
    Boolean,
  );
  return parts.join(" · ");
}

export function CreatePostDialog({
  open,
  onOpenChange,
  user,
  profile,
  placeholder = "Share an update with the Hive...",
}: CreatePostDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    text?: string;
    imageUrl?: string;
  }>({});

  const createPost = useCreateFeedPost();
  const uploadImage = useUploadFeedImage();

  const isBusy = createPost.isPending || uploadImage.isPending;
  const subtitle = authorSubtitle(profile);
  const canPublish = text.trim().length > 0 && !isBusy;
  const charProgress = Math.min(100, (text.length / MAX_TEXT_LENGTH) * 100);
  const charNearLimit = text.length > MAX_TEXT_LENGTH * 0.85;

  function resetForm() {
    setText("");
    setImageUrl("");
    setImageUrlInput("");
    setLinkOpen(false);
    setFieldErrors({});
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && !isBusy) {
      resetForm();
    }
    onOpenChange(nextOpen);
  }

  function applyImageUrl(url: string) {
    setImageUrl(url);
    setImageUrlInput(url);
    setFieldErrors((current) => ({ ...current, imageUrl: undefined }));
  }

  function clearImage() {
    setImageUrl("");
    setImageUrlInput("");
    setLinkOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleImageFileChange(file: File | undefined) {
    if (!file) return;

    try {
      const result = await uploadImage.mutateAsync(file);
      applyImageUrl(result.imageUrl);
      toast.success("Image attached");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload image",
      );
    }
  }

  function handleApplyImageLink() {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) {
      setFieldErrors((current) => ({
        ...current,
        imageUrl: "Enter an image URL",
      }));
      return;
    }

    applyImageUrl(trimmed);
    setLinkOpen(false);
  }

  async function handlePublish() {
    const parsed = createFeedPostSchema.safeParse({
      text,
      imageUrl: imageUrl || imageUrlInput,
    });

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        text: flattened.text?.[0],
        imageUrl: flattened.imageUrl?.[0],
      });
      return;
    }

    setFieldErrors({});

    try {
      await createPost.mutateAsync(parsed.data);
      toast.success("Published");
      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to publish post",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[min(92dvh,52rem)] flex-col gap-0 overflow-hidden rounded-2xl border-0 p-0 shadow-xl ring-1 ring-primary/10 sm:max-w-lg">
        <header className="relative shrink-0 overflow-hidden bg-primary px-6 py-4 pr-14 text-primary-foreground">
          <div
            className="pointer-events-none absolute inset-0 opacity-25 motion-safe:transition-opacity"
            style={hiveWash}
          />
          <div className="relative space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge className="border-white/20 bg-white/15 text-[11px] text-white hover:bg-white/15">
                Hive
              </Badge>
              <DialogTitle className="font-heading text-base font-semibold tracking-tight text-white">
                New post
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs leading-relaxed text-white/80">
              Visible to your cohort on the feed.
            </DialogDescription>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-card">
          <div className="space-y-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 ring-2 ring-primary/10">
              <AvatarImage
                src={profile?.profileImage ?? undefined}
                alt={user.name}
              />
              <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium leading-none">
                {user.name}
              </p>
              {subtitle ? (
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="post-text" className="sr-only">
              Post text
            </Label>
            <InputGroup
              className={cn(
                "h-auto flex-col items-stretch rounded-xl border-border/80 bg-background/60 shadow-sm has-[>textarea]:h-auto dark:bg-input/20",
                fieldErrors.text && "border-destructive",
              )}
            >
              <InputGroupTextarea
                id="post-text"
                value={text}
                onChange={(event) => {
                  setText(event.target.value);
                  setFieldErrors((current) => ({
                    ...current,
                    text: undefined,
                  }));
                }}
                placeholder={placeholder}
                maxLength={MAX_TEXT_LENGTH}
                disabled={isBusy}
                aria-invalid={!!fieldErrors.text}
                className="min-h-38 px-3.5 pt-3.5 text-sm leading-relaxed"
              />
              <InputGroupAddon
                align="block-end"
                className="border-t border-border/60 bg-muted/30 px-3 py-2"
              >
                <InputGroupText className="text-xs tabular-nums">
                  <span
                    className={cn(
                      charNearLimit && "font-medium text-secondary-foreground",
                      text.length >= MAX_TEXT_LENGTH && "text-destructive",
                    )}
                  >
                    {text.length}
                  </span>
                  <span className="text-muted-foreground">
                    /{MAX_TEXT_LENGTH}
                  </span>
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            {fieldErrors.text ? (
              <p className="text-xs text-destructive">{fieldErrors.text}</p>
            ) : null}
          </div>

          {imageUrl ? (
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
                onClick={clearImage}
                disabled={isBusy}
                aria-label="Remove image"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-muted/20 p-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isBusy}
                onClick={() => fileInputRef.current?.click()}
                className="h-8 flex-1 gap-2 rounded-lg text-muted-foreground hover:bg-background hover:text-foreground"
              >
                {uploadImage.isPending ? (
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
                      onChange={(event) => {
                        setImageUrlInput(event.target.value);
                        setFieldErrors((current) => ({
                          ...current,
                          imageUrl: undefined,
                        }));
                      }}
                      placeholder="https://..."
                      aria-invalid={!!fieldErrors.imageUrl}
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
                  {fieldErrors.imageUrl ? (
                    <p className="text-xs text-destructive">
                      {fieldErrors.imageUrl}
                    </p>
                  ) : null}
                </PopoverContent>
              </Popover>
            </div>
          )}

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
          </div>
        </div>

        <DialogFooter className="shrink-0 flex-col gap-3 border-t border-border/60 bg-muted/25 px-8 py-6 sm:flex-col">
          <Progress
            value={charProgress}
            className={cn(
              "w-full gap-0",
              "**:data-[slot=progress-track]:h-0.5 **:data-[slot=progress-track]:bg-border/80",
              charNearLimit &&
                "**:data-[slot=progress-indicator]:bg-secondary",
              text.length >= MAX_TEXT_LENGTH &&
                "**:data-[slot=progress-indicator]:bg-destructive",
            )}
            aria-label="Character limit"
          />

          <div className="flex w-full items-center justify-end gap-2">
            <DialogClose
              render={
                <Button variant="ghost" size="sm" disabled={isBusy}>
                  Cancel
                </Button>
              }
            />
            <Button
              size="sm"
              className="min-w-24 shadow-sm"
              onClick={() => void handlePublish()}
              disabled={!canPublish}
            >
              {createPost.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Publish
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

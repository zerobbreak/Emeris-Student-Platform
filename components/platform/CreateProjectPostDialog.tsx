"use client";

import { useMemo, useState } from "react";
import {
  FolderKanban,
  HandHelping,
  Lightbulb,
  Loader2,
  Send,
} from "lucide-react";
import { toast } from "sonner";

import { ComposeAuthorRow } from "@/components/platform/compose/ComposeAuthorRow";
import { ComposeDialogShell } from "@/components/platform/compose/ComposeDialogShell";
import { ComposeImageAttachment } from "@/components/platform/compose/ComposeImageAttachment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  useCreateCommunityPost,
  useUploadCommunityPostImage,
} from "@/hooks/useCommunityPosts";
import { hiveProjects, statusLabels } from "@/lib/constants/hiveProjects";
import {
  createCommunityPostSchema,
  parseCommaSeparatedList,
} from "@/lib/validators/communityPostValidator";
import type { AuthUser } from "@/types/auth";
import type { CommunityPostKind } from "@/types/communityPost";
import type { PublicProfile } from "@/types/profile";
import { cn } from "@/lib/utils";

const MAX_EXCERPT_LENGTH = 2000;

const kindOptions: {
  id: CommunityPostKind;
  label: string;
  description: string;
  icon: typeof FolderKanban;
}[] = [
  {
    id: "project",
    label: "List project",
    description: "Share a Hive project build",
    icon: FolderKanban,
  },
  {
    id: "assistance",
    label: "Need help",
    description: "Ask peers for support",
    icon: HandHelping,
  },
  {
    id: "tip",
    label: "Share tip",
    description: "Pass on something useful",
    icon: Lightbulb,
  },
];

type CreateProjectPostDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AuthUser;
  profile: PublicProfile | undefined;
};

export function CreateProjectPostDialog({
  open,
  onOpenChange,
  user,
  profile,
}: CreateProjectPostDialogProps) {
  const [kind, setKind] = useState<CommunityPostKind>("project");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectStatus, setProjectStatus] = useState<string>("");
  const [technologiesInput, setTechnologiesInput] = useState("");
  const [assistanceArea, setAssistanceArea] = useState("");
  const [tipFocus, setTipFocus] = useState("");
  const [linkedProjectId, setLinkedProjectId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const createPost = useCreateCommunityPost();
  const uploadImage = useUploadCommunityPostImage();

  const isBusy = createPost.isPending || uploadImage.isPending;
  const charProgress = Math.min(100, (excerpt.length / MAX_EXCERPT_LENGTH) * 100);
  const charNearLimit = excerpt.length > MAX_EXCERPT_LENGTH * 0.85;

  const canPublish = useMemo(() => {
    if (!title.trim() || !excerpt.trim() || isBusy) return false;
    if (kind === "project") {
      return Boolean(
        projectTitle.trim() && projectStatus && technologiesInput.trim(),
      );
    }
    if (kind === "assistance") {
      return Boolean(assistanceArea.trim() && linkedProjectId && projectTitle.trim());
    }
    if (kind === "tip") return Boolean(tipFocus.trim());
    return false;
  }, [
    title,
    excerpt,
    isBusy,
    kind,
    projectTitle,
    projectStatus,
    technologiesInput,
    assistanceArea,
    tipFocus,
    linkedProjectId,
  ]);

  function resetForm() {
    setKind("project");
    setTitle("");
    setExcerpt("");
    setTagsInput("");
    setProjectTitle("");
    setProjectStatus("");
    setTechnologiesInput("");
    setAssistanceArea("");
    setTipFocus("");
    setLinkedProjectId("");
    setImageUrl("");
    setImageUrlInput("");
    setFieldErrors({});
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && !isBusy) resetForm();
    onOpenChange(nextOpen);
  }

  function handleLinkedProjectChange(projectId: string) {
    setLinkedProjectId(projectId);
    const project = hiveProjects.find((item) => item.id === projectId);
    if (project) {
      setProjectTitle(project.title);
      setProjectStatus(project.status);
      setTechnologiesInput(project.technologies.join(", "));
    }
  }

  function handleAssistanceProjectChange(projectId: string) {
    setLinkedProjectId(projectId);
    setFieldErrors((current) => ({
      ...current,
      projectId: "",
      projectTitle: "",
    }));
    const project = hiveProjects.find((item) => item.id === projectId);
    if (project) {
      setProjectTitle(project.title);
    } else {
      setProjectTitle("");
    }
  }

  const selectedAssistanceProject = useMemo(
    () => hiveProjects.find((item) => item.id === linkedProjectId),
    [linkedProjectId],
  );

  function buildPayload() {
    const tags = parseCommaSeparatedList(tagsInput);
    const base = {
      title,
      excerpt,
      tags,
      imageUrl: imageUrl || imageUrlInput,
      projectId: linkedProjectId,
      projectTitle: projectTitle || undefined,
    };

    if (kind === "project") {
      return {
        kind: "project" as const,
        ...base,
        projectTitle,
        projectStatus,
        technologies: parseCommaSeparatedList(technologiesInput),
      };
    }

    if (kind === "assistance") {
      return {
        kind: "assistance" as const,
        title,
        excerpt,
        tags,
        imageUrl: imageUrl || imageUrlInput,
        projectId: linkedProjectId,
        projectTitle,
        assistanceArea,
      };
    }

    return {
      kind: "tip" as const,
      title,
      excerpt,
      tags,
      imageUrl: imageUrl || imageUrlInput,
      tipFocus,
    };
  }

  async function handlePublish() {
    const parsed = createCommunityPostSchema.safeParse(buildPayload());

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      const nextErrors: Record<string, string> = {};
      for (const [key, messages] of Object.entries(flattened)) {
        if (messages?.[0]) nextErrors[key] = messages[0];
      }
      setFieldErrors(nextErrors);
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
    <ComposeDialogShell
      open={open}
      onOpenChange={handleOpenChange}
      variant="project"
      badge="Projects"
      title="New project post"
      description="List a build, ask for help, or share a tip with the Hive."
      footer={
        <>
          <Progress
            value={charProgress}
            className={cn(
              "w-full gap-0",
              "**:data-[slot=progress-track]:h-0.5 **:data-[slot=progress-track]:bg-border/80",
              charNearLimit &&
                "**:data-[slot=progress-indicator]:bg-secondary",
              excerpt.length >= MAX_EXCERPT_LENGTH &&
                "**:data-[slot=progress-indicator]:bg-destructive",
            )}
            aria-label="Description character limit"
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
        </>
      }
    >
      <ComposeAuthorRow name={user.name} profile={profile} />

      <div className="grid grid-cols-3 gap-2">
        {kindOptions.map((option) => {
          const Icon = option.icon;
          const selected = kind === option.id;
          return (
            <button
              key={option.id}
              type="button"
              disabled={isBusy}
              onClick={() => {
                setKind(option.id);
                setFieldErrors({});
              }}
              className={cn(
                "rounded-xl border px-2 py-2.5 text-left transition",
                selected
                  ? "border-primary/40 bg-primary/5 shadow-sm"
                  : "border-border/70 bg-muted/20 hover:border-primary/20 hover:bg-muted/40",
              )}
            >
              <Icon
                className={cn(
                  "mb-1.5 size-4",
                  selected ? "text-primary" : "text-muted-foreground",
                )}
              />
              <p className="text-xs font-medium leading-none">{option.label}</p>
              <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
                {option.description}
              </p>
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-post-title">Title</Label>
        <Input
          id="project-post-title"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setFieldErrors((current) => ({ ...current, title: "" }));
          }}
          placeholder={
            kind === "project"
              ? "Listed: Campus Navigation PWA"
              : kind === "assistance"
                ? "Need help: Firebase role permissions"
                : "Tip: README sections lecturers read"
          }
          disabled={isBusy}
          aria-invalid={!!fieldErrors.title}
          className={cn(fieldErrors.title && "border-destructive")}
        />
        {fieldErrors.title ? (
          <p className="text-xs text-destructive">{fieldErrors.title}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-post-excerpt">Description</Label>
        <InputGroup
          className={cn(
            "h-auto flex-col items-stretch rounded-xl border-border/80 bg-background/60 shadow-sm has-[>textarea]:h-auto",
            fieldErrors.excerpt && "border-destructive",
          )}
        >
          <InputGroupTextarea
            id="project-post-excerpt"
            value={excerpt}
            onChange={(event) => {
              setExcerpt(event.target.value);
              setFieldErrors((current) => ({ ...current, excerpt: "" }));
            }}
            placeholder="What should peers know about this?"
            maxLength={MAX_EXCERPT_LENGTH}
            disabled={isBusy}
            aria-invalid={!!fieldErrors.excerpt}
            className="min-h-28 px-3.5 pt-3.5 text-sm leading-relaxed"
          />
          <InputGroupAddon
            align="block-end"
            className="border-t border-border/60 bg-muted/30 px-3 py-2"
          >
            <InputGroupText className="text-xs tabular-nums">
              <span
                className={cn(
                  charNearLimit && "font-medium text-secondary-foreground",
                  excerpt.length >= MAX_EXCERPT_LENGTH && "text-destructive",
                )}
              >
                {excerpt.length}
              </span>
              <span className="text-muted-foreground">
                /{MAX_EXCERPT_LENGTH}
              </span>
            </InputGroupText>
          </InputGroupAddon>
        </InputGroup>
        {fieldErrors.excerpt ? (
          <p className="text-xs text-destructive">{fieldErrors.excerpt}</p>
        ) : null}
      </div>

      {kind === "project" ? (
        <div className="space-y-3 rounded-xl border border-primary/15 bg-primary/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            Project details
          </p>
          <div className="space-y-2">
            <Label htmlFor="linked-project">Link Hive project (optional)</Label>
            <Select
              value={linkedProjectId}
              onValueChange={(value) =>
                handleLinkedProjectChange(value ?? "")
              }
              disabled={isBusy}
            >
              <SelectTrigger id="linked-project" className="w-full">
                <SelectValue placeholder="Select from gallery..." />
              </SelectTrigger>
              <SelectContent>
                {hiveProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-title">Project name</Label>
            <Input
              id="project-title"
              value={projectTitle}
              onChange={(event) => {
                setProjectTitle(event.target.value);
                setFieldErrors((current) => ({ ...current, projectTitle: "" }));
              }}
              disabled={isBusy}
              aria-invalid={!!fieldErrors.projectTitle}
            />
            {fieldErrors.projectTitle ? (
              <p className="text-xs text-destructive">
                {fieldErrors.projectTitle}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-status">Status</Label>
            <Select
              value={projectStatus}
              onValueChange={(value) => {
                setProjectStatus(value ?? "");
                setFieldErrors((current) => ({ ...current, projectStatus: "" }));
              }}
              disabled={isBusy}
            >
              <SelectTrigger id="project-status" className="w-full">
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.projectStatus ? (
              <p className="text-xs text-destructive">
                {fieldErrors.projectStatus}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="technologies">Technologies</Label>
            <Input
              id="technologies"
              value={technologiesInput}
              onChange={(event) => {
                setTechnologiesInput(event.target.value);
                setFieldErrors((current) => ({ ...current, technologies: "" }));
              }}
              placeholder="React, TypeScript, PostgreSQL"
              disabled={isBusy}
              aria-invalid={!!fieldErrors.technologies}
            />
            {fieldErrors.technologies ? (
              <p className="text-xs text-destructive">
                {fieldErrors.technologies}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Separate with commas.
              </p>
            )}
          </div>
        </div>
      ) : null}

      {kind === "assistance" ? (
        <div className="space-y-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-800 dark:text-amber-200">
            Project reference
          </p>
          <div className="space-y-2">
            <Label htmlFor="assistance-project">Which project needs help?</Label>
            <Select
              value={linkedProjectId}
              onValueChange={(value) =>
                handleAssistanceProjectChange(value ?? "")
              }
              disabled={isBusy}
            >
              <SelectTrigger
                id="assistance-project"
                className={cn(
                  "w-full",
                  fieldErrors.projectId && "border-destructive",
                )}
                aria-invalid={!!fieldErrors.projectId}
              >
                <SelectValue placeholder="Select from Hive gallery..." />
              </SelectTrigger>
              <SelectContent>
                {hiveProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.projectId ? (
              <p className="text-xs text-destructive">{fieldErrors.projectId}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Help requests must link to a specific Hive project.
              </p>
            )}
          </div>

          {selectedAssistanceProject ? (
            <div className="rounded-lg border border-amber-500/15 bg-background/80 px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Referenced project
              </p>
              <p className="mt-1 text-sm font-medium">
                {selectedAssistanceProject.title}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge
                  variant="outline"
                  className="border-amber-500/25 bg-amber-500/10 text-[10px] text-amber-900 dark:text-amber-100"
                >
                  {statusLabels[selectedAssistanceProject.status]}
                </Badge>
                {selectedAssistanceProject.technologies.slice(0, 3).map((tech) => (
                  <Badge
                    key={tech}
                    variant="outline"
                    className="text-[10px] text-muted-foreground"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-2 border-t border-amber-500/15 pt-3">
            <Label htmlFor="assistance-area">What do you need help with?</Label>
            <Input
              id="assistance-area"
              value={assistanceArea}
              onChange={(event) => {
                setAssistanceArea(event.target.value);
                setFieldErrors((current) => ({ ...current, assistanceArea: "" }));
              }}
              placeholder="Firebase auth & role permissions"
              disabled={isBusy}
              aria-invalid={!!fieldErrors.assistanceArea}
            />
            {fieldErrors.assistanceArea ? (
              <p className="text-xs text-destructive">{fieldErrors.assistanceArea}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {kind === "tip" ? (
        <div className="space-y-2 rounded-xl border border-secondary/25 bg-secondary/10 p-4">
          <Label htmlFor="tip-focus">Focus area</Label>
          <Input
            id="tip-focus"
            value={tipFocus}
            onChange={(event) => {
              setTipFocus(event.target.value);
              setFieldErrors((current) => ({ ...current, tipFocus: "" }));
            }}
            placeholder="README & deployment links"
            disabled={isBusy}
            aria-invalid={!!fieldErrors.tipFocus}
          />
          {fieldErrors.tipFocus ? (
            <p className="text-xs text-destructive">{fieldErrors.tipFocus}</p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          value={tagsInput}
          onChange={(event) => {
            setTagsInput(event.target.value);
            setFieldErrors((current) => ({ ...current, tags: "" }));
          }}
          placeholder="hive-projects, react, help-wanted"
          disabled={isBusy}
          aria-invalid={!!fieldErrors.tags}
        />
        {fieldErrors.tags ? (
          <p className="text-xs text-destructive">{fieldErrors.tags}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Separate with commas. Up to 8 tags.
          </p>
        )}
      </div>

      <ComposeImageAttachment
        imageUrl={imageUrl}
        imageUrlInput={imageUrlInput}
        isBusy={isBusy}
        error={fieldErrors.imageUrl}
        isUploading={uploadImage.isPending}
        onImageUrlInputChange={setImageUrlInput}
        onApplyImageUrl={(url) => {
          setImageUrl(url);
          setImageUrlInput(url);
          setFieldErrors((current) => ({ ...current, imageUrl: "" }));
        }}
        onClearImage={() => {
          setImageUrl("");
          setImageUrlInput("");
        }}
        onUploadFile={async (file) => {
          const result = await uploadImage.mutateAsync(file);
          setImageUrl(result.imageUrl);
          setImageUrlInput(result.imageUrl);
          setFieldErrors((current) => ({ ...current, imageUrl: "" }));
        }}
      />
    </ComposeDialogShell>
  );
}

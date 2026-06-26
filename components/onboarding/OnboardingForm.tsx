"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { IT_COURSES } from "@/lib/constants/itCourses";
import { seedSkills } from "@/drizzle/seeds/skills";
import { useCurrentUser } from "@/hooks/useAuth";
import { useAddSkill, useProfile, useUpdateProfile } from "@/hooks/useProfile";
import {
  getFirstIncompleteStep,
  getOnboardingProgress,
  isOnboardingDataComplete,
  ONBOARDING_STEP_COUNT,
} from "@/lib/onboarding/status";
import type { AuthUser } from "@/types/auth";
import type { PublicProfile } from "@/types/profile";

export function OnboardingForm() {
  const { data: user } = useCurrentUser();
  const { data: profile, isLoading, refetch } = useProfile(user?.id ?? null);

  if (!user || isLoading || !profile) {
    return <p className="text-muted-foreground">Loading your profile...</p>;
  }

  return (
    <OnboardingFormContent
      user={user}
      profile={profile}
      refetch={refetch}
    />
  );
}

interface OnboardingFormContentProps {
  user: AuthUser;
  profile: PublicProfile;
  refetch: ReturnType<typeof useProfile>["refetch"];
}

function OnboardingFormContent({
  user,
  profile,
  refetch,
}: OnboardingFormContentProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const updateProfile = useUpdateProfile(user.id);
  const addSkill = useAddSkill(user.id);

  const [step, setStep] = useState(() => getFirstIncompleteStep(profile));
  const [bio, setBio] = useState(() => profile.bio ?? "");
  const [course, setCourse] = useState(() => profile.course ?? "");
  const [year, setYear] = useState(() => profile.year?.toString() ?? "");
  const [location, setLocation] = useState(() => profile.location ?? "");
  const [githubUrl, setGithubUrl] = useState(() => profile.githubUrl ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(() => profile.linkedinUrl ?? "");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    () => profile.skills?.map((s) => s.name) ?? [],
  );

  function draftProfile(): PublicProfile {
    return {
      ...profile,
      bio: bio || profile.bio,
      course: course || profile.course,
      year: year ? Number(year) : profile.year,
      location: location || profile.location,
      githubUrl: githubUrl || profile.githubUrl,
      linkedinUrl: linkedinUrl || profile.linkedinUrl,
      skills:
        selectedSkills.length > 0
          ? selectedSkills.map((name) => ({
              id: name,
              name,
              category: "soft",
              endorsementCount: 0,
            }))
          : profile.skills,
    };
  }

  const progress = getOnboardingProgress(draftProfile());
  const canFinish = isOnboardingDataComplete(draftProfile());

  async function saveStep(data: Record<string, unknown>) {
    await updateProfile.mutateAsync(data);
    await refetch();
  }

  async function advanceAfterSave() {
    const result = await refetch();
    const updated = result.data;
    if (!updated) return;
    setStep(getFirstIncompleteStep(updated));
  }

  async function handleSkip() {
    if (step === 2) {
      setStep(3);
      return;
    }
    if (step === 4) {
      await handleComplete();
    }
  }

  async function handleNext() {
    try {
      if (step === 1) {
        if (!course || !year) {
          toast.error("Course and year are required");
          return;
        }
        await saveStep({
          bio: bio || undefined,
          course,
          year: Number(year),
          location: location || undefined,
        });
        await advanceAfterSave();
      } else if (step === 2) {
        await saveStep({
          githubUrl: githubUrl || "",
          linkedinUrl: linkedinUrl || "",
        });
        await advanceAfterSave();
      } else if (step === 3) {
        const existing = new Set(profile.skills?.map((s) => s.name) ?? []);
        const toAdd = selectedSkills.filter((name) => !existing.has(name));
        if (toAdd.length < 1 && (profile.skills?.length ?? 0) < 1) {
          toast.error("Select at least one skill");
          return;
        }
        for (const skillName of toAdd) {
          await addSkill.mutateAsync({ skillName });
        }
        await refetch();
        await advanceAfterSave();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    }
  }

  async function handleComplete() {
    try {
      await updateProfile.mutateAsync({ isOnboarded: true });
      // Invalidate the auth query so OnboardingGate sees the updated flag
      await queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
      toast.success("Profile setup complete!");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to complete");
    }
  }

  function toggleSkill(name: string) {
    setSelectedSkills((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name],
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Step {step} of {ONBOARDING_STEP_COUNT}
          </span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} />
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Tell us about yourself</h2>
          <p className="text-sm text-muted-foreground">
            Add your course and year to get started.
          </p>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              maxLength={500}
              rows={4}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="course">Course *</Label>
            <Select value={course} onValueChange={(v) => setCourse(v ?? "")}>
              <SelectTrigger id="course">
                <SelectValue placeholder="Select your course" />
              </SelectTrigger>
              <SelectContent>
                {IT_COURSES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Year *</Label>
            <Select value={year} onValueChange={(v) => setYear(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {["1", "2", "3", "4"].map((y) => (
                  <SelectItem key={y} value={y}>
                    Year {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Connect your profiles</h2>
          <p className="text-sm text-muted-foreground">
            Optional — add links so others can find you.
          </p>
          <div className="space-y-2">
            <Label htmlFor="github">GitHub URL</Label>
            <Input
              id="github"
              value={githubUrl}
              placeholder="https://github.com/username"
              onChange={(e) => setGithubUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input
              id="linkedin"
              value={linkedinUrl}
              placeholder="https://linkedin.com/in/username"
              onChange={(e) => setLinkedinUrl(e.target.value)}
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Pick your skills</h2>
          <p className="text-sm text-muted-foreground">
            Select at least one skill for your profile.
          </p>
          <div className="flex max-h-64 flex-wrap gap-2 overflow-y-auto">
            {seedSkills.map((skill) => (
              <Button
                key={skill.name}
                type="button"
                size="sm"
                variant={
                  selectedSkills.includes(skill.name) ? "default" : "outline"
                }
                onClick={() => toggleSkill(skill.name)}
              >
                {skill.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Add a profile photo</h2>
          <p className="text-sm text-muted-foreground">
            Optional — you can skip this step.
          </p>
          <AvatarUpload
            userId={user.id}
            name={user.name}
            currentImage={profile.profileImage}
            onUploaded={() => refetch()}
          />
        </div>
      )}

      <div className="flex justify-between">
        {step > 1 ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(step - 1)}
          >
            Back
          </Button>
        ) : (
          <div />
        )}
        <div className="flex gap-2">
          {(step === 2 || step === 4) && (
            <Button type="button" variant="ghost" onClick={handleSkip}>
              Skip
            </Button>
          )}
          {step < ONBOARDING_STEP_COUNT ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={updateProfile.isPending || addSkill.isPending}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleComplete}
              disabled={!canFinish || updateProfile.isPending}
            >
              Finish
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

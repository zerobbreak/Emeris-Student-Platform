"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { IT_COURSES } from "@/lib/constants/itCourses";
import { useUpdateProfile } from "@/hooks/useProfile";
import type { PublicProfile } from "@/types/profile";

interface ProfileEditFormProps {
  profile: PublicProfile;
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter();
  const updateProfile = useUpdateProfile(profile.id);
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [course, setCourse] = useState(profile.course ?? "");
  const [year, setYear] = useState(profile.year?.toString() ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [githubUrl, setGithubUrl] = useState(profile.githubUrl ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedinUrl ?? "");
  const [profileImage, setProfileImage] = useState(profile.profileImage);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({
        name,
        bio: bio || undefined,
        course: course || undefined,
        year: year ? Number(year) : undefined,
        location: location || undefined,
        githubUrl: githubUrl || "",
        linkedinUrl: linkedinUrl || "",
      });
      toast.success("Profile updated");
      router.push(`/profile/${profile.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AvatarUpload
        userId={profile.id}
        currentImage={profileImage}
        name={name}
        onUploaded={setProfileImage}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            maxLength={500}
            rows={4}
            onChange={(e) => setBio(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">{bio.length}/500</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="course">Course</Label>
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
          <Label>Year</Label>
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
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
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
      <div className="flex gap-3">
        <Button type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending ? "Saving..." : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

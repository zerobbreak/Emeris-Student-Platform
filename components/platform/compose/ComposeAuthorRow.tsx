import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCourseLabel } from "@/lib/constants/itCourses";
import type { PublicProfile } from "@/types/profile";

import { getInitials } from "./composeUtils";

type ComposeAuthorRowProps = {
  name: string;
  profile: PublicProfile | undefined;
};

function authorSubtitle(profile: PublicProfile | undefined) {
  const course = getCourseLabel(profile?.course ?? null);
  const parts = [course, profile?.year ? `Year ${profile.year}` : null].filter(
    Boolean,
  );
  return parts.join(" · ");
}

export function ComposeAuthorRow({ name, profile }: ComposeAuthorRowProps) {
  const subtitle = authorSubtitle(profile);

  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-10 ring-2 ring-primary/10">
        <AvatarImage
          src={profile?.profileImage ?? undefined}
          alt={name}
        />
        <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium leading-none">{name}</p>
        {subtitle ? (
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}

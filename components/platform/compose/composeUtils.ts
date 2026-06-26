export const hiveWashFeed = {
  backgroundImage:
    "radial-gradient(circle at 12% 88%, #7ec8a4 0%, transparent 48%), radial-gradient(circle at 88% 12%, #c6a45b 0%, transparent 42%)",
};

export const hiveWashProject = {
  backgroundImage:
    "radial-gradient(circle at 8% 92%, #c6a45b 0%, transparent 44%), radial-gradient(circle at 92% 8%, #7ec8a4 0%, transparent 40%)",
};

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

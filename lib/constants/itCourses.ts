export const IT_COURSES = [
  {
    code: "BCAD",
    label: "Bachelors in Computer Science in Application Development",
  },
  {
    code: "HCERT",
    label: "Higher Certificate in Mobile and Web Development",
  },
  {
    code: "HON",
    label: "Honors in Computer Science",
  },
] as const;

export type ItCourseCode = (typeof IT_COURSES)[number]["code"];

export const IT_COURSE_CODES = IT_COURSES.map((c) => c.code) as [
  ItCourseCode,
  ...ItCourseCode[],
];

export function getCourseLabel(code: string | null | undefined) {
  if (!code) return null;
  return IT_COURSES.find((c) => c.code === code)?.label ?? code;
}

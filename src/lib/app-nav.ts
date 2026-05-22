export type UserRole = "STUDENT" | "TUTOR" | "ADMIN";

export type AppNavItem = {
  href: string;
  labelKey: string;
  iconKey:
    | "home"
    | "assignments"
    | "homework"
    | "rooms"
    | "progress"
    | "students"
    | "review"
    | "materials";
};

const studentNav: AppNavItem[] = [
  { href: "/dashboard", labelKey: "home", iconKey: "home" },
  { href: "/dashboard/assignments", labelKey: "assignments", iconKey: "assignments" },
  { href: "/dashboard/homework", labelKey: "homework", iconKey: "homework" },
  { href: "/dashboard/rooms", labelKey: "rooms", iconKey: "rooms" },
  { href: "/dashboard/progress", labelKey: "progress", iconKey: "progress" },
];

const tutorNav: AppNavItem[] = [
  { href: "/dashboard", labelKey: "home", iconKey: "home" },
  { href: "/dashboard/students", labelKey: "students", iconKey: "students" },
  { href: "/dashboard/rooms", labelKey: "rooms", iconKey: "rooms" },
  { href: "/dashboard/assignments", labelKey: "assignments", iconKey: "assignments" },
  { href: "/dashboard/review", labelKey: "review", iconKey: "review" },
  { href: "/dashboard/materials", labelKey: "materials", iconKey: "materials" },
];

export function getAppNav(role: UserRole | string | null | undefined): AppNavItem[] {
  return role === "TUTOR" ? tutorNav : studentNav;
}

export function isNavActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

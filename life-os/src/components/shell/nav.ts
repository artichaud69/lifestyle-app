export const PRIMARY_NAV = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/today", label: "Today", icon: "sun" },
  { href: "/life", label: "Life", icon: "compass" },
  { href: "/projects", label: "Projects", icon: "layers" },
  { href: "/insights", label: "Insights", icon: "chart" },
  { href: "/advisor", label: "Advisor", icon: "sparkles" },
] as const;

// The twelve modules live under these sections rather than crowding the sidebar.
export const LIFE_NAV = [
  { href: "/life", label: "Overview" },
  { href: "/life/goals", label: "Goals" },
  { href: "/life/journal", label: "Journal" },
  { href: "/life/identity", label: "Identity & values" },
  { href: "/memory", label: "Memory" },
] as const;

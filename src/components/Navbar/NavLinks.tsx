import { Home, Upload } from "lucide-react";
import DynamicFeedOutlinedIcon from "@mui/icons-material/DynamicFeedOutlined";
import AccountBoxOutlinedIcon from "@mui/icons-material/AccountBoxOutlined";
import { type NavItem } from "./types";

export const protectedLinks: NavItem[] = [
  { path: "/home", label: "Home", end: true, scrollvalue: 0, icon: <Home /> },
  { path: "/feed", label: "Feed", end: true, scrollvalue: 0, icon: <DynamicFeedOutlinedIcon /> },
  { path: "/upload", label: "Upload", end: true, scrollvalue: 0, icon: <Upload /> },
  { path: "/profile", label: "Profile", end: true, scrollvalue: 0, icon: <AccountBoxOutlinedIcon /> },
];

export const publicLinks: NavItem[] = [
  { path: "/home", label: "Home", scrollvalue: 0 },
  { path: "/home", label: "Featured Discoveries", scrollvalue: 950 },
  { path: "/home", label: "How it works", scrollvalue: 1600 },
  { path: "/home", label: "Community", scrollvalue: 2150 },
  { path: "/home", label: "Get Started", scrollvalue: 2750 },
];

export const publicLinksMobile: NavItem[] = [
  { path: "/home", label: "Home", scrollvalue: 0 },
  { path: "/home", label: "Featured Discoveries", scrollvalue: 1000 },
  { path: "/home", label: "How it works", scrollvalue: 1900 },
  { path: "/home", label: "Community", scrollvalue: 3000 },
  { path: "/home", label: "Get Started", scrollvalue: 4200 },
];

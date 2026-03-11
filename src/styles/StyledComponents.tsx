// StyledComponents.tsx

import { styled } from "@mui/material/styles";
import {
  Box,
  Button,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";

/* ==========================================
   Top Bar
========================================== */

export const TopBar = styled(Box)({
  background:
    "linear-gradient(to right, rgba(0, 1, 71, 1) 0%, rgb(22, 24, 157) 33%, rgb(51, 53, 154) 66%, #000147 100%)",
  color: "#fff",
  fontSize: "12px",
  borderBottom: "1px solid #fff",
});

/* ==========================================
   Language Option Box
========================================== */

export const LanguageOption = styled(Box)(
  ({ theme }: { theme: Theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
    padding: theme.spacing(1),
    minWidth: 80,
    minHeight: 50,
    textAlign: "center",
    fontSize: "12px",
    fontWeight: 500,
    color: "#000",
    cursor: "pointer",
  })
);

/* ==========================================
   Language Button
========================================== */

export const LanguageButton = styled(Button)({
  background: "transparent",
  border: "1px solid white",
  color: "white",
  borderRadius: "20px",
  textTransform: "none",
  fontSize: "12px",
  padding: "2px 10px",
  minHeight: "28px",
  display: "flex",
  alignItems: "center",
  gap: "4px",
  "&:hover": {
    background: "rgba(255,255,255,0.1)",
  },
});

/* ==========================================
   Logo Toolbar
========================================== */

export const LogoBar = styled(Toolbar)(
  ({ theme }: { theme: Theme }) => ({
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: theme.spacing(1.5, 2),

    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1, 1),
    },
  })
);

/* ==========================================
   Gradient Text
========================================== */

export const GradientText = styled("span")(
  ({ theme }: { theme: Theme }) => ({
    fontFamily: '"Happy Monkey", sans-serif',
    fontWeight: "bold",
    fontSize: "28px",
    background:
      "linear-gradient(90deg, #00f260, #0575e6, #ff3cac, #ff5e62)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    display: "inline-block",
    verticalAlign: "middle",

    [theme.breakpoints.down("sm")]: {
      fontSize: "20px",
    },
  })
);

/* ==========================================
   Menu Text
========================================== */

export const MenuText = styled(Typography)(
  ({ theme }: { theme: Theme }) => ({
    margin: theme.spacing(0, 1),
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    color: "#4f4f4f",
    display: "flex",
    alignItems: "center",
    letterSpacing: "1px",
    transition: "color 0.2s ease, letter-spacing 0.2s ease",

    "&:hover": {
      fontWeight: "bold",
      letterSpacing: "1.5px",
    },
  })
);

/* ==========================================
   Styled Icon Button
========================================== */

export const StyledIconButton = styled(IconButton)(
  ({ theme }: { theme: Theme }) => ({
    color: "#555",

    transition: "background 0.2s ease",

    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  })
);

/* ==========================================
   Styled Avatar
========================================== */

export const StyledAvatar = styled(Avatar)(
  ({ theme }: { theme: Theme }) => ({
    background:
      "linear-gradient(135deg, #f06d24, #d43a82)",

    color: "#fff",

    width: 45,
    height: 45,

    marginLeft: theme.spacing(2),

    cursor: "pointer",

    transition: "transform 0.2s ease",

    border: "2px solid #fff",

    boxShadow: `
      0 0 0 2px rgba(240,109,36,0.2),
      0 2px 8px rgba(0,0,0,0.12)
    `,

    "&:hover": {
      transform: "scale(1.05)",
    },

    [theme.breakpoints.down("sm")]: {
      width: 35,
      height: 35,
      marginLeft: theme.spacing(1),
    },
  })
);

/* ==========================================
   Gradient Hover Button
========================================== */

export const GradientHoverButton = styled(Button)(
  ({ theme }: { theme: Theme }) => ({
    textTransform: "none",

    fontWeight: "bold",

    borderRadius: 25,

    padding: "8px 24px",

    fontSize: "14px",

    border: "2px solid",

    borderColor: "#e25553",

    color: "#e25553",

    boxShadow: "0px 3px 10px rgba(0,0,0,0.05)",

    justifyContent: "flex-start",

    transition: "all 0.3s ease",

    position: "relative",

    overflow: "hidden",

    "&::before": {
      content: '""',

      position: "absolute",

      top: 0,
      left: 0,
      right: 0,
      bottom: 0,

      background:
        "linear-gradient(135deg, #f06d24, #d43a82)",

      opacity: 0,

      transition: "opacity 0.3s ease",

      zIndex: -1,
    },

    "&:hover": {
      color: "#fff",

      borderColor: "transparent",

      "&::before": {
        opacity: 1,
      },
    },
  })
);

/* ==========================================
   Language Colors
========================================== */

export const languageColors: Record<string, string> = {

  English: "#fce6e6",

  Hindi: "#d1ecff",

  Assamese: "#ffd6d6",

  Bengali: "#d4ccff",

  Gujarati: "#cbf4cb",

  Kannada: "#ffe599",

  Malayalam: "#e6d5ff",

  Marathi: "#d0f0ff",

  Odia: "#fff2cc",

  Punjabi: "#ffd9f2",

  Tamil: "#daf7a6",

  Telugu: "#f8d1ff",

};
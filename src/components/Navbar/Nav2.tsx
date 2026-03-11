import React, { useState, useEffect } from "react";
import {
  Toolbar,
  Typography,
  Box,
  Menu,
  Divider,
  Container,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import IndiaFlag from "./india_flag.webp";
import {
  TopBar,
  LanguageOption,
  LanguageButton,
  languageColors,
} from "../../styles/StyledComponents.tsx";
import { useTranslation } from "react-i18next";
// import i18n from "../../i18n";
import { useLanguage } from "../../context/LanguageContext";
import { PersonStanding } from "lucide-react";

const languages = [
  { label: "English", native: "English", id: "en", aicode: "en" },

  { label: "Hindi", native: "हिन्दी", id: "641d1d6592a6a31751ff1f49", aicode: "hi" },
  { label: "Assamese", native: "অসমীয়া", id: "641d1cc98ecee6735a1b371e", aicode: "as" },
  { label: "Bengali", native: "বাংলা", id: "641d1d818ecee6735a1b37c7", aicode: "bn" },
  { label: "Bodo", native: "बड़ो", id: "641d1c738ecee6735a1b36d6", aicode: "brx" },

  { label: "Dogri", native: "डोगरी", id: "641d1db68ecee6735a1b37ee", aicode: "hi" }, // mapped to hi

  { label: "Gujarati", native: "ગુજરાતી", id: "641d1cae8ecee6735a1b370d", aicode: "gu" },
  { label: "Kannada", native: "ಕನ್ನಡ", id: "641d1c788ecee6735a1b36db", aicode: "kn" },
  { label: "Kashmiri", native: "कॉशुर", id: "641d1d258ecee6735a1b377a", aicode: "ks" },
  { label: "Konkani", native: "कोंकणी", id: "641d1da192a6a31751ff1f7e", aicode: "gom" },
  { label: "Maithili", native: "मैथिली", id: "641d1d6f8ecee6735a1b37b7", aicode: "mai" },
  { label: "Malayalam", native: "മലയാളം", id: "641d1c6c8ecee6735a1b36d1", aicode: "ml" },
  { label: "Manipuri", native: "মৈতৈলোন", id: "641d1db892a6a31751ff1f97", aicode: "mni" },
  { label: "Marathi", native: "मराठी", id: "641d1d7c8ecee6735a1b37c3", aicode: "mr" },
  { label: "Nepali", native: "नेपाली", id: "641d1cf58ecee6735a1b3749", aicode: "ne" },
  { label: "Odia", native: "ଓଡ଼ିଆ", id: "641d1dd98ecee6735a1b380c", aicode: "or" },
  { label: "Punjabi", native: "ਪੰਜਾਬੀ", id: "641d1c6c8ecee6735a1b36d2", aicode: "pa" },
  { label: "Sanskrit", native: "संस्कृतम्", id: "641d1cc98ecee6735a1b371d", aicode: "sa" },
  { label: "Santali", native: "ᱥᱟᱱᱛᱟᱲᱤ", id: "641d1c9192a6a31751ff1e9e", aicode: "si" },
  { label: "Sindhi", native: "سنڌي", id: "641d1d3092a6a31751ff1f1f", aicode: "sd" },
  { label: "Tamil", native: "தமிழ்", id: "641d1caa92a6a31751ff1eb6", aicode: "ta" },
  { label: "Telugu", native: "తెలుగు", id: "641d1cab8ecee6735a1b370b", aicode: "te" },
  { label: "Urdu", native: "اردو", id: "641d1c778ecee6735a1b36da", aicode: "ur" },
];

export const langMap = {
  English: "en",
  Hindi: "hi",
  Assamese: "as",
  Bengali: "bn",
  Bodo: "brx",
  Dogri: "doi",
  Gujarati: "gu",
  Kannada: "kn",
  Kashmiri: "ks",
  Konkani: "gom",
  Maithili: "mai",
  Malayalam: "ml",
  Manipuri: "mni",
  Marathi: "mr",
  Nepali: "ne",
  Odia: "or",
  Punjabi: "pa",
  Sanskrit: "sa",
  Santali: "sat",
  Sindhi: "sd",
  Tamil: "ta",
  Telugu: "te",
  Urdu: "ur",
};

const Navbar = () => {

  const { lang, changeLanguage } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selected, setSelected] = useState(
    Object.keys(langMap).find(
      (key) => langMap[key] === sessionStorage.getItem("lang")
    ) || "English"
  );
  const open = Boolean(anchorEl);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSelect = (language) => {
    sessionStorage.setItem("langId", language.id);
    sessionStorage.setItem("aicode", language.aicode);

    const lang = language.label;

    setSelected(lang);
    const langCode = langMap[lang];
    console.log("Selected Lang Code:", langCode); // Add this
    if (langCode) {
      changeLanguage(langCode);
      document.cookie = `googtrans=/auto/${langCode};path=/;domain=${window.location.hostname}`;
      // i18n.changeLanguage(langCode);
    }

    window.location.reload();

    handleClose();
  };

  // useEffect(() => {
  //   const currentLang = Object.entries(langMap).find(
  //     ([_, code]) => code === i18n.language
  //   )?.[0];
  //   if (currentLang) setSelected(currentLang);
  // }, [i18n.language]);

  return (
    <>
      {/* Top gradient bar */}
      {/* <TopBar> */}
      <TopBar
        sx={{
          // position: "sticky",
          top: 0,
          // zIndex: (theme) => theme.zIndex.appBar + 2,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              px: { xs: 1, sm: 2 },
              py: 0.5,
              minHeight: "32px !important",
              flexWrap: "wrap",
            }}
          >
            {/* Left Side */}
            <Box display="flex" alignItems="center" gap={1}>
              <img
                src={IndiaFlag}
                alt="India Flag"
                width={isMobile ? 20 : 30}
                style={{ marginRight: 4 }}
              />
              <Typography
                fontSize={isMobile ? "10px" : "12px"}
                fontWeight="500"
                className="hover:underline hover:decoration-white"
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                <a
                  href="https://www.india.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();

                    alert(
                      "You are being redirected to an external website. Please note that Centre for Development of Advanced Computing cannot be held responsible for external websites content and privacy policies"
                    );

                    window.open("https://www.india.gov.in/", "_blank", "noopener,noreferrer");
                  }}
                >
                  {t("Government of India")}
                </a>
              </Typography>
              <Typography
                fontSize="10px"
                fontWeight="500"
                sx={{ display: { xs: "block", sm: "none" } }}
              >
                GOI
              </Typography>
            </Box>

            {/* Right Side */}
            <Box
              display="flex"
              alignItems="center"
              gap={{ xs: 1, sm: 2 }}
              flexWrap="wrap"
            >
              <Typography
                fontSize={isMobile ? "10px" : "12px"}
                sx={{ display: { xs: "none", md: "block" } }}
                className="cursor-pointer hover:underline hover:decoration-white"
                onClick={() => {
                  window.scrollTo({ top: 160, behavior: "smooth" });
                }}
              >
                {t("Skip to main content")}
              </Typography>

              <Divider
                sx={{
                  backgroundColor: "white",
                  display: { xs: "none", md: "block" },
                }}
                orientation="vertical"
                flexItem
              />

              <LanguageButton
                onClick={handleOpen}
                endIcon={
                  <ExpandMore
                    sx={{ color: "white", fontSize: isMobile ? 14 : 16 }}
                  />
                }
                sx={{
                  px: { xs: 1, sm: 2 },
                  fontSize: { xs: "10px", sm: "12px" },
                }}
              >
                <Box
                  component="span"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <Box
                    component="span"
                    sx={{
                      fontWeight: "bold",
                      fontSize: { xs: "12px", sm: "14px" },
                      lineHeight: 1,
                    }}
                  >
                    A
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      fontWeight: "bold",
                      fontSize: { xs: "12px", sm: "14px" },
                      lineHeight: 1,
                    }}
                  >
                    अ
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      paddingLeft: 1,
                      display: { xs: "none", sm: "block" },
                    }}
                  >
                    {selected}
                  </Box>
                </Box>
              </LanguageButton>

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    width: { xs: "95%", sm: 280 },
                  },
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 1,
                    p: 1,
                    width: "100%",
                  }}
                >
                  {languages.map((lang) => (
                    <LanguageOption
                      key={lang.label}
                      onClick={() => handleSelect(lang)}
                      sx={{
                        backgroundColor: languageColors[lang.label],
                        position: "relative",
                      }}
                    >
                      <Typography variant="body2">{lang.native}</Typography>
                      <Typography variant="caption">{lang.label}</Typography>

                      {/* Green Tick */}
                      {selected === lang.label && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            backgroundColor: "#009688",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography
                            sx={{
                              color: "white",
                              fontSize: "12px",
                              fontWeight: "bold",
                            }}
                          >
                            ✓
                          </Typography>
                        </Box>
                      )}
                    </LanguageOption>
                  ))}
                </Box>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </TopBar>
    </>
  );
};

export default Navbar;
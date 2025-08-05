"use client";
import React from "react";
import Link from "next/link";
import { Box, Switch, styled, useMediaQuery } from "@mui/material";
import { usePathname, useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import AuthMenu from "./AuthMenu";
import LanguageSwitcher from "./LanguageSwitcher";

const NavTextStatic = [
  { textKey: "Home", hrefSuffix: "/dashboard" },
  { textKey: "BrowseJobs", hrefSuffix: "/jobs" },
  { textKey: "Applications", hrefSuffix: "/applications" },
  { textKey: "About", hrefSuffix: "/AboutUs" },
  { textKey: "Contact", hrefSuffix: "/Contact" },
];

const normalizePath = (path) => path.replace(/\/$/, "");

const NavLinkItem = React.memo(({ href, text, isActive }) => (
  <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
    <Box
      sx={{
        fontSize: "14px",
        cursor: "pointer",
        padding: "8px 12px",
        borderRadius: "8px",
        backgroundColor: isActive ? "rgba(107, 56, 194, 0.2)" : "transparent",
        color: isActive ? "buttonmain.main" : "textmain.main",
        transition: "0.3s",
        userSelect: "none",
        "&:hover": {
          backgroundColor: isActive
            ? "rgba(107, 56, 194, 0.4)"
            : "rgba(0,0,0,0.04)",
          color: "buttonmain.main",
        },
      }}
    >
      {text}
    </Box>
  </Link>
));

export default function NavBar() {
  const t = useTranslations("NavBar");
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useParams();
  const { data: session } = useSession();
  const user = session?.user;
  const isEnglish = locale === "en";

  const NavText = React.useMemo(
    () =>
      NavTextStatic.map((item) => ({
        text: t(item.textKey),
        href: `/${locale}${item.hrefSuffix}`,
      })),
    [locale, t]
  );
  return (
    <Box
      component="nav"
      sx={{
        width: "100%",
        height: "50px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        zIndex: 1000,
        position: "sticky",
        top: "24px",
        flexWrap: "wrap",
      }}
    >
      <Box
        sx={{
          fontSize: "32px",
          fontWeight: "bold",
          flexGrow: 1,
          color: "black",
          "&:hover": { cursor: "pointer" },
        }}
        onClick={() => router.push(`/${locale}/dashboard`)}
      >
        <Box sx={{ display: "inline", color: "#ea9635ff" }}>UniJob</Box>

        <Box sx={{ display: "inline", color: "buttonmain.main" }}>Link</Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexGrow: 12,
          justifyContent: "center",
          backgroundColor: "rgba(255, 255, 255, 0.4)",
          color: "black",
          height: "100%",
          alignItems: "center",
          borderRadius: "16px",
          border: "1px solid #e0e0e0",
          backdropFilter: "blur(10px)",
          boxShadow: "0 0px 0px 2px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            gap: "20px",
            justifyContent: "space-around",
            fontWeight: "bold",
            color: "textmain.main",
          }}
        >
          {NavText.map(({ href, text }, index) => {
            const isActive = normalizePath(href) === normalizePath(pathname);
            return (
              <NavLinkItem
                key={index}
                href={href}
                text={text}
                isActive={isActive}
              />
            );
          })}
        </Box>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "flex-end",
          gap: "20px",
          alignItems: "center",
        }}
      >
        <LanguageSwitcher />

        <AuthMenu />
      </Box>
    </Box>
  );
}

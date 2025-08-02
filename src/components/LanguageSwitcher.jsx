"use client";
import React from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Box, Switch, styled, useMediaQuery } from "@mui/material";import { usePathname , useRouter } from "next/navigation";
export default function LanguageSwitcher() {

  const { locale } = useParams();
  const t = useTranslations("NavBar");
  const isEnglish = locale === "en";
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageToggle = React.useCallback(() => {
    const newLocale = isEnglish ? "my" : "en";
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  }, [isEnglish, pathname, locale, router]);

  const LanguageSwitch = React.useMemo(
    () =>
      styled(Switch)(({ theme }) => ({
        width: 70,
        height: 36,
        padding: 6,
        "& .MuiSwitch-switchBase": {
          padding: 3,
          "&.Mui-checked": {
            transform: "translateX(32px)",
            color: "#fff",
            "& + .MuiSwitch-track": {
              backgroundColor: theme.palette.primary.main,
              opacity: 1,
            },
          },
        },
        "& .MuiSwitch-thumb": {
          width: 29,
          height: 29,
        },
        "& .MuiSwitch-track": {
          borderRadius: 20,
          backgroundColor: theme.palette.primary.main,
          opacity: 1,
          position: "relative",
          "&::before, &::after": {
            content: '""',
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 10,
            fontWeight: "bold",
            color: "white",
          },
          "&::before": {
            content: '"EN"',
            left: 6,
          },
          "&::after": {
            content: '"မြန်မာ"',
            right: 2,
          },
        },
      })),
    []
  );
  return (
    <>
      <LanguageSwitch
        checked={isEnglish}
        onChange={handleLanguageToggle}
        title={t("aletforlanguage")}
      />
    </>
  );
}

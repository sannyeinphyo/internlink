"use client";

import { usePathname, useParams } from "next/navigation";
import NavBar from "./NavBar";

export default function ClientNavBarWrapper() {
  const pathname = usePathname();
  const { locale } = useParams();

  const hiddenPrefixes = [
    `/${locale}/company`,
    `/${locale}/admin`,
    `/${locale}/university`,
    `/${locale}/teacher`,
  ];

  const shouldShow = !hiddenPrefixes.some((prefix) => pathname.startsWith(prefix));

  return shouldShow ? <NavBar /> : null;
}

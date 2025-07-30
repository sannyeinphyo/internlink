import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "../../i18n/routing";
import "../globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import AppLayout from "../../components/AppLayout";
import SessionWrapper from "../SessionWrapper";
import StyledRoot from "../themes/StyledRoot";
import { Toaster } from "react-hot-toast";
import ClientNavBarWrapper from "@/components/ClientNavBarWrapper";
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }) {
  const awaitedParams = await params;
  const { locale } = awaitedParams;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  let messages;
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <Toaster position="top-center" reverseOrder={false} />
        <AppRouterCacheProvider>
          <StyledRoot>
            <AppLayout>
              <SessionWrapper>
              <ClientNavBarWrapper/>
                {children}
              </SessionWrapper>
            </AppLayout>
          </StyledRoot>
        </AppRouterCacheProvider>
      </NextIntlClientProvider>
    </>
  );
}

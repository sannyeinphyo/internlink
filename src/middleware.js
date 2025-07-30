import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const secret = process.env.NEXTAUTH_SECRET;
  const { pathname } = req.nextUrl;
  const locale = pathname.split("/")[1];

  const token = await getToken({ req, secret });
  const publicPaths = [
    `/${locale}/login`,
    `/${locale}/register`,
    `/${locale}/AboutUs`,
    `/${locale}/Contact`,
    `/${locale}/reset_password`,
    `/${locale}/verify-email`,
    `/${locale}/dashboard`,
    `/${locale}/`
  ];

  const isPublic = publicPaths.some((path) => pathname.startsWith(path));

  if (token) {
    if (pathname.startsWith(`/${locale}/jobs`)) {
      const allowedRoles = ["student", "company", "admin"];
      if (!allowedRoles.includes(token.role)) {
        return NextResponse.redirect(
          new URL(`/${locale}/unauthorized`, req.url)
        );
      }
    }

    if (pathname.startsWith(`/${locale}/dashboard`)) {
      if (token.role !== "student") {
        return NextResponse.redirect(
          new URL(`/${locale}/${token.role}/dashboard`, req.url)
        );
      }
    }

    const roleBasedPaths = ["admin", "company", "teacher", "university"];
    for (const role of roleBasedPaths) {
      if (pathname.startsWith(`/${locale}/${role}`) && token.role !== role) {
        return NextResponse.redirect(
          new URL(`/${locale}/unauthorized`, req.url)
        );
      }
    }
  }
if (!token && !isPublic) {
  console.log(`Redirecting to login from ${pathname}, no valid token found`);
  return NextResponse.redirect(
    new URL(`/${locale}/login?redirected=true`, req.url)
  );
}
  return NextResponse.next();
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};

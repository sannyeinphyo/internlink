import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function App() {
  const locale = "en";

  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect(`/${locale}/login`);
  }

  const role = session.user.role;
  switch (role) {
    case "admin":
      return redirect(`/${locale}/admin/dashboard`);
    case "company":
      return redirect(`/${locale}/company/dashboard`);
    case "teacher":
      return redirect(`/${locale}/teacher/dashboard`);
    case "university":
      return redirect(`/${locale}/university/dashboard`);
    default:
      return redirect(`/${locale}/dashboard`);
  }
}

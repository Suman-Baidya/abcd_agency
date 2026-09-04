import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken } from "@/lib/auth-token";

export default async function AppPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("abcd_auth_token")?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    redirect("/login?callbackUrl=/app");
  }

  if (session.role === "ADMIN" || session.role === "SUPER_ADMIN") {
    redirect("/admin");
  }

  redirect("/portal");
}

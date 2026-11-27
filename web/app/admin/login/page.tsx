import { redirect } from "next/navigation";
import { adminPassword, isAdmin } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  const configured = Boolean(adminPassword());
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <LoginForm configured={configured} devHint={!process.env.ADMIN_PASSWORD && configured} />
    </main>
  );
}

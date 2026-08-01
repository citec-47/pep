import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";
import { loginAction } from "../actions";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/admin");

  return (
    <div className="grid-bg flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo href="/" />
        </div>

        <div className="card p-6">
          <h1 className="text-xl font-semibold tracking-tight text-ink">
            Admin sign in
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Only administrators can publish products and manage orders.
          </p>

          <LoginForm action={loginAction} />
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Credentials are seeded from <span className="font-mono">ADMIN_EMAIL</span>{" "}
          and <span className="font-mono">ADMIN_PASSWORD</span> in your{" "}
          <span className="font-mono">.env</span>.
        </p>
      </div>
    </div>
  );
}

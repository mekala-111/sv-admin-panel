import Link from "next/link";
import { svLiveLogo } from "@/lib/images";
import { Button } from "@/components/ui/Button";
import { FieldDisplay } from "@/components/ui/Field";
import { login } from "@/lib/auth";

type Step = "login" | "forgot" | "otp" | "reset";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const stepParam = Array.isArray(params.step) ? params.step[0] : params.step;
  const step: Step = (["login", "forgot", "otp", "reset"] as const).includes(stepParam as Step)
    ? (stepParam as Step)
    : "login";
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-[var(--color-bg)] p-4">
      <div className="w-full max-w-[400px] rounded-2xl border border-[var(--color-border)] bg-white p-6 sm:p-9">
        <div className="mb-7 flex items-center justify-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={svLiveLogo} alt="SV Live" className="h-9 w-9 rounded-[10px] object-cover" />
          <div className="text-[17px] font-extrabold text-[var(--color-text)]">SV LIVE</div>
        </div>

        {step === "login" && <LoginStep error={error} />}
        {step === "forgot" && <ForgotStep />}
        {step === "otp" && <OtpStep email={email} />}
        {step === "reset" && <ResetStep email={email} />}
      </div>
    </div>
  );
}

function StepTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <div className="mb-1 text-center text-[18px] font-extrabold text-[var(--color-text)]">{title}</div>
      <div className="mb-6 text-center text-[13px] text-[var(--color-text-muted)]">{subtitle}</div>
    </>
  );
}

function LoginStep({ error }: { error?: string }) {
  return (
    <>
      <StepTitle
        title="Admin Login"
        subtitle="Sign in to the SV Live super admin panel"
      />
      <form action={login}>
        <div className="mb-4 flex flex-col gap-3.5">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              defaultValue="superadmin@svlive.in"
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>

        {error ? (
          <p className="mb-4 text-xs font-semibold text-[var(--color-danger)]" role="alert">
            Enter a valid email and password.
          </p>
        ) : null}

        <div className="mb-5 flex items-center justify-between text-xs">
          <label className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
            <input type="checkbox" name="remember" className="m-0" />
            Remember me
          </label>
          <Link
            href="/login?step=forgot"
            className="text-xs font-semibold text-[var(--color-primary)]"
          >
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          className="w-full rounded-[9px] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] px-4 py-2.5 text-[13px] font-bold text-white"
        >
          Sign In
        </button>
      </form>
    </>
  );
}

function ForgotStep() {
  return (
    <>
      <StepTitle title="Forgot password" subtitle="We'll email a reset code" />
      <form action={forgotPasswordAction} className="flex flex-col gap-3.5">
        <label className="flex flex-col gap-1.5 text-[12px] font-semibold text-[var(--color-text-muted)]">
          Email
          <input
            name="email"
            type="email"
            required
            className="rounded-[9px] border border-[var(--color-border)] px-3.5 py-2.5 text-[14px]"
          />
        </label>
        <Button type="submit" variant="gradient" className="w-full">
          Send code
        </Button>
        <Link href="/login" className="text-center text-xs font-semibold text-[var(--color-primary)]">
          Back to login
        </Link>
      </form>
    </>
  );
}

function OtpStep({ email }: { email?: string }) {
  return (
    <>
      <StepTitle title="Enter code" subtitle={`Code sent to ${email || "your email"}`} />
      <form action={resetPasswordAction} className="flex flex-col gap-3.5">
        <input type="hidden" name="email" value={email || ""} />
        <label className="flex flex-col gap-1.5 text-[12px] font-semibold text-[var(--color-text-muted)]">
          Reset code
          <input
            name="code"
            required
            className="rounded-[9px] border border-[var(--color-border)] px-3.5 py-2.5 text-[14px]"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] font-semibold text-[var(--color-text-muted)]">
          New password
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="rounded-[9px] border border-[var(--color-border)] px-3.5 py-2.5 text-[14px]"
          />
        </label>
        <Button type="submit" variant="gradient" className="w-full">
          Reset password
        </Button>
      </form>
    </>
  );
}

function ResetStep({ email }: { email?: string }) {
  return <OtpStep email={email} />;
}

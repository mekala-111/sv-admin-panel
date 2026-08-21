import Link from "next/link";
import { svLiveLogo } from "@/lib/images";
import { Button } from "@/components/ui/Button";
import { FieldDisplay } from "@/components/ui/Field";
import { login } from "@/lib/auth";

type Step = "login" | "forgot" | "otp" | "reset";

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const params = await searchParams;
  const stepParam = Array.isArray(params.step) ? params.step[0] : params.step;
  const step: Step = (["login", "forgot", "otp", "reset"] as const).includes(
    stepParam as Step
  )
    ? (stepParam as Step)
    : "login";
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-[var(--color-bg)] p-4">
      <div className="w-full max-w-[400px] rounded-2xl border border-[var(--color-border)] bg-white p-6 sm:p-9">
        <div className="mb-7 flex items-center justify-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={svLiveLogo}
            alt="SV Live"
            className="h-9 w-9 rounded-[10px] object-cover"
          />
          <div className="text-[17px] font-extrabold text-[var(--color-text)]">
            SV LIVE
          </div>
        </div>

        {step === "login" && <LoginStep error={error} />}
        {step === "forgot" && <ForgotStep />}
        {step === "otp" && <OtpStep />}
        {step === "reset" && <ResetStep />}
      </div>
    </div>
  );
}

function StepTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <div className="mb-1 text-center text-[18px] font-extrabold text-[var(--color-text)]">
        {title}
      </div>
      <div className="mb-6 text-center text-[13px] text-[var(--color-text-muted)]">
        {subtitle}
      </div>
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
      <StepTitle
        title="Forgot Password"
        subtitle="We'll send a code to your registered email"
      />
      <div className="mb-5">
        <FieldDisplay label="Email" value="superadmin@svlive.in" />
      </div>
      <Button href="/login?step=otp" variant="gradient" className="mb-3.5 w-full">
        Send Reset Code
      </Button>
      <Button href="/login?step=login" variant="secondary" className="w-full border-none text-[var(--color-text-muted)]">
        &larr; Back to Login
      </Button>
    </>
  );
}

function OtpStep() {
  const digits = ["4", "2", "8", "1", "9", "5"];
  return (
    <>
      <StepTitle
        title="Verify Code"
        subtitle="Enter the 6-digit code sent to your email"
      />
      <div className="mb-5 grid grid-cols-6 gap-1.5 sm:gap-2">
        {digits.map((d, i) => (
          <div
            key={i}
            className="rounded-lg border border-[var(--color-border)] py-3 text-center text-[15px] font-bold text-[var(--color-text)]"
          >
            {d}
          </div>
        ))}
      </div>
      <Button href="/login?step=reset" variant="gradient" className="mb-3.5 w-full">
        Verify
      </Button>
      <Button href="/login?step=login" variant="secondary" className="w-full border-none text-[var(--color-text-muted)]">
        &larr; Back to Login
      </Button>
    </>
  );
}

function ResetStep() {
  return (
    <>
      <StepTitle
        title="Reset Password"
        subtitle="Choose a new password for your account"
      />
      <div className="mb-5 flex flex-col gap-3.5">
        <FieldDisplay label="New Password" value="••••••••" muted />
        <FieldDisplay label="Confirm Password" value="••••••••" muted />
      </div>
      <Button href="/login?step=login" variant="gradient" className="w-full">
        Reset Password
      </Button>
    </>
  );
}

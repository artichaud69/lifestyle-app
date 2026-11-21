import { AuthForm } from "@/components/shell/AuthForm";
export const metadata = { title: "Create account" };
export default function SignupPage() {
  return (
    <>
      <AuthForm mode="signup" />
      <p className="mt-4 text-center text-xs text-faint">Your records stay private by default. Nothing is sent to an AI provider unless you allow it.</p>
    </>
  );
}

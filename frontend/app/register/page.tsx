import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#0f172a_0%,#0f766e_48%,#f59e0b_100%)] px-4 py-10 text-white">
      <section className="w-full max-w-xl rounded-lg border border-white/20 bg-slate-950/45 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
        <p className="text-sm font-semibold uppercase text-teal-100">ASMS</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-white">
          Create student account
        </h1>
        <p className="mb-6 mt-2 text-sm leading-6 text-teal-50/80">
          Public registration always creates a Student, matching the backend
          business rule.
        </p>
        <RegisterForm />
      </section>
    </main>
  );
}

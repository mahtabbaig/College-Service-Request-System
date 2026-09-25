import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ShieldCheck,
  Clock3,
  Map,
  TrendingUp,
  GraduationCap,
  Ticket,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Ticket,
    title: 'Raise Requests',
    desc: 'Submit campus service requests from one simple place.',
  },
  {
    icon: Clock3,
    title: 'Track in Real Time',
    desc: 'Follow your request from submission to resolution.',
  },
  {
    icon: TrendingUp,
    title: 'Priority & Impact',
    desc: 'Requests are organized using transparent service rules.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Accountable',
    desc: 'Role-based access and complete activity tracking.',
  },
]

const SERVICES = [
  'Bonafide Certificate',
  'ID Card',
  'Hostel',
  'Transport',
  'Library',
  'IT Support',
]

export default function Landing() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#050814] text-white">

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[20%] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-accent-500/10 blur-[120px]" />
        <div className="absolute -left-40 top-1/2 h-[350px] w-[350px] rounded-full bg-blue-500/5 blur-[100px]" />
        <div className="absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-purple-500/5 blur-[110px]" />
      </div>

      {/* NAVBAR */}
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-8">

        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent-400/40 bg-accent-500/10 shadow-[0_0_30px_rgba(80,120,255,0.15)]">
            <GraduationCap className="h-6 w-6 text-accent-300" />
          </div>

          <div>
            <div className="font-semibold tracking-tight text-white">
              NIE CampusHub
            </div>
            <div className="text-xs text-white/40">
              National Institute of Engineering · Mysuru
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-white/80 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
          >
            Log in
          </Link>

          <Link
            to="/register"
            className="flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_25px_rgba(80,120,255,0.25)] transition hover:bg-accent-400 hover:shadow-[0_0_35px_rgba(80,120,255,0.35)]"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>


      {/* HERO */}
      <main className="relative z-10">

        <section className="relative mx-auto max-w-6xl px-6 pb-20 pt-20 text-center md:px-8 md:pt-28">

          {/* Small badge */}
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-accent-400/20 bg-accent-500/5 px-4 py-2 text-sm text-accent-200/80 backdrop-blur">
            <Sparkles className="h-4 w-4 text-accent-300" />
            <span>One platform for campus services</span>
          </div>

          <h1 className="mx-auto max-w-5xl text-5xl font-semibold leading-[1.05] tracking-tight text-white md:text-7xl">

            Your campus.
            <br />

            <span className="bg-gradient-to-r from-white via-accent-200 to-blue-400 bg-clip-text text-transparent">
              One simple service hub.
            </span>

          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-white/50 md:text-lg">
            Raise, track and manage campus service requests through
            one connected platform built for the NIE community.
          </p>

          {/* Buttons */}
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">

            <Link
              to="/register"
              className="group flex items-center gap-2 rounded-xl bg-accent-500 px-6 py-3.5 font-semibold text-white shadow-[0_0_35px_rgba(80,120,255,0.25)] transition hover:-translate-y-0.5 hover:bg-accent-400 hover:shadow-[0_0_45px_rgba(80,120,255,0.35)]"
            >
              Create your account
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>

            <Link
              to="/login"
              className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3.5 font-medium text-white/75 backdrop-blur transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
            >
              I already have an account
            </Link>

          </div>


          {/* ANTIGRAVITY VISUAL */}
          <div className="relative mx-auto mt-20 h-[300px] max-w-4xl md:h-[360px]">

            {/* Orbit rings */}
            <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5 md:h-72 md:w-72" />

            <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent-400/10 md:h-96 md:w-96" />

            <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5 md:h-[500px] md:w-[500px]" />

            {/* Center glow */}
            <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-500/20 blur-3xl" />

           <div className="relative w-64 h-64 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
  <div className="absolute left-1/2 top-1/2 flex h-24 w-24 ...">
  <GraduationCap className="h-10 w-10 text-accent-200" />
</div>

  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

  <div className="absolute bottom-4 left-4">
    <p className="text-white font-semibold">NIE Campus</p>
    <p className="text-white/60 text-sm">Mysuru, Karnataka</p>
  </div>
</div>

            {/* Floating card 1 */}
            <div className="absolute left-[5%] top-[25%] hidden rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left shadow-2xl backdrop-blur-xl sm:block">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-400/10 p-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">
                    Request resolved
                  </div>
                  <div className="text-xs text-white/40">
                    Service Desk
                  </div>
                </div>
              </div>
            </div>

            {/* Floating card 2 */}
            <div className="absolute right-[4%] top-[18%] hidden rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left shadow-2xl backdrop-blur-xl sm:block">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-accent-400/10 p-2">
                  <Clock3 className="h-5 w-5 text-accent-300" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">
                    SLA tracking
                  </div>
                  <div className="text-xs text-white/40">
                    Live deadline
                  </div>
                </div>
              </div>
            </div>

            {/* Floating card 3 */}
            <div className="absolute bottom-[10%] left-[18%] hidden rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left shadow-2xl backdrop-blur-xl md:block">
              <div className="flex items-center gap-3">
                <Map className="h-5 w-5 text-accent-300" />
                <div>
                  <div className="text-sm font-medium text-white">
                    Campus insights
                  </div>
                  <div className="text-xs text-white/40">
                    Service heatmap
                  </div>
                </div>
              </div>
            </div>

            {/* Floating card 4 */}
            <div className="absolute bottom-[8%] right-[16%] hidden rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left shadow-2xl backdrop-blur-xl md:block">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-accent-300" />
                <div>
                  <div className="text-sm font-medium text-white">
                    Secure access
                  </div>
                  <div className="text-xs text-white/40">
                    Role-based system
                  </div>
                </div>
              </div>
            </div>

          </div>

        </section>


        {/* SERVICES */}
        <section className="mx-auto max-w-6xl px-6 pb-20 md:px-8">

          <div className="mb-8 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent-300/70">
              Campus services
            </p>

            <h2 className="mt-3 text-2xl font-semibold text-white">
              Everything in one place
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm text-white/40">
              Access the services students and faculty use across campus.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {SERVICES.map((service) => (
              <div
                key={service}
                className="rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-5 text-center text-sm text-white/60 backdrop-blur transition hover:-translate-y-1 hover:border-accent-400/20 hover:bg-white/[0.05] hover:text-white"
              >
                {service}
              </div>
            ))}
          </div>

        </section>


        {/* FEATURES */}
        <section className="mx-auto max-w-6xl px-6 pb-28 md:px-8">

          <div className="mb-8">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent-300/70">
              Built for the campus
            </p>

            <h2 className="mt-3 text-2xl font-semibold text-white">
              Simple on the surface. Powerful underneath.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-accent-400/20 hover:bg-white/[0.045]"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-accent-400/20 bg-accent-500/10">
                  <Icon className="h-5 w-5 text-accent-300" />
                </div>

                <h3 className="mb-2 font-medium text-white">
                  {title}
                </h3>

                <p className="text-sm leading-6 text-white/40">
                  {desc}
                </p>
              </div>
            ))}

          </div>

        </section>


        {/* FINAL CTA */}
        <section className="mx-auto max-w-5xl px-6 pb-28 text-center md:px-8">

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-14 backdrop-blur-xl md:px-12">

            <div className="absolute left-1/2 top-0 h-40 w-96 -translate-x-1/2 rounded-full bg-accent-500/10 blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl font-semibold text-white md:text-4xl">
                Campus services, simplified.
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-white/40">
                Create an account and start managing your campus service
                requests from one place.
              </p>

              <Link
                to="/register"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-accent-500 px-6 py-3.5 font-semibold text-white shadow-[0_0_30px_rgba(80,120,255,0.2)] transition hover:bg-accent-400"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

          </div>

        </section>

      </main>


      {/* FOOTER */}
      <footer className="border-t border-white/5 px-6 py-8 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center text-xs text-white/30 md:flex-row md:text-left">

          <div>
            © {new Date().getFullYear()} NIE CampusHub
          </div>

          <div>
            National Institute of Engineering · Mysuru
          </div>

        </div>
      </footer>

    </div>
  )
}
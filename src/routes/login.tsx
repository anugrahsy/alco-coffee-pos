import { createFileRoute } from '@tanstack/react-router'

import { AuthCard } from '@/components/application/auth/auth-card'
import { ThemeToggle } from '@/components/application/theme/theme-toggle'

export const Route = createFileRoute('/login')({
  component: Login,
  head: () => ({
    meta: [{ title: 'Coffee POS — Masuk' }],
  }),
})

function Login() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Kiri: brand + latar */}
      <aside className="relative hidden m-6 overflow-hidden rounded-3xl bg-linear-to-b from-accent-500 to-accent-600 p-10 shadow-nav-selected lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          {/* <span className="grid size-11 place-items-center rounded-2lg bg-white/15">
            <RiCupFill className="size-6 text-text-white" aria-hidden />
          </span> */}
          <span className="text-title-3-semibold text-text-white">Coffee POS</span>
        </div>

        {/* <div>
          <h2 className="max-w-md text-title-1-medium text-text-white">
            Kelola kafe Anda, dengan tenang.
          </h2>
          <p className="mt-4 max-w-md text-body-regular text-text-white/80">
            Pesanan, pembayaran, dan pendapatan toko — terpantau dari satu kasir
            yang sederhana.
          </p>
        </div> */}
      </aside>

      {/* Kanan: form login — AuthCard "With a logo" */}
      <section className="relative flex items-center justify-center bg-background-full p-8">
        <div className="absolute end-6 top-6">
          <ThemeToggle collapsed />
        </div>

        <AuthCard
          centered
          logo={
            <img
              src="/brand/logo-calf.jpg"
              alt="Alco Coffee POS"
              className="size-14 rounded-full object-cover shadow-xs"
            />
          }
          providers={[]}
          onSubmit={(data) => {
            // TODO: hubungkan ke better-auth signIn.email({ email, password }).
            void data
          }}
        />
      </section>
    </main>
  )
}

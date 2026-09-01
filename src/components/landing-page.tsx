import { Link } from '@tanstack/react-router'

import { PecsCard } from './pecs-card'
import { defaultDesfraldePack } from '../domains/default-desfralde-pack'

const pedidos = defaultDesfraldePack().filter((card) => card.kind === 'pedido')
const rotina = defaultDesfraldePack()
  .filter((card) => card.kind === 'rotina')
  .slice(0, 4)

const avatars = [
  { src: '/avatars/full/menino-golden-wavy-brown.jpg', name: 'Menino' },
  { src: '/avatars/full/menina-golden-wavy-brown.jpg', name: 'Menina' },
  { src: '/avatars/full/menino-espresso-puff-black.jpg', name: 'Black power' },
  { src: '/avatars/full/menina-ivory-puff-blonde.jpg', name: 'Loiro' },
  { src: '/avatars/full/outro-bronze-curly-auburn.jpg', name: 'Outro' },
  { src: '/avatars/full/menina-peach-wavy-black.jpg', name: 'Pêssego' },
]

const times = [
  { clock: '09:15', kind: 'Xixi' },
  { clock: '11:20', kind: 'Xixi' },
  { clock: '11:48', kind: 'Cocô' },
  { clock: '14:05', kind: 'Xixi' },
]

export function LandingPage() {
  return (
    <div className="landing">
      <header className="sticky top-0 z-30 border-b border-[#2a2118]/10 bg-[#fff8ec]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <p className="text-xs font-bold tracking-[0.22em] text-[#9a3d28] uppercase">
            Vivências Azuis
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/entrar"
              className="rounded-full border-2 border-[#2a2118] px-4 py-2 text-sm font-bold text-[#2a2118] no-underline"
            >
              Entrar
            </Link>
            <Link
              to="/cadastro"
              className="rounded-full bg-[#c45c3e] px-4 py-2 text-sm font-bold text-white no-underline"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-[1.05fr_0.95fr] md:py-20">
          <div>
            <p className="inline-flex rounded-full border-2 border-[#2a2118] bg-[#fff3d6] px-3 py-1 text-xs font-bold tracking-[0.18em] text-[#8a5a10] uppercase">
              PECS · desfralde
            </p>
            <h1 className="font-serif mt-5 text-6xl leading-[0.88] md:text-7xl">
              O vaso,
              <br />
              <em className="text-[#c45c3e]">em cartões.</em>
            </h1>
            <p className="mt-6 max-w-md text-lg text-[#5a4c3d]">
              A criança mostra o pedido, ouve a palavra e a casa — ou a creche —
              anota a hora do xixi e do cocô. Um passo de cada vez.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/cadastro"
                className="rounded-2xl bg-[#c45c3e] px-6 py-3 font-bold text-white no-underline"
              >
                Começar agora
              </Link>
              <Link
                to="/entrar"
                className="rounded-2xl border-2 border-[#2a2118] px-6 py-3 font-bold text-[#2a2118] no-underline"
              >
                Já tenho conta
              </Link>
            </div>
            <p className="mt-5 text-sm font-bold tracking-[0.08em] text-[#5a4c3d] uppercase">
              toque · ouça · mostre
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-lg">
            <img
              src="/landing/hero-cards.jpg"
              alt="Criança ilustrada mostrando cartões PECS de banheiro e água"
              className="w-full"
            />
            <img
              src="/pecs/banheiro.jpg"
              alt=""
              className="landing-float absolute -bottom-4 -left-2 w-24 rounded-[18px] border-4 border-[#9a3d28] bg-[#fff8ec] shadow-[0_18px_40px_rgba(42,33,24,0.16)] md:w-28"
            />
            <img
              src="/pecs/pronto.jpg"
              alt=""
              className="landing-float-slow absolute -top-3 -right-2 w-24 rounded-[18px] border-4 border-[#b87a1c] shadow-[0_18px_40px_rgba(42,33,24,0.16)] md:w-28"
            />
          </div>
        </section>

        <section className="border-y-4 border-[#2a2118]/10 bg-[#fff8ec]/70 py-8">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4">
            {pedidos.map((card) => (
              <PecsCard key={card.slug} {...card} />
            ))}
          </div>
          <p className="mx-auto mt-5 max-w-6xl px-4 text-center text-sm text-[#5a4c3d]">
            Toque num cartão para ouvir. É o mesmo quadro que a criança usa.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-xs font-bold tracking-[0.22em] text-[#9a3d28] uppercase">
            Como funciona
          </p>
          <h2 className="font-serif mt-2 text-4xl md:text-5xl">
            Três toques e a casa entende.
          </h2>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                n: '1',
                title: 'Monte a casa',
                text: 'Mãe ou pai cria a conta, coloca a criança e o avatar. A professora entra no mesmo quadro.',
              },
              {
                n: '2',
                title: 'Mostre o cartão',
                text: 'Xixi, cocô, banheiro ou ajuda. A criança aponta ou entrega. O cartão fala.',
              },
              {
                n: '3',
                title: 'Anote a hora',
                text: 'Um toque em “fez agora” guarda o horário. Depois vocês veem o ritmo do dia.',
              },
            ].map((step) => (
              <li
                key={step.n}
                className="rounded-[22px] border-4 border-[#b87a1c] bg-[#fff8ec] p-5 shadow-[0_18px_40px_rgba(42,33,24,0.08)]"
              >
                <span className="grid size-10 place-items-center rounded-full border-2 border-[#2a2118] bg-[#e0a03a] font-display text-lg font-extrabold">
                  {step.n}
                </span>
                <h3 className="font-display mt-4 text-2xl">{step.title}</h3>
                <p className="mt-2 text-[#5a4c3d]">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 md:grid-cols-2 md:py-16">
          <div>
            <p className="text-xs font-bold tracking-[0.22em] text-[#9a3d28] uppercase">
              Diário
            </p>
            <h2 className="font-serif mt-2 text-4xl">
              Que horas ele fez xixi?
            </h2>
            <p className="mt-4 text-lg text-[#5a4c3d]">
              A creche toca um botão. A casa vê o horário. Sem papel, sem
              “depois eu anoto”.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {times.map((item) => (
                <li
                  key={item.clock + item.kind}
                  className="rounded-full border-2 border-[#2a2118] bg-white px-3 py-1.5 text-sm font-bold"
                >
                  {item.clock} {item.kind}
                </li>
              ))}
            </ul>
          </div>
          <img
            src="/landing/relogio.jpg"
            alt="Criança ilustrada apontando para um relógio de sol"
            className="w-full"
          />
        </section>

        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 md:grid-cols-2 md:py-16">
          <img
            src="/landing/casa-creche.jpg"
            alt="Menino e menina ilustrados com um tablet de cartões PECS"
            className="w-full md:order-1"
          />
          <div className="md:order-2">
            <p className="text-xs font-bold tracking-[0.22em] text-[#9a3d28] uppercase">
              Casa e creche
            </p>
            <h2 className="font-serif mt-2 text-4xl">
              O mesmo quadro, dois lugares.
            </h2>
            <p className="mt-4 text-lg text-[#5a4c3d]">
              A professora entra com o próprio acesso. O que ela anota aparece
              para a família. Ninguém precisa lembrar de recado no fim do dia.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-xs font-bold tracking-[0.22em] text-[#9a3d28] uppercase">
            Rotina
          </p>
          <h2 className="font-serif mt-2 text-4xl">Um passo de cada vez.</h2>
          <p className="mt-3 max-w-xl text-[#5a4c3d]">
            Ir ao banheiro, sentar, fazer, papel, descarga, mãos. A criança vê o
            próximo cartão e ouve a palavra.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {rotina.map((card, index) => (
              <PecsCard key={card.slug} {...card} number={index + 1} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 md:py-16">
          <p className="text-xs font-bold tracking-[0.22em] text-[#9a3d28] uppercase">
            Avatar
          </p>
          <h2 className="font-serif mt-2 text-4xl">Parece com a criança.</h2>
          <p className="mt-3 max-w-xl text-[#5a4c3d]">
            Pele, cabelo, gênero. O mesmo traço dos cartões, para o quadro ser
            dela — ou dele.
          </p>
          <ul className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {avatars.map((avatar) => (
              <li
                key={avatar.src}
                className="overflow-hidden rounded-[22px] border-4 border-[#b87a1c] bg-[#f7f0e4]"
              >
                <img src={avatar.src} alt={avatar.name} className="w-full" />
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-16">
          <div className="rounded-[28px] border-4 border-[#2a2118] bg-[#fff8ec] px-6 py-12 text-center shadow-[0_18px_40px_rgba(42,33,24,0.12)]">
            <img
              src="/pecs/pronto.jpg"
              alt=""
              className="mx-auto mb-5 size-28"
            />
            <h2 className="font-serif text-4xl md:text-5xl">
              Pronto para o vaso?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-lg text-[#5a4c3d]">
              Crie a conta da casa, chame a professora e comece pelos cartões.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/cadastro"
                className="rounded-2xl bg-[#c45c3e] px-6 py-3 font-bold text-white no-underline"
              >
                Criar conta
              </Link>
              <Link
                to="/entrar"
                className="rounded-2xl border-2 border-[#2a2118] px-6 py-3 font-bold text-[#2a2118] no-underline"
              >
                Entrar
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#2a2118]/10 px-4 py-8 text-center text-sm text-[#5a4c3d]">
        Vivências Azuis · Desfralde · PECS para o vaso
      </footer>
    </div>
  )
}

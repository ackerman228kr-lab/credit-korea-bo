"use client";

/* eslint-disable @next/next/no-img-element */
import { useActionState } from "react";
import { Loader2, Lock } from "lucide-react";
import { login } from "@/app/admin/actions";
import { site } from "@/lib/site";
import { Button } from "@/components/ui/button";

export function LoginForm({ configured, devHint }: { configured: boolean; devHint: boolean }) {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="glass-strong w-full max-w-sm rounded-[2rem] p-8">
      <img src={site.logo} alt="" className="h-12 w-12" />
      <h1 className="mt-6 font-display text-3xl text-white">Админ-панель</h1>
      <p className="mt-1 text-sm text-platinum/50">{site.name}</p>
      {!configured ? (
        <p className="mt-6 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">
          Задайте переменную окружения ADMIN_PASSWORD, чтобы включить вход.
        </p>
      ) : (
        <>
          <label className="label mt-8" htmlFor="password">Пароль</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-platinum/40" />
            <input id="password" name="password" type="password" required autoFocus className="field pl-11" autoComplete="current-password" />
          </div>
          {state?.error && <p className="mt-3 text-sm text-red-300">{state.error}</p>}
          {devHint && <p className="mt-3 text-xs text-platinum/40">Режим разработки: пароль «admin».</p>}
          <Button type="submit" className="mt-6 w-full" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />} Войти
          </Button>
        </>
      )}
    </form>
  );
}

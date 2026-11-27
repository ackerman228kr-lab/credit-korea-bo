import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-8xl text-gold">404</p>
      <p className="mt-4 text-platinum/60">Такой страницы нет в нашем шоуруме.</p>
      <Button asChild className="mt-8">
        <Link href="/">На главную</Link>
      </Button>
    </main>
  );
}

import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NutriPlan — Calcul nutritionnel personnalisé" },
      {
        name: "description",
        content:
          "Calculez vos besoins caloriques quotidiens et la répartition en macronutriments, et conservez l'historique de vos calculs dans votre compte.",
      },
      { property: "og:title", content: "NutriPlan — Calcul nutritionnel" },
      {
        property: "og:description",
        content:
          "Calculez vos besoins caloriques quotidiens et conservez l'historique de vos calculs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Accueil,
});

function Accueil() {
  const [connecte, setConnecte] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setConnecte(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) =>
      setConnecte(!!session),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex justify-end">
          {connecte ? (
            <Link
              to="/calcul"
              className="rounded-2xl border border-primary/50 bg-primary/15 px-4 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary/25"
            >
              Mon espace
            </Link>
          ) : (
            <Link
              to="/auth"
              className="rounded-2xl border border-primary/50 bg-primary/15 px-4 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary/25"
            >
              Se connecter
            </Link>
          )}
        </div>

        <header className="mb-12 text-center">
          <div
            className="mb-4 inline-flex items-center justify-center rounded-2xl bg-primary/15 text-primary glow-ring"
            style={{ width: "4.5rem", height: "4.5rem" }}
          >
            <svg
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M11 20A7 7 0 0 1 4 13c0-5 5-9 16-9 0 11-4 16-9 16Z" />
              <path d="M4 20c4-5 7-8 12-11" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            Nutri<span className="text-primary">Plan</span>
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Vos besoins nutritionnels quotidiens, calculés simplement
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to={connecte ? "/calcul" : "/auth"}
              className="w-full rounded-2xl border border-primary/50 bg-primary/20 px-6 py-3.5 text-base font-semibold text-primary transition-all hover:bg-primary/30 soft-shadow sm:w-auto"
            >
              {connecte ? "Faire un calcul" : "Commencer"}
            </Link>
            {!connecte && (
              <Link
                to="/auth"
                className="w-full rounded-2xl border border-border bg-card/60 px-6 py-3.5 text-base font-semibold text-foreground transition-all hover:border-primary/50 sm:w-auto"
              >
                J'ai déjà un compte
              </Link>
            )}
          </div>
        </header>

        <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              titre: "Besoins énergétiques",
              texte:
                "Votre métabolisme de base et votre dépense quotidienne selon votre profil.",
            },
            {
              titre: "Macronutriments",
              texte:
                "La répartition conseillée entre protéines, glucides et lipides.",
            },
            {
              titre: "Historique",
              texte:
                "Vos vingt derniers calculs conservés dans votre compte, consultables à tout moment.",
            },
          ].map((c) => (
            <div
              key={c.titre}
              className="rounded-3xl border border-border bg-card/70 p-6 backdrop-blur-sm soft-shadow"
            >
              <h2 className="mb-2 text-base font-semibold text-foreground">
                {c.titre}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {c.texte}
              </p>
            </div>
          ))}
        </section>

        <aside
          role="note"
          className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-5 soft-shadow sm:p-6"
        >
          <div className="flex gap-3.5">
            <span className="text-xl leading-none">⚠️</span>
            <div className="space-y-1.5 text-sm leading-relaxed text-foreground/90">
              <p className="font-semibold text-foreground">
                Informations indicatives
              </p>
              <p>
                Les valeurs calculées sont indicatives et ne remplacent en aucun
                cas l'avis d'un professionnel de santé qualifié. Cette
                application s'adresse aux personnes majeures.
              </p>
            </div>
          </div>
        </aside>

        <footer className="mt-10 text-center text-xs text-muted-foreground">
          <p className="leading-relaxed">
            Calcul basé sur l'équation de Mifflin-St Jeor · NutriPlan
          </p>
        </footer>
      </div>
    </div>
  );
}

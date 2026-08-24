import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion — NutriPlan" },
      {
        name: "description",
        content:
          "Connectez-vous ou créez un compte NutriPlan pour enregistrer et retrouver l'historique de vos calculs nutritionnels.",
      },
      { property: "og:title", content: "Connexion — NutriPlan" },
      {
        property: "og:description",
        content:
          "Connectez-vous ou créez un compte NutriPlan pour retrouver l'historique de vos calculs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"connexion" | "inscription">("connexion");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    try {
      if (mode === "inscription") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: motDePasse,
          options: { emailRedirectTo: `${window.location.origin}/calcul` },
        });
        if (error) throw error;
        if (data.session) {
          navigate({ to: "/calcul" });
        } else {
          setMessage(
            "Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse, puis connectez-vous.",
          );
          setMode("connexion");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: motDePasse,
        });
        if (error) throw error;
        navigate({ to: "/calcul" });
      }
    } catch (err) {
      const brut = err instanceof Error ? err.message : "Une erreur est survenue.";
      setErreur(
        brut.includes("Invalid login credentials")
          ? "Adresse email ou mot de passe incorrect."
          : brut.includes("already registered")
            ? "Un compte existe déjà avec cette adresse email."
            : brut,
      );
    } finally {
      setEnCours(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="text-3xl font-bold tracking-tight text-foreground">
            Nutri<span className="text-primary">Plan</span>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "connexion"
              ? "Connectez-vous pour retrouver vos calculs"
              : "Créez un compte pour enregistrer vos calculs"}
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card/70 p-6 backdrop-blur-sm soft-shadow sm:p-8">
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl border border-border bg-input/50 p-1">
            {(["connexion", "inscription"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setErreur(null);
                  setMessage(null);
                }}
                className={
                  "rounded-xl px-3 py-2 text-sm font-semibold transition-all " +
                  (mode === m
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {m === "connexion" ? "Connexion" : "Inscription"}
              </button>
            ))}
          </div>

          <form onSubmit={soumettre} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className="rounded-2xl border border-border bg-input px-3.5 py-3 text-base text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:glow-ring"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="mdp" className="text-sm font-medium text-foreground">
                Mot de passe
              </label>
              <input
                id="mdp"
                type="password"
                required
                minLength={6}
                autoComplete={mode === "connexion" ? "current-password" : "new-password"}
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                placeholder="••••••••"
                className="rounded-2xl border border-border bg-input px-3.5 py-3 text-base text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:glow-ring"
              />
            </div>

            {erreur && (
              <p className="rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-foreground">
                {erreur}
              </p>
            )}
            {message && (
              <p className="rounded-2xl border border-primary/40 bg-primary/10 p-3 text-sm text-foreground">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={enCours}
              className="w-full rounded-2xl border border-primary/50 bg-primary/15 px-6 py-3.5 text-base font-semibold text-primary transition-all hover:bg-primary/25 disabled:opacity-60"
            >
              {enCours
                ? "Veuillez patienter…"
                : mode === "connexion"
                  ? "Se connecter"
                  : "Créer mon compte"}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm">
          <Link to="/" className="text-muted-foreground hover:text-primary">
            ← Retour à l'accueil
          </Link>
        </p>
      </div>
    </div>
  );
}

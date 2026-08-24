import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

type Sexe = "homme" | "femme";
type Activite = "sedentaire" | "leger" | "modere" | "actif" | "intense";
type Objectif = "maintien" | "perte" | "prise";

const ACTIVITE_FACTEUR: Record<Activite, number> = {
  sedentaire: 1.2,
  leger: 1.375,
  modere: 1.55,
  actif: 1.725,
  intense: 1.9,
};

const ACTIVITE_LABELS: { value: Activite; label: string; desc: string }[] = [
  { value: "sedentaire", label: "Sédentaire", desc: "Peu ou pas d'exercice" },
  { value: "leger", label: "Léger", desc: "1–3 séances / semaine" },
  { value: "modere", label: "Modéré", desc: "3–5 séances / semaine" },
  { value: "actif", label: "Actif", desc: "6–7 séances / semaine" },
  { value: "intense", label: "Intense", desc: "Travail physique ou sport quotidien" },
];

const OBJECTIF_LABELS: { value: Objectif; label: string; desc: string }[] = [
  { value: "maintien", label: "Maintien", desc: "Stabiliser le poids" },
  { value: "perte", label: "Perte de poids", desc: "Déficit modéré" },
  { value: "prise", label: "Prise de masse", desc: "Surplus modéré" },
];

const REPAS_REPARTITION = [
  { repas: "Petit-déjeuner", part: 0.25, color: "oklch(0.78 0.17 145)" },
  { repas: "Déjeuner", part: 0.35, color: "oklch(0.72 0.16 70)" },
  { repas: "Collation", part: 0.1, color: "oklch(0.66 0.15 40)" },
  { repas: "Dîner", part: 0.3, color: "oklch(0.6 0.14 220)" },
];

interface Resultat {
  bmr: number;
  tdee: number;
  calories: number;
  proteines: number; // grammes
  glucides: number; // grammes
  lipides: number; // grammes
  proteinesKcal: number;
  glucidesKcal: number;
  lipidesKcal: number;
}

function calculer(
  sexe: Sexe,
  age: number,
  taille: number,
  poids: number,
  activite: Activite,
  objectif: Objectif,
): Resultat {
  // Mifflin-St Jeor
  const bmr =
    10 * poids +
    6.25 * taille -
    5 * age +
    (sexe === "homme" ? 5 : -161);

  const tdee = bmr * ACTIVITE_FACTEUR[activite];

  let calories = tdee;
  if (objectif === "perte") calories = tdee - 500;
  if (objectif === "prise") calories = tdee + 400;
  if (calories < 1200) calories = 1200;

  // Macros
  // Protéines : 1.8 g/kg
  const proteines = poids * 1.8;
  // Lipides : 28% des calories
  const lipidesKcal = calories * 0.28;
  const lipides = lipidesKcal / 9;
  // Glucides : reste
  const proteinesKcal = proteines * 4;
  const glucidesKcal = calories - proteinesKcal - lipidesKcal;
  const glucides = glucidesKcal / 4;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calories: Math.round(calories),
    proteines: Math.round(proteines),
    glucides: Math.round(glucides),
    lipides: Math.round(lipides),
    proteinesKcal: Math.round(proteinesKcal),
    glucidesKcal: Math.round(glucidesKcal),
    lipidesKcal: Math.round(lipidesKcal),
  };
}

function OptionCard({
  active,
  onClick,
  label,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "group relative flex flex-col items-start gap-1 rounded-2xl border p-3.5 text-left transition-all duration-200 " +
        (active
          ? "border-primary bg-primary/15 glow-ring"
          : "border-border bg-card/60 hover:border-primary/50 hover:bg-accent/40")
      }
    >
      <span
        className={
          "text-sm font-semibold " +
          (active ? "text-primary" : "text-foreground")
        }
      >
        {label}
      </span>
      <span className="text-xs leading-relaxed text-muted-foreground">{desc}</span>
    </button>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  unite,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  unite: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-input px-3.5 py-3 focus-within:border-primary focus-within:glow-ring transition-all">
        <input
          type="number"
          value={Number.isNaN(value) ? "" : value}
          onChange={(e) => onChange(e.target.valueAsNumber)}
          min={min}
          max={max}
          className="w-full bg-transparent text-lg font-semibold tracking-tight text-foreground outline-none placeholder:text-muted-foreground"
        />
        <span className="text-sm font-medium text-muted-foreground">{unite}</span>
      </div>
    </div>
  );
}

function MacroBar({
  label,
  grammes,
  kcal,
  part,
  color,
}: {
  label: string;
  grammes: number;
  kcal: number;
  part: number; // 0..1
  color: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">
          {Math.round(part * 100)}% · {kcal} kcal
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-primary">{grammes}</span>
        <span className="text-sm text-muted-foreground">g</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.max(4, part * 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title: "NutriPlan — Calcul nutritionnel personnalisé",
      },
      {
        name: "description",
        content:
          "Calculez vos besoins caloriques quotidiens et la répartition en macronutriments selon votre profil et votre objectif.",
      },
      { property: "og:title", content: "NutriPlan — Calcul nutritionnel" },
      {
        property: "og:description",
        content:
          "Calculez vos besoins caloriques quotidiens et la répartition en macronutriments selon votre profil et votre objectif.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NutriPlan,
});

export default function NutriPlan() {
  const [sexe, setSexe] = useState<Sexe>("homme");
  const [age, setAge] = useState<number>(30);
  const [taille, setTaille] = useState<number>(175);
  const [poids, setPoids] = useState<number>(70);
  const [activite, setActivite] = useState<Activite>("modere");
  const [objectif, setObjectif] = useState<Objectif>("maintien");

  const resultat = useMemo(
    () => calculer(sexe, age, taille, poids, activite, objectif),
    [sexe, age, taille, poids, activite, objectif],
  );

  const totalKcal =
    resultat.proteinesKcal + resultat.glucidesKcal + resultat.lipidesKcal || 1;

  const macros = [
    {
      label: "Protéines",
      grammes: resultat.proteines,
      kcal: resultat.proteinesKcal,
      part: resultat.proteinesKcal / totalKcal,
      color: "oklch(0.78 0.17 145)",
    },
    {
      label: "Glucides",
      grammes: resultat.glucides,
      kcal: resultat.glucidesKcal,
      part: resultat.glucidesKcal / totalKcal,
      color: "oklch(0.72 0.16 70)",
    },
    {
      label: "Lipides",
      grammes: resultat.lipides,
      kcal: resultat.lipidesKcal,
      part: resultat.lipidesKcal / totalKcal,
      color: "oklch(0.66 0.15 40)",
    },
  ];

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <header className="mb-8 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary glow-ring">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 20A7 7 0 0 1 4 13c0-5 5-9 16-9 0 11-4 16-9 16Z" />
              <path d="M4 20c4-5 7-8 12-11" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Nutri<span className="text-primary">Plan</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Calculez vos besoins nutritionnels quotidiens
          </p>
        </header>

        {/* Formulaire */}
        <section className="mb-6 rounded-3xl border border-border bg-card/80 p-5 backdrop-blur-sm sm:p-7">
          <h2 className="mb-5 text-lg font-semibold text-foreground">
            Votre profil
          </h2>

          {/* Sexe */}
          <div className="mb-5">
            <span className="mb-2 block text-sm font-medium text-foreground">
              Sexe
            </span>
            <div className="grid grid-cols-2 gap-3">
              {(["homme", "femme"] as Sexe[]).map((s) => (
                <OptionCard
                  key={s}
                  active={sexe === s}
                  onClick={() => setSexe(s)}
                  label={s === "homme" ? "Homme" : "Femme"}
                  desc={s === "homme" ? "Biologique mâle" : "Biologique femelle"}
                />
              ))}
            </div>
          </div>

          {/* Champs numériques */}
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <NumberField
              label="Âge"
              value={age}
              onChange={setAge}
              min={18}
              max={100}
              unite="ans"
            />
            <NumberField
              label="Taille"
              value={taille}
              onChange={setTaille}
              min={120}
              max={220}
              unite="cm"
            />
            <NumberField
              label="Poids"
              value={poids}
              onChange={setPoids}
              min={35}
              max={250}
              unite="kg"
            />
          </div>

          {/* Activité */}
          <div className="mb-5">
            <span className="mb-2 block text-sm font-medium text-foreground">
              Niveau d'activité physique
            </span>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {ACTIVITE_LABELS.map((a) => (
                <OptionCard
                  key={a.value}
                  active={activite === a.value}
                  onClick={() => setActivite(a.value)}
                  label={a.label}
                  desc={a.desc}
                />
              ))}
            </div>
          </div>

          {/* Objectif */}
          <div>
            <span className="mb-2 block text-sm font-medium text-foreground">
              Objectif
            </span>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {OBJECTIF_LABELS.map((o) => (
                <OptionCard
                  key={o.value}
                  active={objectif === o.value}
                  onClick={() => setObjectif(o.value)}
                  label={o.label}
                  desc={o.desc}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Résultats */}
        <section className="mb-6 space-y-6">
          {/* Calorie principale */}
          <div className="rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/15 via-card to-card p-6 glow-ring">
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Besoins énergétiques quotidiens
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-5xl font-bold text-primary sm:text-6xl">
                  {resultat.calories}
                </span>
                <span className="text-xl font-semibold text-foreground">
                  kcal
                </span>
              </div>
              <span className="mt-1 text-xs text-muted-foreground">
                Métabolisme de base : {resultat.bmr} kcal · Dépense totale :{" "}
                {resultat.tdee} kcal
              </span>
            </div>
          </div>

          {/* Macros */}
          <div className="rounded-3xl border border-border bg-card/80 p-5 backdrop-blur-sm sm:p-7">
            <h2 className="mb-5 text-lg font-semibold text-foreground">
              Répartition des macronutriments
            </h2>
            <div className="space-y-5">
              {macros.map((m) => (
                <MacroBar key={m.label} {...m} />
              ))}
            </div>
          </div>

          {/* Répartition des repas */}
          <div className="rounded-3xl border border-border bg-card/80 p-5 backdrop-blur-sm sm:p-7">
            <h2 className="mb-5 text-lg font-semibold text-foreground">
              Répartition indicative sur la journée
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {REPAS_REPARTITION.map((r) => {
                const kcalRepas = Math.round(resultat.calories * r.part);
                const protRepas = Math.round(resultat.proteines * r.part);
                const glucRepas = Math.round(resultat.glucides * r.part);
                const lipRepas = Math.round(resultat.lipides * r.part);
                return (
                  <div
                    key={r.repas}
                    className="flex flex-col gap-1 rounded-2xl border border-border bg-input/40 p-3"
                  >
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: r.color }}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-semibold text-foreground">
                      {r.repas}
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {kcalRepas} kcal
                    </span>
                    <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Protéines</span>
                        <span className="font-medium text-foreground">
                          {protRepas} g
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Glucides</span>
                        <span className="font-medium text-foreground">
                          {glucRepas} g
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lipides</span>
                        <span className="font-medium text-foreground">
                          {lipRepas} g
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Avertissement permanent */}
        <aside
          role="note"
          className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 sm:p-5"
        >
          <div className="flex gap-3">
            <span className="text-xl leading-none">⚠️</span>
            <div className="space-y-1 text-sm text-foreground/90">
              <p className="font-semibold text-foreground">
                Informations indicatives
              </p>
              <p>
                Les valeurs présentées sont indicatives et fournies à titre de
                répartition. Elles ne remplacent en aucun cas l'avis d'un
                professionnel de santé qualifié (médecin, diététicien ou
                nutritionniste).
              </p>
              <p>
                Cette application s'adresse aux personnes majeures. En cas de
                problème de santé, de grossesse, d'allaitement ou de régime
                médical, consultez un professionnel avant toute modification de
                votre alimentation.
              </p>
            </div>
          </div>
        </aside>

        <footer className="mt-8 text-center text-xs text-muted-foreground">
          <p>
            Calcul basé sur l'équation de Mifflin-St Jeor · NutriPlan ne collecte
            aucune donnée
          </p>
        </footer>
      </div>
    </div>
  );
}

export interface DonneesPdf {
  sexe: string;
  age: number;
  taille: number;
  poids: number;
  activite: string;
  objectif: string;
  bmr: number;
  tdee: number;
  calories: number;
  macros: { label: string; grammes: number; kcal: number; part: number }[];
  repas: {
    repas: string;
    kcal: number;
    proteines: number;
    glucides: number;
    lipides: number;
  }[];
}

export async function exporterResultatsPdf(d: DonneesPdf) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const marge = 48;
  const largeur = doc.internal.pageSize.getWidth();
  let y = marge;

  const titre = (texte: string, taille = 13) => {
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(taille);
    doc.setTextColor(20, 83, 45);
    doc.text(texte, marge, y);
    y += 14;
    doc.setDrawColor(200, 220, 205);
    doc.line(marge, y, largeur - marge, y);
    y += 14;
  };

  const ligne = (gauche: string, droite: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(gauche, marge, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(25, 25, 25);
    doc.text(droite, largeur - marge, y, { align: "right" });
    y += 17;
  };

  // En-tête
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(22, 101, 52);
  doc.text("NutriPlan", marge, y);
  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110, 110, 110);
  doc.text(
    "Résultats du calcul nutritionnel — " +
      new Date().toLocaleDateString("fr-FR"),
    marge,
    y,
  );
  y += 8;

  titre("Votre profil");
  ligne("Sexe", d.sexe);
  ligne("Âge", `${d.age} ans`);
  ligne("Taille", `${d.taille} cm`);
  ligne("Poids", `${d.poids} kg`);
  ligne("Niveau d'activité", d.activite);
  ligne("Objectif", d.objectif);

  titre("Besoins énergétiques quotidiens");
  ligne("Métabolisme de base", `${d.bmr} kcal`);
  ligne("Dépense énergétique totale", `${d.tdee} kcal`);
  ligne("Apport conseillé", `${d.calories} kcal`);

  titre("Répartition des macronutriments");
  for (const m of d.macros) {
    ligne(
      m.label,
      `${m.grammes} g — ${m.kcal} kcal (${Math.round(m.part * 100)} %)`,
    );
  }

  titre("Répartition indicative sur la journée");
  for (const r of d.repas) {
    ligne(
      r.repas,
      `${r.kcal} kcal — P ${r.proteines} g / G ${r.glucides} g / L ${r.lipides} g`,
    );
  }

  titre("Informations indicatives");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(90, 90, 90);
  const avert = doc.splitTextToSize(
    "Les valeurs présentées sont indicatives. Elles ne remplacent en aucun cas l'avis d'un professionnel de santé qualifié (médecin, diététicien ou nutritionniste). Cette application s'adresse aux personnes majeures. En cas de problème de santé, de grossesse, d'allaitement ou de régime médical, consultez un professionnel avant toute modification de votre alimentation.",
    largeur - marge * 2,
  );
  doc.text(avert, marge, y);
  y += avert.length * 13 + 10;

  doc.setFontSize(8.5);
  doc.setTextColor(140, 140, 140);
  doc.text(
    "Calcul basé sur l'équation de Mifflin-St Jeor · NutriPlan",
    marge,
    y,
  );

  doc.save("nutriplan-resultats.pdf");
}

# Comprendre le portfolio

Les contenus sont fictifs. Cette version reste locale ; aucune publication n’a été effectuée.

## Les fichiers à connaître

- `src/app/data/portfolio.ts` : profil, projets, compétences et liste des applications.
- `src/app/app.ts` : bureau, horloge et état des fenêtres.
- `src/app/components/desktop-window/` : cadre, déplacement, ouverture, réduction et fermeture.
- `src/app/components/window-content/` : contenu des quatre sections et filtres.
- `src/app/components/app-icon/` : icônes vectorielles communes au bureau et au dock.
- `public/projects/` : illustrations des projets de démonstration.
- `public/cv-demo.html` : CV fictif téléchargeable. Il faudra le remplacer avant publication.

## 1. Une seule source de vérité

Chaque application possède un état dans le signal `windows` :

```ts
{ status: 'open', layer: 5 }
```

`status` vaut `closed`, `open` ou `minimized`. `layer` détermine quelle fenêtre passe devant.
Le bureau et le dock lisent le même signal : il n’y a pas deux états à synchroniser.

## 2. Réduire n’est pas fermer

Une fenêtre fermée disparaît du DOM avec `@if` : son composant est détruit.
Une fenêtre réduite conserve son composant et reçoit une classe qui la masque.
Sa position et son filtre sont ainsi conservés. L’animation de réduction rejoint son icône dans le dock.
`afterRenderEffect` rejoue l’entrée lorsque l’input `minimized` repasse à `false`.

## 3. Les responsabilités des composants

`App` choisit quelle fenêtre est ouverte. `DesktopWindow` gère les mouvements du cadre.
`WindowContent` affiche les données. Les événements `closed`, `reduced` et `contactRequested`
remontent vers le composant parent, qui décide de la modification d’état.

## 4. Filtres réactifs

`activeFilter` est un signal modifiable. `filteredProjects` est un `computed` qui dérive une liste.
Le tableau original ne change pas. Ajouter un projet dans les données suffit à ajouter sa carte.
Une animation CSS `animate.enter` révèle les cartes nouvellement insérées après filtrage.

## 5. Qui anime quoi ?

GSAP coordonne l’entrée du bureau et les mouvements de fenêtres. CSS gère les survols et l’entrée des cartes.
Le centrage des fenêtres utilise `left`, sans `transform` de centrage : GSAP peut animer `x`, `y` et `scale`
sans casser la position lors d’un changement de largeur d’écran.
Les animations sont désactivées lorsque le navigateur indique `prefers-reduced-motion: reduce`.
Les animations et l’horloge sont nettoyées à la destruction de leurs composants.

## 6. Images et responsive

Chaque aperçu a un parent `position: relative` et `aspect-ratio: 8 / 5`.
`NgOptimizedImage` utilise `fill`. `object-fit: cover` remplit le cadre en conservant les proportions.
`sizes` emploie des valeurs responsive pour éviter l’erreur Angular NG02952.
Sur mobile, les fenêtres ne sont pas déplaçables. Leur contenu défile à l’intérieur d’une hauteur limitée.
Le dock reste disponible, indépendamment de la longueur du contenu.

## 7. Personnaliser ensuite

1. Remplacer le profil, les projets et les compétences dans `portfolio.ts`.
2. Remplacer les illustrations par des captures réelles dans `public/projects`.
3. Remplacer l’adresse `bonjour@example.com`, les liens génériques GitHub/LinkedIn et le CV de démonstration.
4. Retirer les mentions de démonstration une fois les informations vérifiées.
5. Préparer le référencement et le déploiement lors d’une prochaine étape.

## Exercice pour apprendre

Ajoute un quatrième projet dans `PROJECTS`, avec `category: 'backend'`.
Vérifie le compteur, le filtre Backend et la nouvelle carte sans modifier le template.
Réduis ensuite la fenêtre et restaure-la : le filtre sélectionné doit être conservé.

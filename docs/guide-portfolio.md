# Comprendre le portfolio et ses fenêtres

Les contenus sont fictifs. Cette version reste locale ; aucune publication n’a été effectuée.

## Les fichiers à connaître

- `src/app/data/portfolio.ts` : profil, projets, compétences, expériences et applications.
- `src/app/windows/window-geometry.ts` : calculs purs de rectangles, limites et dispositions.
- `src/app/windows/window-manager.ts` : contrôleur partagé, états et gestes.
- `src/app/components/desktop-window/` : cadre, contrôles, capture du pointeur et animations.
- `src/app/components/window-overlays/` : aperçu d’ancrage, séparations et suggestions.
- `src/app/components/snap-layout-menu/` : menu des dispositions.
- `src/app/components/window-content/` : contenu des cinq sections et filtres.
- `public/projects/` et `public/cv-demo.html` : illustrations et CV fictifs.

## 1. Comprendre la géométrie

Chaque fenêtre possède un rectangle dans le contrôleur :

```ts
{ x: 12, y: 58, width: 622, height: 641 }
```

Les coordonnées sont exprimées en pixels dans le bureau. Angular applique `left`, `top`, `width` et `height`.
La géométrie n’utilise pas `transform` : cette propriété reste disponible pour GSAP.

La zone utile commence 12 px sous la barre supérieure et s’arrête 12 px au-dessus du dock.
Les marges latérales et les séparations font 12 px. `ResizeObserver` et l’événement `resize` recalculent cette zone.
Les mesures utilisent `offsetTop` et `offsetHeight`, afin d’ignorer les transformations de l’animation d’entrée du bureau.

## 2. Séparer visibilité et présentation

Le signal `windows` est la source de vérité commune au bureau, au dock et aux fenêtres :

- `status` : `closed`, `open` ou `minimized` ;
- `presentation` : `free`, `snapped` ou `maximized` ;
- `rect` : rectangle actuel ;
- `freeRect` : dernière géométrie libre, pour la restauration ;
- `placement` : disposition et zone mémorisées ;
- `layer` : ordre d’empilement.

Réduire masque le composant sans le détruire. Le contenu, le défilement et le filtre restent disponibles à la restauration.
Fermer détruit son composant via `@if`. Restaurer une fenêtre réduite récupère sa zone si elle est libre ; sinon elle reprend sa géométrie libre.

## 3. Déplacer, redimensionner et annuler

La barre de titre démarre un déplacement. Les huit poignées démarrent un redimensionnement.
Chaque geste mémorise un instantané, puis utilise les différences entre les coordonnées du pointeur et celles de départ.
`setPointerCapture` permet de suivre le geste même lorsque le pointeur quitte la poignée.

Les fenêtres respectent une taille minimale de 320 × 220 px et restent dans la zone utile.
Les côtés opposés restent fixes pendant le redimensionnement. Une pression sans déplacement ne détache pas une fenêtre ancrée.
`pointercancel` ou la perte imprévue de capture restaure l’instantané. Un changement de viewport annule aussi le geste avant de recalculer les limites.

Une fenêtre agrandie ou ancrée redevient libre dès qu’on déplace réellement son titre. La position du pointeur dans le titre détermine où replacer sa largeur libre, pour éviter un saut.

## 4. Ancrage aux bords et aux coins

Pendant un déplacement :

- gauche ou droite : moitié du bureau ;
- coin : quart correspondant ;
- haut, hors des coins : agrandissement ;
- bas seul : aucun placement automatique.

Les bords se détectent à 24 px de la zone utile ; les coins occupent 64 × 64 px et sont prioritaires.
Un aperçu apparaît au-dessus des autres fenêtres et derrière celle qui est déplacée.
Le rectangle ne devient ancré qu’au relâchement. Quitter la zone fait disparaître l’aperçu.

Le bouton Agrandir et le double-clic sur le titre agrandissent ou restaurent la fenêtre.
Le survol du bouton Agrandir pendant 350 ms ouvre le menu ; le bouton adjacent permet aussi de l’ouvrir au clic.

## 5. Dispositions et assistant

Le menu propose deux moitiés, deux tiers/un tiers dans les deux sens, trois colonnes et quatre quarts.
Les dispositions incompatibles avec la zone utile ou les tailles minimales sont masquées.

Après un ancrage, l’assistant propose les autres fenêtres ouvertes ou réduites pour la prochaine zone libre.
Aucune application fermée n’est ouverte automatiquement. Fermer les suggestions ou cliquer à l’extérieur conserve les placements déjà faits.

Une seule disposition est active. En changer laisse ses anciens occupants à leur place, en mode libre.
Placer une fenêtre dans une zone occupée remet l’ancienne occupante à sa dernière géométrie libre.
Réduire ou fermer une fenêtre libère sa zone sans redistribuer les voisines.

## 6. Séparations communes

Le contrôleur conserve des proportions de colonnes et de rangées, par exemple `[0, 0.5, 1]`.
Une séparation commune modifie la proportion et recalcule tous les occupants concernés dans la même opération.
Le calcul empêche qu’une voisine passe sous 320 px de largeur ou 220 px de hauteur.

Le bord partagé utilise cette séparation ; un bord extérieur détache la fenêtre et permet son redimensionnement libre.
Dans une grille, la séparation verticale traverse les deux rangées et la séparation horizontale traverse les deux colonnes.

## 7. Responsive et animation

Les gestes de placement sont réservés aux écrans de plus de 600 px utilisant un pointeur précis, comme une souris.
Les événements tactiles ne démarrent pas de déplacement ou redimensionnement. Sur mobile, le contenu défile dans une fenêtre adaptée et le dock reste accessible.

Les `container queries` adaptent le contenu à la largeur réelle de sa fenêtre : sous 540 px, les projets passent en une colonne, même sur un grand écran.
Lors d’un changement de viewport, une disposition devenue impossible se dissout et les fenêtres libres sont bornées à la nouvelle zone utile.

Les gestes suivent directement le pointeur. Les placements utilisent une transition GSAP de 200 ms à partir de l’ancien rectangle.
L’ouverture, la fermeture et la réduction gardent leurs animations dédiées. Les animations sont supprimées avec `prefers-reduced-motion: reduce`.
Les captures, observateurs, écouteurs et animations sont nettoyés à la destruction.
Aucun raccourci de déplacement au clavier n’a été ajouté.

## 8. Vérifier et apprendre

```bash
npm test -- --watch=false
npm run build
```

Si le compilateur natif Sass/Dart échoue dans un environnement isolé, le compilateur JavaScript déjà installé peut être sélectionné pour la commande :

```bash
NG_BUILD_SASS_EMBEDDED=false npm run build
```

Les tests couvrent la géométrie, les seuils, les restaurations, les interruptions, les séparations, le menu et l’assistant.

Exercice : place Projets à gauche et À propos à droite. Déplace leur séparation, réduis Projets, puis restaure-la.
Vérifie que son filtre reste sélectionné. Détache-la ensuite par le titre, puis compare `rect` et `freeRect` dans le contrôleur.

## Personnaliser les données

Remplacer ensuite le profil, les projets, les compétences, les coordonnées, les liens génériques et le CV de démonstration.
Retirer les mentions fictives seulement après vérification du contenu. Référencement et déploiement restent une étape distincte.

## Mode immersif

Le CTA « Entrer dans l’expérience » appelle `requestFullscreen` directement depuis le clic,
car le navigateur exige une activation utilisateur. Le texte d’accueil s’efface et les icônes
s’animent sans ouvrir automatiquement une application. Le bouton « Quitter le mode immersif »
et Échap permettent de revenir à l’affichage normal sans fermer les fenêtres.

`fullscreenchange` synchronise l’interface quand le navigateur quitte lui-même le plein écran.
Si l’API manque ou si la demande est refusée, l’expérience reste utilisable dans la page,
avec un message explicite et le même bouton de sortie. Les animations respectent la réduction des mouvements.
Les écouteurs et animations sont nettoyés à la destruction du composant.

## Dossier Expériences

L’application « Expériences » utilise les mêmes contrôles et dispositions que les autres fenêtres.
Le tableau `EXPERIENCES` dans `portfolio.ts` contient les périodes, postes, organisations, missions et technologies.
Les trois étapes sont fictives et présentées dans une chronologie, à remplacer par le parcours réel.

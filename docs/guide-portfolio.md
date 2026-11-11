# Comprendre le portfolio et ses fenêtres

Cette version reste locale ; aucune publication n’a été effectuée.

## Les fichiers à connaître

- `src/app/data/portfolio.ts` : profil, projets, compétences, expériences et applications.
- `src/app/windows/window-geometry.ts` : calculs purs de rectangles, limites et dispositions.
- `src/app/windows/window-manager.ts` : contrôleur partagé, états et gestes.
- `src/app/components/desktop-window/` : cadre, contrôles, capture du pointeur et animations.
- `src/app/components/window-overlays/` : aperçu d’ancrage, séparations et suggestions.
- `src/app/components/snap-layout-menu/` : menu des dispositions.
- `src/app/components/window-content/` : contenu des sections du portfolio et accès aux paramètres et filtres.
- `public/projects/` et `public/cv-bogne-stanley.pdf` : illustrations et CV.

## 1. Comprendre la géométrie

Chaque fenêtre possède un rectangle dans le contrôleur :

```ts
{ x: 12, y: 58, width: 622, height: 641 }
```

Les coordonnées sont exprimées en pixels dans le bureau. Angular applique `left`, `top`, `width` et `height`.
La géométrie n’utilise pas `transform` : cette propriété reste disponible pour GSAP.

Sur ordinateur, la zone utile commence 12 px sous la barre supérieure et s’arrête 12 px au-dessus du dock.
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
Les événements tactiles ne démarrent pas de déplacement ou redimensionnement. Sur mobile, le dossier actif occupe tout le viewport et son contenu défile sous sa barre de titre ; le dock est masqué.

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

Remplacer ensuite le profil, les projets, les compétences, les coordonnées, les liens génériques et le CV.
Référencement et déploiement restent une étape distincte.

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
Les trois étapes sont présentées dans une chronologie.

## Paramètres et thèmes

L’application « Paramètres » utilise `SettingsPanel`. Le service `PreferencesStore` centralise les préférences dans un signal :

- thème sombre, clair ou automatique, synchronisé avec le thème de l’appareil ;
- accent prédéfini ou personnalisé, avec une variante lisible calculée pour les textes ;
- taille des textes à 100 %, 110 % ou 120 % ;
- réduction des animations, toujours active si l’appareil la demande ;
- affichage de la grille de fond.

Le thème effectif et la réduction des animations sont des `computed`. Un `effect` applique les attributs et variables CSS au document et enregistre les préférences dans `localStorage`, sous la clé `portfolio.preferences.v1`.
Le chargement valide chaque valeur et revient aux valeurs par défaut si les données sont invalides. Si le stockage est bloqué, les réglages restent utilisables pendant la visite.

Les couleurs des fenêtres, du dock, des menus d’ancrage et des contenus utilisent les mêmes jetons CSS dans `styles.scss`.
`--accent-fill` conserve la couleur choisie ; `--accent` fournit une couleur de texte avec un contraste adapté au thème ; `--accent-contrast` choisit le texte lisible sur un bouton rempli.
`--text-scale` agrandit les textes sans modifier les coordonnées des fenêtres.

« Réorganiser les fenêtres » restaure les tailles et positions libres et retire les ancrages, en conservant le contenu et l’état ouvert ou réduit de chaque application.
« Réinitialiser les préférences » restaure seulement les réglages visuels et de confort.
Sur petit écran, les six applications sont disposées en deux rangées pour rester lisibles, y compris avec le texte agrandi.

Exercice : choisir le thème clair et un accent bleu, agrandir le texte, puis recharger la page. Vérifier la conservation des préférences, ouvrir deux fenêtres et les réorganiser. Enfin, rétablir les réglages par défaut.

## Navigation mobile en plein écran

À 600 px de largeur ou moins, le dock est masqué. Ouvrir un dossier masque le bureau et donne à sa fenêtre toute la hauteur et la largeur du viewport, avec une barre de titre et un bouton de fermeture toujours visibles. Le contenu défile à l’intérieur ; aucune commande de réduction, d’ancrage ou de redimensionnement n’est présentée.

Le contrôleur distingue ce mode mobile de la simple absence de souris. Un seul dossier est ouvert à la fois. Lorsqu’un lien interne ouvre un autre dossier, le précédent est masqué en conservant son contenu. Fermer le dossier actif ramène au bureau ; le précédent ne réapparaît pas automatiquement.
Lors du passage de l’ordinateur au mobile, seule la fenêtre au premier plan reste ouverte ; les autres sont conservées réduites. Sur ordinateur, le dock et l’utilisation simultanée des fenêtres restent disponibles.

La zone utile mobile correspond au viewport entier. Les marges de sécurité de l’appareil sont respectées dans le titre et le contenu. Le focus passe au bouton de fermeture à l’ouverture, puis revient à l’icône du dossier à sa fermeture.

## Un assistant local pour explorer le portfolio

Le dossier **Assistant** reprend la présentation d’un chat : questions suggérées, messages, champ de saisie et boutons pour explorer les rubriques utilisées. Il suit les mêmes règles que les autres fenêtres : redimensionnement et réduction sur ordinateur, plein écran et retour au bureau sur mobile.

Le fonctionnement se répartit en trois parties :

- `src/app/chat/portfolio-answers.ts` reconnaît des sujets (profil, projets, compétences, parcours, contact) dans une question et construit une réponse à partir de `PROFILE`, `PROJECTS`, `SKILLS` et `EXPERIENCES`. Les accents et les majuscules sont normalisés. Une question peut concerner plusieurs rubriques ou un projet précis.
- `src/app/chat/chat-store.ts` conserve les messages dans un signal partagé. Fermer la fenêtre ne détruit donc pas la conversation. Le bouton « Nouvelle conversation » l’efface ; recharger la page aussi. Aucun message n’est envoyé à un serveur ou enregistré dans le stockage du navigateur.
- `src/app/components/portfolio-chat` affiche la conversation. Le formulaire utilise Signal Forms : le modèle est un signal, `form()` lui associe les règles de validation et `[formField]` relie le champ à ce modèle. Les questions vides ou dépassant 500 caractères ne sont pas envoyées.

Ce guide est un moteur de réponses déterministes, sans modèle d’IA : il ne comprend pas toutes les formulations et n’interprète pas les questions de suivi à partir des messages précédents. Une question inconnue invite à reformuler. Les informations absentes ne sont pas inventées. Pour personnaliser ses réponses, commence par remplacer les données du portfolio, puis enrichis les sujets reconnus et leurs tests.

Le journal de conversation utilise `role="log"` pour annoncer les nouveaux messages. Il défile indépendamment du champ de saisie et respecte les préférences de réduction des animations. Les sources sont des boutons qui ouvrent les dossiers existants ; sur mobile, le chat est réduit pendant la consultation et peut être retrouvé depuis son icône.

Le champ vide propose les questions les unes après les autres avec un effet d’écriture et d’effacement. Un `effect()` démarre un temporisateur uniquement lorsque la fenêtre est ouverte, le champ vide et sans focus. Sa fonction de nettoyage arrête le temporisateur lors d’un changement d’état ou de la destruction du composant. La préférence de réduction des animations conserve une question fixe. Le libellé accessible du champ reste stable pendant toute l’animation.

Chaque appel à `WindowManager.open()` incrémente aussi `openRequest` pour la fenêtre concernée. L’ouverture interrompt l’ancienne transition et relance l’entrée. Le callback d’une fermeture ou d’une réduction vérifie ce numéro avant de changer la visibilité : si le dossier a été rouvert entre-temps, ce callback devient obsolète. Cela évite qu’une animation encore en cours masque une fenêtre qui vient d’être rouverte depuis le dock.

Lors du passage au mobile, le plein écran est appliqué par les styles de la fenêtre : le contrôleur conserve `rect` et `freeRect` pour l’ordinateur. Il ne les borne pas à la largeur du téléphone. Au retour sur ordinateur, ces rectangles sont adaptés uniquement à la zone de bureau disponible. La même règle s’applique aux dossiers fermés puis ouverts depuis le mobile, ainsi qu’à la réorganisation des fenêtres dans les paramètres. Les dispositions ancrées sont dissoutes en retrouvant leur dernière géométrie libre.

## Les états du dock

`dockApplications` filtre la liste des applications : Assistant et Paramètres restent épinglés, les autres apparaissent lorsqu’ils sont ouverts ou réduits et disparaissent à leur fermeture. `foregroundWindow` retrouve la fenêtre ouverte ayant la couche la plus élevée. Son icône reçoit `aria-current` et une barre de 22 px ; les autres fenêtres ouvertes ont un point discret. Une fenêtre réduite reste dans le dock pour pouvoir être restaurée, sans indicateur dessous. Sur mobile, le dock reste masqué. Ces informations sont calculées à partir de l’état existant, sans ajouter un second état à synchroniser.

## Personnalisation du profil

Le profil, les trois expériences professionnelles, les deux formations, les compétences, les langues et les neuf projets sont renseignés à partir du CV fourni. Les réalisations en entreprise figurent aux côtés des packages Flutter et du podcast. Les illustrations de projets sont des couvertures graphiques, pas des captures des applications. Les liens GitHub et LinkedIn génériques ont été retirés en l’absence d’adresses personnelles dans le CV. Le téléchargement utilise le PDF fourni, conservé sans modification. Les réponses du chat lisent les mêmes données, y compris pour les études, les langues, la localisation et le téléphone.

## Le monogramme Impulsion

La direction retenue est **Impulsion**, avec une inclinaison vers l’avant et des terminaisons en biais. Le composant `BrandMark` dessine le monogramme en SVG dans la barre supérieure et la rubrique À propos. Le corps suit `--text` et le point carré suit `--accent`, ce qui conserve la lisibilité entre les thèmes. Les fichiers réutilisables se trouvent dans `public/branding/` : `impulsion.svg` (noir), `impulsion-accent.svg` (noir avec accent sauge) et `impulsion-light.svg` (blanc avec accent sauge). Le favicon `public/favicon.svg` reprend la silhouette sur un fond sombre.

Le footer affiche `PROFILE.email` comme lien `mailto:` et les profils LinkedIn/GitHub renseignés dans `SOCIAL_PROFILES`. Les réseaux utilisent des icônes avec un libellé accessible et s’ouvrent dans un nouvel onglet avec `noopener noreferrer`. Un profil non renseigné n’affiche pas de lien.

Les réseaux professionnels utilisent le composant partagé `SocialLinks` dans le footer (icônes seules), À propos, Contact et les réponses du chat liées au contact. Les URL restent définies à un seul endroit, `SOCIAL_PROFILES`, et chaque icône conserve son libellé accessible et l’ouverture sécurisée dans un nouvel onglet.

## Chargement différé et livraison de production

Le bureau reste dans le chargement initial. Un bloc Angular `@defer (on immediate)` est créé dans chaque fenêtre à son ouverture et charge alors `WindowContent` et ses dépendances. L’état de chargement apparaît après 150 ms ; un message permet de comprendre un échec de téléchargement. Réduire une fenêtre ne détruit pas le composant : les filtres et le contenu restent présents.

Les styles du bureau sont répartis entre structure, raccourcis, dock et interactions ; ceux du contenu séparent les éléments communs du profil et des expériences. Tous gardent l’encapsulation Angular du composant. Les règles devenues inutilisées pour l’ancien sous-titre du hero ont été supprimées.

La compilation produit une application statique. Le script de build génère les URL de référencement à partir de `SITE_URL`, ainsi que le sitemap et `robots.txt`. Docker compile avec Node, puis copie uniquement le résultat dans une petite image Nginx. Traefik reçoit le trafic HTTPS et transmet la requête à Nginx sur le réseau Docker partagé.

Le [guide de déploiement](deploiement.md) décrit les commandes et les variables de déploiement. Le [rapport de performances](performance.md) distingue la taille brute, l’estimation Angular et la mesure gzip locale.

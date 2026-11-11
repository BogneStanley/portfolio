# Performances et validation de production

## Chargement initial

Mesures du build de production Angular, avant optimisation et après compilation dans Docker avec chargement différé du contenu des dossiers :

| Mesure                                   |                 Avant |                             Après |
| ---------------------------------------- | --------------------: | --------------------------------: |
| Bundle initial brut                      |             509,59 Ko |                         414,33 Ko |
| Transfert estimé par Angular             |             136,28 Ko |                         118,94 Ko |
| Contenu des dossiers chargé à la demande | inclus dans l’initial | 106,48 Ko brut / 25,56 Ko estimés |

Le conteneur Nginx local a transféré **134 749 octets avec gzip** pour les JS/CSS initiaux, contre 414 328 octets bruts. Cette mesure HTTP est distincte de l’estimation Angular ci-dessus. L’image Docker finale mesure 27 140 045 octets (environ 27 Mo).

La réduction du chargement initial brut est d’environ 19 %. Les estimations Angular ne sont pas des mesures réseau ou un score Lighthouse. Les valeurs peuvent varier avec les évolutions du code.

Le bloc `@defer (on immediate)` est créé uniquement lorsqu’une fenêtre est ouverte. Angular charge alors le composant et ses dépendances, affiche un état de chargement si nécessaire et un message en cas d’échec. Le premier dossier paie le coût de téléchargement du chunk ; les suivants réutilisent le module. Les fenêtres réduites restent montées afin de conserver leurs filtres et leur état.

Les budgets de compilation n’ont pas été relevés. Le budget initial de 500 Ko est respecté. Les styles sont organisés par responsabilité (bureau, raccourcis, dock, interactions, contenus et profil) ; les anciennes règles de titre d’introduction devenues inutilisées ont été supprimées. Les feuilles respectent le seuil de 4 Ko par fichier compilé.

## Livraison HTTP

Nginx active gzip pour les ressources textuelles. Les captures WebP et les SVG sont servis localement ; les images des projets restent chargées paresseusement avec `NgOptimizedImage`.

- Bundles JS/CSS avec empreinte Angular : `public, max-age=31536000, immutable`.
- Autres ressources statiques : `public, max-age=3600`.
- HTML, sitemap et robots : `no-cache` pour revalidation.
- Ressources inexistantes : HTTP 404, sans faux document HTML.
- Navigation cliente : repli sur `index.html`.

Les icônes flottantes restent masquées sur les petits écrans et respectent la réduction des animations. Elles n’occupent pas la navigation clavier.

## Validation

Le conteneur a été vérifié sur ordinateur et à 390 × 844 : ouverture des 15 projets à la demande, dock masqué sur mobile, absence de débordement horizontal, ouverture de l’assistant et retour au bureau. Aucune erreur console n’a été relevée lors de cette vérification. Le contrôle de santé Docker est passé à `healthy`.

Le script `scripts/check-http.mjs` vérifie les réponses du conteneur : état de santé, HTML, métadonnées, image PNG, gzip, cache différencié, conservation des en-têtes, 404 des ressources manquantes et repli de navigation Angular. Il peut être relancé avec `node scripts/check-http.mjs http://localhost:8080`.

La CI vérifie les tests Angular, les tests de génération SEO, le build de production et le conteneur Nginx. Le domaine, les URL de partage, les données structurées et le sitemap sont générés ensemble pour éviter les liens contradictoires.

À mesurer après mise en ligne sur le domaine réel : Lighthouse mobile, cache chaud/froid, LCP, CLS et INP. La latence du serveur et de Traefik ne peut pas être évaluée à partir du seul build local. Aucun score Lighthouse de production n’est revendiqué.

## Références

- Chargement différé Angular : https://angular.dev/guide/templates/defer
- Images Docker multi-étapes : https://docs.docker.com/build/building/multi-stage/
- Labels Traefik Docker : https://doc.traefik.io/traefik/reference/routing-configuration/other-providers/docker/

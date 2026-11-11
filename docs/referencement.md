# Référencement et livraison HTTP

- Le contenu des dossiers est chargé dans un chunk séparé à leur première ouverture. Réduire ou restaurer une fenêtre conserve son contenu et ses filtres.
- Nginx compresse JS, CSS, SVG, JSON et XML avec gzip. Les bundles Angular avec empreinte sont mis en cache un an ; les visuels une heure. Le HTML est revalidé à chaque visite pour récupérer les nouveaux noms de bundles.
- Un fichier statique absent renvoie 404 ; une URL de navigation Angular retombe sur `index.html`.
- Le HTML contient les métadonnées de partage, une URL canonique et des données structurées `ProfilePage` / `Person`. L’image de partage `public/social-preview.png` mesure 1200 × 630 ; son original vectoriel est `public/social-preview.svg`.
- Il n’y a pas de prérendu serveur : les robots qui exécutent JavaScript peuvent lire le contenu de l’application. Les métadonnées de partage sont disponibles immédiatement dans le HTML.

Les mesures et limites sont documentées dans [docs/performance.md](performance.md). Les sources des projets sont dans [docs/project-sources.md](project-sources.md).

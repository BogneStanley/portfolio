# Portfolio de Bogne Stanley

Portfolio Angular 22 et GSAP : bureau interactif, fenêtres redimensionnables, ancrage, projets filtrables, assistant local et personnalisation. Le bureau mobile affiche un seul dossier à la fois.

## Développement

Node.js 24 et npm sont nécessaires. Les dépendances sont verrouillées dans `package-lock.json`.

```sh
npm ci
npm start
```

Le serveur est accessible sur `http://localhost:4200`. Les contenus sont dans `src/app/data/portfolio.ts` ; les captures et couvertures sont dans `public/projects`. Le guide pédagogique se trouve dans [docs/guide-portfolio.md](docs/guide-portfolio.md).

## Validation et build

```sh
npm test -- --watch=false
npm run test:seo
npm run build
```

Le résultat statique est dans `dist/portfolio/browser`. Le build génère `robots.txt` et `sitemap.xml`, et adapte les URL canonique, Open Graph et JSON-LD à `SITE_URL`. Le domaine par défaut est `https://stanley-bogne.me` ; remplacez-le avant publication si nécessaire :

```sh
SITE_URL=https://portfolio.example.com npm run build
```

`SITE_URL` doit être une origine HTTPS sans chemin. Le code source reste inchangé. Le portfolio est une application cliente : Nginx sert les fichiers statiques, sans serveur Node en production.

## Déploiement Docker avec Traefik

La configuration utilise **le Traefik déjà présent sur le serveur**. Il doit avoir le provider Docker activé, un point d’entrée HTTPS et un résolveur de certificats configuré. Le domaine doit pointer vers le serveur et le réseau Docker partagé doit déjà exister.

```sh
cp .env.example .env
```

Renseignez dans `.env` :

- `DOMAIN` : domaine seul, sans `https://`, ni chemin. Il sert aussi à générer les URL SEO.
- `TRAEFIK_NETWORK` : nom exact du réseau Docker auquel Traefik est connecté.
- `TRAEFIK_ENTRYPOINT` : nom du point d’entrée HTTPS, généralement `websecure`.
- `TRAEFIK_CERTRESOLVER` : nom exact de votre résolveur de certificats, par exemple `letsencrypt` ou `le`.
- `IMAGE_TAG` : étiquette locale de l’image, par défaut `local`.

Sur le serveur, depuis le dossier du dépôt :

Vérifiez que le réseau existe avec `docker network inspect traefik`, en remplaçant `traefik` par le nom renseigné dans `.env`. Le fichier `.env` est lu directement par Compose.

```sh
docker compose config --quiet
docker compose up -d --build
docker compose ps
docker compose logs --tail=100 portfolio
```

Le seul service ajouté est `portfolio`. Aucun port n’est publié sur l’hôte : Traefik joint Nginx sur le port interne **80**, via le réseau externe. Traefik termine le TLS ; Nginx sert le contenu en HTTP sur ce réseau. Le nom des routeur et service Traefik est `portfolio` : changez ces labels si ce nom est déjà utilisé sur votre serveur.

Si votre Traefik utilise des certificats préchargés plutôt qu’un résolveur ACME, retirez le label `tls.certresolver` du Compose et la variable correspondante. La redirection HTTP vers HTTPS reste gérée par votre Traefik existant.

### Mise à jour

Après récupération des changements sur le serveur :

```sh
docker compose up -d --build
```

Une modification de `DOMAIN` nécessite également un rebuild, puisque les métadonnées SEO sont intégrées à la compilation. Aucun secret n’est nécessaire dans l’application cliente.

### Vérification locale sans Traefik

```sh
docker build -t portfolio:local .
docker run --rm -p 127.0.0.1:8080:80 portfolio:local
```

Ouvrez `http://localhost:8080`. Les métadonnées restent celles du domaine configuré à la compilation. Pour essayer un autre domaine :

```sh
docker build --build-arg SITE_URL=https://portfolio.example.com -t portfolio:local .
```

L’image finale contient Nginx et les fichiers compilés, sans Node, npm ou sources TypeScript. Le contrôle de santé utilise `/healthz`.

## Performances et référencement

- Le contenu des dossiers est chargé dans un chunk séparé à leur première ouverture. Réduire ou restaurer une fenêtre conserve son contenu et ses filtres.
- Nginx compresse JS, CSS, SVG, JSON et XML avec gzip. Les bundles Angular avec empreinte sont mis en cache un an ; les visuels une heure. Le HTML est revalidé à chaque visite pour récupérer les nouveaux noms de bundles.
- Un fichier statique absent renvoie 404 ; une URL de navigation Angular retombe sur `index.html`.
- Le HTML contient les métadonnées de partage, une URL canonique et des données structurées `ProfilePage` / `Person`. L’image de partage `public/social-preview.png` mesure 1200 × 630 ; son original vectoriel est `public/social-preview.svg`.
- Il n’y a pas de prérendu serveur : les robots qui exécutent JavaScript peuvent lire le contenu de l’application. Les métadonnées de partage sont disponibles immédiatement dans le HTML.

Les mesures et limites sont documentées dans [docs/performance.md](docs/performance.md). Les sources des projets sont dans [docs/project-sources.md](docs/project-sources.md).

## CI/CD GitHub Actions

Le workflow `.github/workflows/ci.yml` teste les pull requests vers `main`. Après chaque push sur `main`, il exécute les tests Angular, SEO et de déploiement, compile le portfolio, valide Compose et teste Nginx dans Docker. Si tout passe, il déploie cette révision sur le serveur via SSH. Les exécutions sur `main` sont sérialisées pour ne pas interrompre un déploiement en cours ; GitHub peut remplacer une exécution encore en attente par un push plus récent.

### Configuration initiale du serveur

Le compte SSH doit disposer de Bash, de `tar`, de Docker et de Docker Compose v2 avec `up --wait`, ainsi que des droits Docker et d’écriture sur le dossier de déploiement. Le serveur doit pouvoir télécharger les images Docker et les dépendances npm. Traefik et son réseau doivent déjà fonctionner.

Exemple de préparation, à adapter :

```sh
mkdir -p /opt/portfolio
# Copier .env.example dans /opt/portfolio/.env, puis renseigner les valeurs réelles.
chmod 600 /opt/portfolio/.env
```

Conserver `.env` à la racine du dossier de déploiement. Il n’est jamais envoyé depuis GitHub ni ajouté aux archives. La variable `DOMAIN` détermine aussi les URL SEO lors du build sur le serveur. Le projet Compose porte le nom fixe `portfolio`.

### Secrets GitHub

Dans **Settings → Environments → production**, créer les secrets suivants (ou les définir dans les secrets Actions du dépôt) :

| Secret            | Valeur                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SSH_HOST`        | Nom DNS ou IPv4 du serveur, sans protocole                                                                                                              |
| `SSH_USER`        | Utilisateur SSH autorisé à lancer Docker                                                                                                                |
| `SSH_PORT`        | Port SSH, facultatif : `22` par défaut                                                                                                                  |
| `SSH_PRIVATE_KEY` | Clé privée dédiée au déploiement, sans phrase secrète ; sa clé publique doit être autorisée sur le serveur                                              |
| `SSH_KNOWN_HOSTS` | Entrée `known_hosts` du serveur, dont l’empreinte a été vérifiée par un canal de confiance ; pour un port non standard, utiliser la forme `[hôte]:port` |
| `DEPLOY_PATH`     | Dossier absolu préparé sur le serveur, par exemple `/opt/portfolio`, sans espace ni slash final                                                         |

L’environnement `production` ne doit pas imposer d’approbation manuelle si le déploiement doit être entièrement automatique. Aucun jeton GitHub de déploiement ni accès Git au dépôt depuis le serveur n’est nécessaire : le runner transmet une archive de la révision exacte validée.

### Livraison et retour arrière

Les sources arrivent dans `releases/<SHA>`. Le script `scripts/deploy.sh` compile une image `portfolio:<SHA>`, puis exécute Compose avec le `.env` partagé. L’ancienne version continue de tourner pendant la compilation. Une fois le conteneur sain, le lien `current` pointe vers cette livraison.

Si le build échoue, la version en cours reste intacte. Si le redémarrage échoue, le script tente de relancer l’image de la livraison précédente, puis laisse le workflow en échec pour signaler le problème. Au premier déploiement, aucune livraison précédente n’est disponible. Un échec du retour arrière demande une intervention manuelle ; l’état du conteneur n’atteste pas à lui seul du bon fonctionnement du routage TLS de Traefik.

Les anciennes livraisons et images sont conservées pour permettre ce retour arrière. Prévoir leur nettoyage périodique en gardant la livraison courante et la précédente.

Les scripts se testent localement sans accès au serveur :

```sh
npm run test:deploy
```

Ces tests simulent Docker et vérifient le succès, l’échec du build et le retour arrière après échec de santé. Le workflow ne pourra tourner qu’une fois ces fichiers commités et poussés dans un dépôt GitHub avec les secrets configurés.

# Développement et validation

Node.js 24 et npm sont nécessaires. Les dépendances sont verrouillées dans `package-lock.json`.

```sh
npm ci
npm start
```

Le serveur est accessible sur `http://localhost:4200`. Les contenus sont dans `src/app/data/portfolio.ts` ; les captures et couvertures sont dans `public/projects`. Le guide pédagogique se trouve dans [docs/guide-portfolio.md](guide-portfolio.md).

## Validation et build

```sh
npm test -- --watch=false
npm run test:seo
npm run test:deploy
npm run build
```

Le résultat statique est dans `dist/portfolio/browser`. Le build génère `robots.txt` et `sitemap.xml`, et adapte les URL canonique, Open Graph et JSON-LD à `SITE_URL`. Le domaine par défaut est `https://stanley-bogne.me` ; remplacez-le avant publication si nécessaire :

```sh
SITE_URL=https://portfolio.example.com npm run build
```

`SITE_URL` doit être une origine HTTPS sans chemin. Le code source reste inchangé. Le portfolio est une application cliente : Nginx sert les fichiers statiques, sans serveur Node en production.

Les commandes sont exécutées depuis la racine du dépôt. Le [guide pédagogique](guide-portfolio.md) détaille les composants et les interactions.

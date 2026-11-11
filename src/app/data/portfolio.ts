// Profil et contenus du portfolio.
export type WindowId =
  'projects' | 'about' | 'skills' | 'experiences' | 'contact' | 'settings' | 'chat';
export type WindowStatus = 'closed' | 'open' | 'minimized';
export type ProjectCategory = 'web' | 'backend' | 'mobile' | 'package' | 'media' | 'learning';
export type ProjectFilter = 'all' | ProjectCategory;
export const SOCIAL_PROFILES: Partial<Record<'linkedin' | 'github', string>> = {
  linkedin: 'https://www.linkedin.com/in/stanley-bogne-moafo-160bb61a8/',
  github: 'https://github.com/BogneStanley',
};
export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  category: ProjectCategory;
  image: string;
  number: string;
  topics: string[];
  links?: { label: string; url: string }[];
  screenshot?: { src: string; kind: 'mobile' | 'web'; alt: string; cropTop?: number };
}
export const PROFILE = {
  name: 'Bogne Stanley',
  fullName: 'Bogne Stanley',
  role: 'Ingénieur logiciel',
  email: 'stanley.moafo@gmail.com',
  phone: '+237 6 55 11 95 02',
  phoneHref: '+237655119502',
  location: 'Yaoundé, Cameroun',
  mobility: 'Mobile internationalement',
  cv: '/cv-bogne-stanley.pdf',
  introduction: 'Des applications web et mobiles, de la conception à la mise en production.',
  biography:
    'Ingénieur logiciel spécialisé en Java, Spring Boot, Angular et Flutter, je conçois des applications web et mobiles et leurs services backend. Mon expérience couvre les paiements, l’épargne collaborative, la mobilité et les plateformes de services. J’interviens aussi sur l’architecture, la sécurité, le déploiement et la formation des équipes.',
  languages: ['Français · natif', 'Anglais · B1'],
  qualities: ['Autonome', 'Autodidacte', 'Proactif', 'Travail en équipe', 'Flexible'],
  interests: ['Entrepreneuriat', 'Échecs', 'Lecture'],
  community:
    'Encadrement en développement Java et Flutter au sein du club informatique de SUP’PTIC.',
};
export const APPLICATIONS: { id: WindowId; label: string; short: string; file: string }[] = [
  { id: 'projects', label: 'Projets', short: 'Explorer', file: 'projets.dossier' },
  { id: 'about', label: 'À propos', short: 'Découvrir', file: 'à-propos.txt' },
  { id: 'skills', label: 'Compétences', short: 'Construire', file: 'compétences.app' },
  { id: 'experiences', label: 'Expériences', short: 'Parcourir', file: 'expériences.dossier' },
  { id: 'contact', label: 'Contact', short: 'Échanger', file: 'contact.mail' },
  { id: 'chat', label: 'Assistant', short: 'Discuter', file: 'assistant.local' },
  { id: 'settings', label: 'Paramètres', short: 'Personnaliser', file: 'paramètres.app' },
];
export const PROJECTS: Project[] = [
  {
    id: 'freemopay',
    title: 'FreemoPay',
    description:
      'Application de tontine et d’épargne collective : centralisation des cotisations, suivi des contributions et bilans de groupe. Conception et développement mobile et backend chez Freemo.',
    technologies: ['Flutter', 'Spring Boot'],
    topics: ['Tontines', 'Épargne collective', 'Suivi des cotisations'],
    category: 'mobile',
    image: '/projects/freemopay.svg',
    links: [
      {
        label: 'Google Play',
        url: 'https://play.google.com/store/apps/details?id=com.freemopay.freemoapp',
      },
    ],
    screenshot: {
      src: '/projects/screens/freemopay.webp',
      kind: 'mobile',
      alt: 'Capture de l’application Freemopay publiée sur Google Play',
    },
    number: '01',
  },
  {
    id: 'mokaa',
    title: 'Mokaa',
    description:
      'Application de cartes de paiement virtuelles pour les achats en ligne. Elle permet de créer, recharger via Mobile Money, bloquer et débloquer ses cartes, puis de suivre ses opérations. Développement de l’application Flutter.',
    technologies: ['Flutter'],
    topics: ['Cartes virtuelles', 'Paiement en ligne', 'Mobile Money'],
    category: 'mobile',
    image: '/projects/mokaa.svg',
    links: [
      {
        label: 'Google Play',
        url: 'https://play.google.com/store/apps/details?id=cm.freemo.mokaa.mokaa',
      },
    ],
    screenshot: {
      src: '/projects/screens/mokaa.webp',
      kind: 'mobile',
      alt: 'Capture de l’application Mokaa publiée sur Google Play',
    },
    number: '02',
  },
  {
    id: 'kusa',
    title: 'Kusa',
    description:
      'Migration d’une API de paiement de NestJS vers Spring Boot. Reprise du backend pour faciliter sa maintenance et accompagner son évolution, en conservant le paiement comme cœur métier.',
    technologies: ['NestJS', 'Spring Boot'],
    topics: ['Paiements', 'Migration backend', 'API'],
    category: 'backend',
    image: '/projects/kusa.svg',
    number: '03',
  },
  {
    id: 'metoua',
    title: 'Metoua',
    description:
      'Service de mobilité réunissant taxi à la demande et covoiturage. Lead développement mobile et backend : choix techniques et réalisation des fonctionnalités de l’application.',
    technologies: ['Flutter', 'Spring Boot'],
    topics: ['Mobilité', 'Taxi à la demande', 'Covoiturage'],
    category: 'mobile',
    image: '/projects/metoua.svg',
    number: '04',
  },
  {
    id: 'toupesu',
    title: 'Toupesu',
    description:
      'Application de tontines permettant de créer des groupes, cotiser et suivre les transactions à distance. Le projet intègre aussi l’échange de devises. Conception, développement Flutter et déploiement.',
    technologies: ['Flutter'],
    topics: ['Tontines', 'Cotisations à distance', 'Change de devises'],
    category: 'mobile',
    image: '/projects/toupesu.svg',
    links: [
      {
        label: 'Google Play',
        url: 'https://play.google.com/store/apps/details?id=com.toupesu.toupesu',
      },
    ],
    screenshot: {
      src: '/projects/screens/toupesu.webp',
      kind: 'mobile',
      alt: 'Capture de l’application Toupesu publiée sur Google Play',
    },
    number: '05',
  },
  {
    id: 'afrolancer',
    title: 'Afrolancer',
    description:
      'Plateforme reliant freelances et clients autour de prestations de services. Conception et développement des interfaces Angular pour le parcours web de mise en relation.',
    technologies: ['Angular'],
    topics: ['Freelance', 'Mise en relation', 'Interfaces web'],
    category: 'web',
    image: '/projects/afrolancer.svg',
    number: '06',
  },
  {
    id: 'get-typed-router',
    title: 'Get Typed Router',
    description:
      'Générateur de routes pour Flutter et GetX : des annotations sur les pages produisent un routeur et des arguments typés. Son outil en ligne de commande évite de maintenir manuellement les listes de routes.',
    technologies: ['Flutter', 'GetX'],
    topics: ['Navigation typée', 'Génération de code', 'Outils développeur'],
    category: 'package',
    image: '/projects/get-typed-router.svg',
    screenshot: {
      src: '/projects/screens/get-typed-router.webp',
      kind: 'web',
      alt: 'Page officielle du package Get Typed Router sur pub.dev',
    },
    links: [{ label: 'Voir sur pub.dev', url: 'https://pub.dev/packages/get_typed_router' }],
    number: '07',
  },
  {
    id: 'form-validator-x',
    title: 'Form Validator X',
    description:
      'Bibliothèque de validation de formulaires Flutter fondée sur des règles composables : champs requis, e-mails, dates, nombres et motifs. Messages personnalisables et règles extensibles, sans dépendance externe hors Flutter.',
    technologies: ['Flutter'],
    topics: ['Formulaires', 'Validation composable', 'Règles personnalisées'],
    category: 'package',
    image: '/projects/form-validator-x.svg',
    screenshot: {
      src: '/projects/screens/form-validator-x.webp',
      kind: 'web',
      alt: 'Page officielle du package Form Validator X sur pub.dev',
    },
    links: [{ label: 'Voir sur pub.dev', url: 'https://pub.dev/packages/form_validator_x' }],
    number: '08',
  },
  {
    id: 'dev-talk',
    title: 'The Dev Talk Show CMR',
    description:
      'Podcast de conversations sur les parcours et les métiers de la tech au Cameroun et en Afrique : ingénierie logicielle, entrepreneuriat, freelance et place des femmes dans la tech. Participation à l’animation, au montage et au design.',
    technologies: [],
    topics: ['Tech en Afrique', 'Parcours professionnels', 'Entretiens'],
    category: 'media',
    image: '/projects/dev-talk.svg',
    screenshot: {
      src: '/projects/screens/dev-talk.webp',
      kind: 'web',
      alt: 'Chaîne YouTube The Dev Talk Show Camer et ses épisodes',
    },
    links: [{ label: 'Voir la chaîne YouTube', url: 'https://www.youtube.com/@TheDevTalkShowCMR' }],
    number: '09',
  },
  {
    id: 'lehiboo',
    title: 'Le Hiboo Experiences',
    description:
      'Plateforme de sorties et de billetterie locale pour découvrir et réserver concerts, spectacles ou ateliers. Côté organisateurs, elle rassemble publication des événements, réservations, billets et statistiques.',
    technologies: [],
    topics: ['Événementiel', 'Billetterie', 'Réservation en ligne'],
    category: 'web',
    links: [
      {
        label: 'Voir le site',
        url: 'https://lehiboo.com/fr',
      },
    ],
    screenshot: {
      src: '/projects/screens/lehiboo.webp',
      kind: 'web',
      alt: 'Capture du site Le Hiboo Experiences',
    },
    image: '/projects/lehiboo.svg',
    number: '10',
  },
  {
    id: 'smalldeals',
    title: 'SmallDeals',
    description:
      'Marketplace mobile dédiée au commerce au Cameroun. Elle réunit des produits et des boutiques dans un même catalogue, avec commande depuis le téléphone, offres promotionnelles et livraison.',
    technologies: [],
    topics: ['E-commerce', 'Marketplace', 'Commerce local'],
    category: 'mobile',
    links: [
      {
        label: 'Google Play',
        url: 'https://play.google.com/store/apps/details?id=cm.viaziza.smalldeals',
      },
    ],
    screenshot: {
      src: '/projects/screens/smalldeals.webp',
      kind: 'mobile',
      alt: 'Visuel de SmallDeals publié sur Google Play',
    },
    image: '/projects/smalldeals.svg',
    number: '11',
  },
  {
    id: 'badgee',
    title: 'Badgee',
    description:
      'Outil de coordination des agences et de leurs équipes terrain : planning des missions, consignes, formulaires et preuves d’intervention. Les agents indépendants peuvent aussi consulter les missions proposées et y candidater.',
    technologies: [],
    topics: ['Gestion d’agence', 'Équipes terrain', 'Suivi des missions'],
    category: 'mobile',
    links: [
      {
        label: 'Google Play',
        url: 'https://play.google.com/store/apps/details?id=com.dilios.badgee',
      },
    ],
    screenshot: {
      src: '/projects/screens/badgee.webp',
      kind: 'mobile',
      alt: 'Capture de Badgee publiée sur Google Play',
    },
    image: '/projects/badgee.svg',
    number: '12',
  },
  {
    id: 'bluedata',
    title: 'Blue Data',
    description:
      'Service web de recharge de forfaits internet et de crédit Blue Camtel. L’utilisateur choisit une offre, renseigne le numéro bénéficiaire, paie par Mobile Money et suit la recharge pour lui-même ou un proche.',
    technologies: [],
    topics: ['Télécoms', 'Recharge Blue Camtel', 'Mobile Money'],
    category: 'web',
    links: [
      {
        label: 'Voir le site',
        url: 'https://bluedata.stanley-bogne.me/',
      },
    ],
    screenshot: {
      src: '/projects/screens/bluedata.webp',
      cropTop: 6,
      kind: 'web',
      alt: 'Capture du site Blue Data',
    },
    image: '/projects/bluedata.svg',
    number: '13',
  },
  {
    id: 'cours-flutter',
    title: 'Cours Flutter · ITNovation',
    description:
      'Cours vidéo Flutter créés pour ITNovation, regroupés dans une playlist YouTube. Une ressource pédagogique consacrée au développement d’applications mobiles et à la prise en main de Flutter.',
    technologies: ['Flutter'],
    topics: ['Pédagogie', 'Développement mobile', 'ITNovation'],
    category: 'learning',
    links: [
      {
        label: 'Regarder les cours',
        url: 'https://www.youtube.com/playlist?list=PLdd3zDEEGtnX6GrUT9bKg0YfZw2hp00-z',
      },
    ],
    image: '/projects/cours-flutter.svg',
    number: '14',
  },
  {
    id: 'cours-figma',
    title: 'Cours Figma · ITNovation',
    description:
      'Cours vidéo Figma créés pour ITNovation et réunis dans une playlist YouTube. Une ressource pédagogique dédiée au design d’interfaces et à la prise en main de l’outil.',
    technologies: ['Figma'],
    topics: ['Pédagogie', 'Design d’interfaces', 'ITNovation'],
    category: 'learning',
    links: [
      {
        label: 'Regarder les cours',
        url: 'https://www.youtube.com/playlist?list=PLdd3zDEEGtnV0qOlqu__Qa3cqSUpIXZy4',
      },
    ],
    image: '/projects/cours-figma.svg',
    number: '15',
  },
];
export const SKILLS = [
  {
    number: '01',
    title: 'Web & backend',
    description: 'Développer des interfaces web et les services qui les accompagnent.',
    items: ['Java', 'Spring Boot', 'Angular', 'API REST', 'PostgreSQL'],
  },
  {
    number: '02',
    title: 'Mobile & design',
    description: 'Concevoir des applications mobiles et des interfaces cohérentes.',
    items: ['Flutter', 'BLoC', 'Riverpod', 'Figma', 'Design systems'],
  },
  {
    number: '03',
    title: 'DevOps & déploiement',
    description: 'Automatiser les livraisons et suivre les applications en production.',
    items: ['Docker', 'Git', 'GitHub Actions', 'CI/CD', 'Sentry'],
  },
  {
    number: '04',
    title: 'Architecture & méthode',
    description: 'Structurer le code, documenter les choix et travailler en équipe.',
    items: ['Clean Architecture', 'Architecture hexagonale', 'Agile', 'Documentation technique'],
  },
  {
    number: '05',
    title: 'IA & développement assisté',
    description: 'Intégrer l’IA au développement et à la conception d’applications.',
    items: ['Codex', 'Claude Code', 'Cursor', 'LangChain'],
  },
];
export interface Experience {
  id: string;
  period: string;
  role: string;
  organization: string;
  location: string;
  description: string;
  highlights: string[];
  technologies: string[];
}
export const EXPERIENCES: Experience[] = [
  {
    id: 'freemo',
    period: 'Septembre 2025 — présent',
    role: 'Associé · Développeur logiciel',
    organization: 'Freemo',
    location: 'Yaoundé · Efoulan, Cameroun',
    description: 'Conception et développement de produits mobiles et de services de paiement.',
    highlights: [
      'Conception et développement de FreemoPay, une application de tontine et d’épargne collaborative.',
      'Développement de Mokaa pour la gestion de cartes de crédit virtuelles.',
      'Migration de l’API de paiement Kusa de NestJS vers Spring Boot.',
    ],
    technologies: ['Flutter', 'Spring Boot', 'NestJS'],
  },
  {
    id: 'sdk-games-afrika',
    period: 'Février 2024 — mai 2025',
    role: 'Développeur logiciel',
    organization: 'SDK Games Afrika',
    location: 'Bangangté, Cameroun',
    description:
      'Développement d’applications de mobilité, de finance et de mise en relation, ainsi que d’extensions métier.',
    highlights: [
      'Lead développeur de Metoua : taxi à la demande, covoiturage, choix techniques et développement mobile et backend.',
      'Conception, développement et déploiement de Toupesu, une application de tontines et d’échange de devises.',
      'Conception et implémentation des interfaces Angular d’Afrolancer.',
      'Création de plugins et extensions pour Jira et Odoo.',
    ],
    technologies: ['Flutter', 'Spring Boot', 'Angular', 'Java', 'Python', 'OWL'],
  },
  {
    id: 'itnovation',
    period: 'Avril 2022 — janvier 2024',
    role: 'Consultant IT · Formateur',
    organization: 'ITNovation',
    location: 'Yaoundé · Nsimeyon, Cameroun',
    description:
      'Développement et maintenance d’applications clientes et internes, optimisation des services et accompagnement des équipes.',
    highlights: [
      'Lead développeur de LeCatho : choix techniques, architecture et fonctionnalités.',
      'Mise en place et optimisation de pipelines CI/CD pour réduire les coûts et accélérer les mises en production.',
      'Définition de politiques de sécurité et de stratégies de montée en charge.',
      'Optimisation des architectures et services backend pour améliorer les performances et la disponibilité.',
      'Pilotage de la migration de MongoDB vers PostgreSQL.',
      'Formation des équipes en développement mobile et design d’interfaces.',
      'Création de cours Flutter et Figma diffusés sur YouTube pour ITNovation.',
    ],
    technologies: ['CI/CD', 'MongoDB', 'PostgreSQL', 'Sécurité', 'Architecture'],
  },
];
export const EDUCATION = [
  {
    period: '2021 — 2023',
    degree: 'Ingénieur de télécommunications',
    specialization: 'Sécurité des réseaux et systèmes',
    school: 'École nationale des postes et télécommunications et des TIC',
    location: 'Yaoundé, Cameroun',
  },
  {
    period: '2018 — 2021',
    degree: 'Ingénieur des travaux de télécoms',
    specialization: 'Informatique et réseaux',
    school: 'École nationale des postes et télécommunications et des TIC',
    location: 'Yaoundé, Cameroun',
  },
];

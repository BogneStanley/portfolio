// Profil et contenus du portfolio.
export type WindowId =
  'projects' | 'about' | 'skills' | 'experiences' | 'contact' | 'settings' | 'chat';
export type WindowStatus = 'closed' | 'open' | 'minimized';
export type ProjectCategory = 'frontend' | 'backend' | 'mobile' | 'package' | 'media';
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
}
export const PROFILE = {
  name: 'Bogne Stanley',
  fullName: 'Bogne Moafo Diderot Stanley',
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
      'Application de tontine et d’épargne collaborative, conçue et développée chez Freemo avec Flutter et Spring Boot.',
    technologies: ['Flutter', 'Spring Boot'],
    category: 'mobile',
    image: '/projects/freemopay.svg',
    number: '01',
  },
  {
    id: 'mokaa',
    title: 'Mokaa',
    description:
      'Application de gestion de cartes de crédit virtuelles, développée avec Flutter avec une attention portée à la fiabilité et à l’expérience utilisateur.',
    technologies: ['Flutter'],
    category: 'mobile',
    image: '/projects/mokaa.svg',
    number: '02',
  },
  {
    id: 'kusa',
    title: 'Kusa',
    description:
      'Migration de l’API de paiement de NestJS vers Spring Boot pour améliorer la maintenabilité, la robustesse et l’évolutivité du backend.',
    technologies: ['NestJS', 'Spring Boot'],
    category: 'backend',
    image: '/projects/kusa.svg',
    number: '03',
  },
  {
    id: 'metoua',
    title: 'Metoua',
    description:
      'Application de mobilité intégrant taxi à la demande et covoiturage. Lead développement mobile et backend, et pilotage des choix techniques.',
    technologies: ['Flutter', 'Spring Boot'],
    category: 'mobile',
    image: '/projects/metoua.svg',
    number: '04',
  },
  {
    id: 'toupesu',
    title: 'Toupesu',
    description:
      'Application de gestion de tontines et d’échange de devises, de la conception technique au développement et au déploiement.',
    technologies: ['Flutter'],
    category: 'mobile',
    image: '/projects/toupesu.svg',
    number: '05',
  },
  {
    id: 'afrolancer',
    title: 'Afrolancer',
    description:
      'Plateforme de mise en relation entre freelances et clients, avec conception et implémentation des interfaces web.',
    technologies: ['Angular'],
    category: 'frontend',
    image: '/projects/afrolancer.svg',
    number: '06',
  },
  {
    id: 'get-typed-router',
    title: 'Get Typed Router',
    description:
      'Package Flutter disponible sur pub.dev pour générer des routes fortement typées pour GetX à partir d’annotations et améliorer l’expérience développeur.',
    technologies: ['Flutter', 'GetX'],
    category: 'package',
    image: '/projects/get-typed-router.svg',
    number: '07',
  },
  {
    id: 'form-validator-x',
    title: 'Form Validator X',
    description:
      'Package Flutter flexible, modulaire et extensible pour définir des règles de validation réutilisables sur les champs de formulaire.',
    technologies: ['Flutter'],
    category: 'package',
    image: '/projects/form-validator-x.svg',
    number: '08',
  },
  {
    id: 'dev-talk',
    title: 'The Dev Talk Show CMR',
    description:
      'Podcast consacré à la tech en Afrique, du développement au management tech. Participation comme podcasteur, monteur et designer.',
    technologies: ['Podcast', 'Montage', 'Design'],
    category: 'media',
    image: '/projects/dev-talk.svg',
    number: '09',
  },
];
export const SKILLS = [
  {
    number: '01',
    title: 'Web & données',
    description: 'Construire des interfaces web, des API et des services intégrés.',
    items: [
      'Java',
      'Spring Boot',
      'Angular',
      'API REST',
      'MySQL',
      'PostgreSQL',
      'MongoDB',
      'Redis',
      'Amazon S3',
      'RustFS',
    ],
  },
  {
    number: '02',
    title: 'Mobile & design',
    description: 'Concevoir des applications iOS et Android fiables, cohérentes et accessibles.',
    items: [
      'Flutter',
      'BLoC',
      'GetX',
      'Riverpod',
      'Figma',
      'Design systems',
      'Secure Enclave / Keystore',
      'OWASP Mobile',
    ],
  },
  {
    number: '03',
    title: 'DevOps & déploiement',
    description:
      'Automatiser les livraisons, observer les services et sécuriser leur exploitation.',
    items: [
      'Docker',
      'Git',
      'GitHub Actions',
      'Shorebird',
      'Xcode Cloud',
      'Firebase Crashlytics',
      'Sentry',
      'Grafana',
      'k6',
      'Trivy',
      'SonarQube',
      'ClamAV',
      'Flavors',
      'Feature Flags',
      'Google Play Console',
      'App Store Connect',
      'VPS',
    ],
  },
  {
    number: '04',
    title: 'Architecture & méthode',
    description: 'Structurer les applications et accompagner leur évolution et les équipes.',
    items: [
      'Agile',
      'Clean Architecture',
      'Vertical Slice Architecture',
      'Architecture hexagonale',
      'MVC',
      'Documentation technique',
      'Recettage',
      'Documentation utilisateur',
      'Veille technologique',
    ],
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

// Données de démonstration : remplace ce fichier pour personnaliser le portfolio.
export type WindowId = 'projects' | 'about' | 'skills' | 'experiences' | 'contact';
export type WindowStatus = 'closed' | 'open' | 'minimized';
export type ProjectCategory = 'frontend' | 'backend';
export type ProjectFilter = 'all' | ProjectCategory;
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
  role: 'Développeur web',
  email: 'bonjour@example.com',
  introduction: 'Des idées aux interfaces. Du détail à l’expérience.',
  biography:
    'Je conçois des expériences web où la clarté, le mouvement et le soin du détail se rencontrent. Mon terrain de jeu : des interfaces intuitives, du code structuré et une touche d’inattendu.',
};
export const APPLICATIONS: { id: WindowId; label: string; short: string; file: string }[] = [
  { id: 'projects', label: 'Projets', short: 'Explorer', file: 'projets.dossier' },
  { id: 'about', label: 'À propos', short: 'Découvrir', file: 'à-propos.txt' },
  { id: 'skills', label: 'Compétences', short: 'Construire', file: 'compétences.app' },
  { id: 'experiences', label: 'Expériences', short: 'Parcourir', file: 'expériences.dossier' },
  { id: 'contact', label: 'Contact', short: 'Échanger', file: 'contact.mail' },
];
export const PROJECTS: Project[] = [
  {
    id: 'desktop',
    title: 'Portfolio Desktop',
    description:
      'Un espace personnel à explorer comme un bureau. Fenêtres, interactions et mouvements sur mesure.',
    technologies: ['Angular', 'GSAP', 'SCSS'],
    category: 'frontend',
    image: '/projects/desktop.svg',
    number: '01',
  },
  {
    id: 'studio',
    title: 'Forma Studio',
    description:
      'Une vitrine éditoriale pour un studio créatif. Une grille précise et une identité qui laisse respirer les images.',
    technologies: ['Angular', 'TypeScript', 'CSS Grid'],
    category: 'frontend',
    image: '/projects/studio.svg',
    number: '02',
  },
  {
    id: 'orbit',
    title: 'Orbit API',
    description:
      'Un service de gestion de projets : ressources structurées, authentification et documentation des endpoints.',
    technologies: ['Node.js', 'PostgreSQL', 'REST'],
    category: 'backend',
    image: '/projects/orbit.svg',
    number: '03',
  },
];
export const SKILLS = [
  {
    number: '01',
    title: 'Interfaces',
    description: 'Transformer une intention en une interface claire et responsive.',
    items: ['Angular', 'TypeScript', 'HTML sémantique', 'SCSS / CSS Grid'],
  },
  {
    number: '02',
    title: 'Interactions',
    description: 'Donner du rythme sans perdre la simplicité d’utilisation.',
    items: ['GSAP', 'Timelines', 'Micro-interactions', 'Design responsive'],
  },
  {
    number: '03',
    title: 'Développement',
    description: 'Construire des bases lisibles et des services bien organisés.',
    items: ['Git', 'API REST', 'Node.js', 'PostgreSQL'],
  },
];

export interface Experience {
  id: string;
  period: string;
  role: string;
  organization: string;
  description: string;
  highlights: string[];
  technologies: string[];
}
export const EXPERIENCES: Experience[] = [
  {
    id: 'atelier-pixel',
    period: '2025 — 2026',
    role: 'Développeur frontend',
    organization: 'Atelier Pixel',
    description:
      'Conception d’interfaces pour des produits numériques, du prototype aux composants réutilisables.',
    highlights: [
      'Création d’un tableau de bord responsive.',
      'Mise en place de composants et de transitions animées.',
    ],
    technologies: ['Angular', 'TypeScript', 'GSAP'],
  },
  {
    id: 'studio-forma',
    period: '2024 — 2025',
    role: 'Développeur web',
    organization: 'Studio Forma',
    description:
      'Participation à la réalisation de sites vitrines et d’expériences éditoriales pour un studio créatif.',
    highlights: [
      'Intégration de maquettes sur mobile et ordinateur.',
      'Amélioration de la lisibilité et de l’accessibilité des pages.',
    ],
    technologies: ['HTML', 'SCSS', 'JavaScript'],
  },
  {
    id: 'laboratoire',
    period: '2023 — 2024',
    role: 'Projets personnels & apprentissage',
    organization: 'Laboratoire web',
    description:
      'Exploration du développement web à travers des projets et des exercices pratiques.',
    highlights: [
      'Réalisation de petites applications interactives.',
      'Découverte des API REST et du versionnement.',
    ],
    technologies: ['Git', 'API REST', 'Node.js'],
  },
];

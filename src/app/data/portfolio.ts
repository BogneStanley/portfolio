// Données de démonstration : remplace ce fichier pour personnaliser le portfolio.
export type WindowId = 'projects' | 'about' | 'skills' | 'contact';
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

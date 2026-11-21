import type { Lane } from './tech'

export interface Social {
  id: 'github' | 'linkedin' | 'facebook' | 'instagram'
  label: string
  url: string
}

export interface Profile {
  name: string
  title: string[]
  about: string[]
  /** true while `about` is our stand-in text; flagged in dev builds only. */
  aboutIsPlaceholder: boolean
  photo: string
  /** Face crop for round crests: object-position and zoom. */
  photoFocus?: string
  photoZoom?: number
  socials: Social[]
  cvUrl?: string
  /** One main per lane, by tech id. Default: the most used tech of each lane (Core has no project data). */
  mains: Record<Lane, string>
}

export const profile: Profile = {
  name: 'Abdelmatine Sfar',
  title: ['Software Engineer', 'Full stack', 'Web & Mobile'],
  about: [
    'I build web and mobile products end to end: Next.js and React on the front, Spring Boot and NestJS on the back, PostgreSQL, Redis and Supabase for data, and React Native for mobile. The work below includes online stores, a meeting planner, a car marketplace and brand sites.',
  ],
  aboutIsPlaceholder: true,
  photo: '/assets/foto.jpg',
  photoFocus: '54% 32%',
  photoZoom: 1.6,
  socials: [
    { id: 'github', label: 'GitHub', url: 'https://github.com/abdelmatine' },
    { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/abdelmatine-sfar-91a853162/' },
    { id: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/abdou.sfar/' },
    { id: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/abdelmatine_sfar/' },
  ],
  mains: { frontend: 'nextjs', backend: 'spring-boot', data: 'postgresql', mobile: 'react-native', core: 'typescript' },
}

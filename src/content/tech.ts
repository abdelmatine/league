export type Lane = 'frontend' | 'backend' | 'data' | 'mobile' | 'core'

/** Logo rules per mark (docs/DECISIONS.md → Legal → Per-mark table):
 *  extrude: the logo may be recoloured and extruded in 3D; flat: the official logo, unaltered;
 *  name: no logo at all, the name or our own monogram only. Components never extrude a non-'extrude' mark. */
export type LogoPolicy = 'extrude' | 'flat' | 'name'

export interface Tech {
  id: string
  name: string
  lane: Lane
  /** Official logo file; absent for 'name' marks so it can't be shown by mistake. */
  logo?: string
  policy: LogoPolicy
  url: string
  blurb: string
  /** Credit line for the credits dialog, where the legal section gives one. */
  credit?: string
}

/** Lane labels, in display order. */
export const LANES: Record<Lane, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  data: 'Data',
  mobile: 'Mobile',
  core: 'Core',
}

const META = 'React and React Native are trademarks of Meta Platforms, Inc.'

export const tech: Tech[] = [
  { id: 'nextjs', name: 'Next.js', lane: 'frontend', logo: '/icons/nextjs.svg', policy: 'flat', url: 'https://nextjs.org/', blurb: 'The React framework for production web apps.' },
  { id: 'react', name: 'React', lane: 'frontend', policy: 'name', url: 'https://react.dev/', blurb: 'A JavaScript library for building user interfaces.', credit: META },
  {
    id: 'angular',
    name: 'Angular',
    lane: 'frontend',
    logo: '/icons/angular.svg',
    policy: 'extrude',
    url: 'https://angular.dev/',
    blurb: 'A framework for building web UI applications.',
    credit: 'Angular logo by Google, licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Modified: recoloured and extruded in 3D.',
  },
  {
    id: 'spring-boot',
    name: 'Spring Boot',
    lane: 'backend',
    policy: 'name',
    url: 'https://spring.io/projects/spring-boot',
    blurb: 'A framework for production-ready Java back-end applications.',
    credit: 'Spring is a trademark of Broadcom Inc. and/or its subsidiaries.',
  },
  { id: 'nestjs', name: 'NestJS', lane: 'backend', logo: '/icons/nestjs.svg', policy: 'flat', url: 'https://nestjs.com/', blurb: 'A Node.js framework for structured server-side applications.' },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    lane: 'data',
    policy: 'name',
    url: 'https://www.postgresql.org/',
    blurb: 'An open-source relational database.',
    credit: 'Postgres, PostgreSQL and the Slonik Logo are trademarks or registered trademarks of the PostgreSQL Community Association of Canada.',
  },
  { id: 'redis', name: 'Redis', lane: 'data', logo: '/icons/redis.svg', policy: 'flat', url: 'https://redis.io/', blurb: 'An in-memory data store for caching and queues.' },
  { id: 'supabase', name: 'Supabase', lane: 'data', logo: '/icons/supabase.svg', policy: 'flat', url: 'https://supabase.com/', blurb: 'A Postgres platform with auth, storage and APIs.' },
  { id: 'minio', name: 'MinIO', lane: 'data', logo: '/icons/minio.svg', policy: 'flat', url: 'https://min.io/', blurb: 'S3-compatible object storage.' },
  { id: 'react-native', name: 'React Native', lane: 'mobile', policy: 'name', url: 'https://reactnative.dev/', blurb: 'A framework for building native apps using React.', credit: META },
  {
    id: 'flutter',
    name: 'Flutter',
    lane: 'mobile',
    logo: '/icons/flutter.svg',
    policy: 'flat',
    url: 'https://flutter.dev/',
    blurb: 'An open-source cross-platform UI framework using the Dart language, developed by Google.',
    credit: 'Flutter and the related logo are trademarks of Google LLC. We are not endorsed by or affiliated with Google LLC.',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    lane: 'core',
    logo: '/icons/ts.svg',
    policy: 'flat',
    url: 'https://www.typescriptlang.org/',
    blurb: 'A strict syntactical superset of JavaScript that adds optional static typing.',
    credit: 'TypeScript is a trademark of Microsoft Corporation.',
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    lane: 'core',
    logo: '/icons/js.svg',
    policy: 'extrude',
    url: 'https://developer.mozilla.org/docs/Web/JavaScript',
    blurb: 'A high-level, just-in-time compiled, multi-paradigm programming language.',
    credit: 'JS logo from the logo.js project, MIT licence. Modified: recoloured and extruded in 3D.',
  },
  {
    id: 'java',
    name: 'Java',
    lane: 'core',
    policy: 'name',
    url: 'https://dev.java/',
    blurb: 'A high-level, class-based, object-oriented programming language.',
    credit: 'Oracle, Java, MySQL, and NetSuite are registered trademarks of Oracle and/or its affiliates. Other names may be trademarks of their respective owners.',
  },
  { id: 'c', name: 'C', lane: 'core', policy: 'name', url: 'https://www.open-std.org/jtc1/sc22/wg14/', blurb: 'A general-purpose, procedural programming language.' },
  // C++ has a credit line for its logo only; the logo is not shown ('name'), so no line.
  { id: 'cpp', name: 'C++', lane: 'core', policy: 'name', url: 'https://isocpp.org/', blurb: 'A general-purpose programming language created as an extension of C.' },
  {
    id: 'python',
    name: 'Python',
    lane: 'core',
    logo: '/icons/python.svg',
    policy: 'flat',
    url: 'https://www.python.org/',
    blurb: 'An interpreted, high-level, general-purpose programming language.',
    credit: 'Python and the Python logos are trademarks or registered trademarks of the Python Software Foundation.',
  },
  {
    id: 'qt',
    name: 'Qt',
    lane: 'core',
    policy: 'name',
    url: 'https://www.qt.io/',
    blurb: 'A widget toolkit for creating graphical user interfaces in C++.',
    credit: 'Qt is a registered trademark of The Qt Company Ltd. and its subsidiaries.',
  },
]

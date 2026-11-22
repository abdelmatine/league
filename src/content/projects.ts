export interface Project {
  /** URL id: #projects/<slug>. */
  slug: string
  name: string
  /** One line for the banner. */
  tag: string
  description: string
  image: string
  link: string
  /** Tech ids from tech.ts. */
  stack: string[]
  /** Hidden until it has real content (placeholder text or a link that isn't the project's). */
  draft?: boolean
  /** Brand colour (hex): tints the project's lobby banner and detail panel. */
  accent?: string
}

export const projects: Project[] = [
  {
    slug: 'fixed-app',
    name: 'Fixed APP',
    tag: 'Placeholder',
    description:
      "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable.",
    image: '/assets/ord.jpg',
    link: 'https://fixedapp.example.com',
    stack: ['postgresql', 'angular', 'spring-boot'],
    draft: true,
  },
  {
    slug: 'electrocute',
    name: 'ELECTROCUTE',
    tag: 'Electronics store',
    description:
      'Discover the latest in tech at ELECTROCUTE — your destination for cutting-edge electronics, unbeatable deals, and trusted brands. Shop laptops, smartphones, gaming gear, and more with fast shipping and expert support.',
    image: '/assets/electrocute.png',
    link: 'https://electrocuute.vercel.app',
    stack: ['react'],
    accent: '#E3261C',
  },
  {
    slug: 'planify',
    name: 'PlanIfy',
    tag: 'Meeting planner',
    description:
      'Simplify your scheduling with PlaniFy, the smart meeting planner. Coordinate with ease, find the perfect time for everyone, and manage all your appointments in one place — no back-and-forth emails needed.',
    image: '/assets/cal.png',
    link: 'https://planify.vercel.app',
    stack: ['nextjs', 'react-native'],
    accent: '#2E9AA6',
  },
  {
    slug: 'mondas-ol',
    name: 'Mondas Öl',
    tag: 'Olive oil brand',
    description:
      'Discover the pure essence of premium, cold-pressed olive oil. Explore our sustainably sourced collections, learn about our traditional harvesting process, and bring the authentic flavors of the Mediterranean straight to your kitchen.',
    image: '/icons/mondas.ico',
    link: 'https://mondas-ol.vercel.app/',
    stack: ['nextjs', 'nestjs', 'postgresql'],
    accent: '#F2A900',
  },
  {
    slug: 'zinine-gym',
    name: 'Zinine Gym',
    tag: 'Fitness centre site',
    description:
      'Push your limits at ZININE GYM PARK — a modern fitness center with expert trainers, cutting-edge equipment, and energizing group classes. Start your transformation today with flexible memberships and personalized workout plans.',
    image: '/assets/gym.jpg',
    link: 'https://zininegym.netlify.app',
    stack: ['spring-boot', 'react'],
    accent: '#9AA3AD',
  },
  {
    slug: 'e-books',
    name: 'E Books',
    tag: 'Ebook store',
    description:
      'Dive into the world of knowledge and imagination with eBooks. Browse thousands of titles across every genre, download instantly, and read anytime, anywhere on your favorite device.',
    image: '/assets/book.png',
    link: 'https://www.bookbub.com/',
    stack: ['spring-boot', 'angular'],
    draft: true,
  },
  {
    slug: 'e-commerce',
    name: 'E Commerce',
    tag: 'Online marketplace',
    description:
      'Shop smarter at SmartShop — your all-in-one online marketplace for fashion, gadgets, home goods, and more. Enjoy curated collections, secure checkout, and fast delivery, all in one seamless experience.',
    image: '/assets/eco.jpg',
    link: 'https://ecommerce.example.com',
    stack: ['spring-boot', 'angular', 'postgresql'],
    draft: true,
  },
  {
    slug: 'glimmer-grace',
    name: 'Glimmer & Grace',
    tag: 'Jewellery store',
    description:
      'Shine with elegance at Glimmer & Grace. From timeless classics to modern designs, explore handcrafted pieces made with ethically sourced gems and precious metals. Perfect for every occasion, or just because.',
    image: '/assets/glimmer.png',
    link: 'https://glimmergrace.vercel.app/',
    stack: ['nextjs', 'supabase'],
    accent: '#E8DCC8',
  },
  {
    slug: 'vehicool',
    name: 'VEHICOOL',
    tag: 'Car marketplace',
    description:
      "The smart way to buy, sell, or rent cars. Browse thousands of verified listings, compare prices, or easily list your own vehicle in just a few clicks. Whether you're upgrading your ride or renting it out, we've got you covered.",
    image: '/icons/vehicool.svg',
    link: 'https://vehicool.vercel.app/',
    stack: ['spring-boot', 'react'],
    accent: '#7F93A8',
  },
  {
    slug: 'sam-medicale',
    name: 'Sam Médicale',
    tag: 'Medical supply store',
    description:
      'Your trusted e-store for premium biomedical equipment and certified medical supplies. We provide healthcare professionals and institutions with high-quality precision instruments and advanced medical devices to ensure optimal patient care.',
    image: '/icons/sam.svg',
    link: 'https://sammedicale.com.tn/',
    stack: ['nextjs', 'nestjs', 'postgresql', 'minio', 'redis'],
    accent: '#14B39A',
  },
  {
    slug: 'mono',
    name: 'MONO',
    tag: 'Fashion store',
    description:
      'A minimalist fashion destination where simplicity meets statement. Curated with clean lines and refined essentials, MONO offers thoughtfully crafted apparel and accessories designed to elevate everyday style with modern, timeless forms.',
    image: '/icons/mono.svg',
    link: 'https://monoo.lovable.app',
    stack: ['spring-boot', 'nextjs'],
    accent: '#4FD1D9',
  },
]

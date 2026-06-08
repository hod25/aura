// Resilient seed catalog.
//
// Provides a static product catalog so the storefront renders meaningful
// content even before — or entirely without — a live backend. Kept in
// lock-step with the backend seed data in `backend/src/config/init.sql`.

import type { Product } from '@/types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Strata Oak Side Table',
    description:
      'Stacked solid-oak rings form a softly tactile column, crowned by a single seamless disc of hand-oiled timber. A quiet sculptural anchor for the sofa-side.',
    price: 460.0,
    category: 'Furniture',
    image:
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=600&q=80',
    image_url:
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=600&q=80',
    stock: 14,
    rating: 4.6,
    featured: true,
  },
  {
    id: 2,
    name: 'Contour Bouclé Lounge Chair',
    description:
      'A sculptural lounge chair wrapped in ivory bouclé over a hand-finished solid-oak frame, contoured to cradle the body in unhurried comfort.',
    price: 890.0,
    category: 'Seating',
    image:
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=600&q=80',
    image_url:
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=600&q=80',
    stock: 12,
    rating: 4.9,
    featured: true,
  },
  {
    id: 3,
    name: 'Linear Marble Console',
    description:
      'A slender console pairing a honed Carrara marble top with a fine blackened-steel base — architectural restraint for an entryway or hall.',
    price: 1250.0,
    category: 'Furniture',
    image:
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80',
    image_url:
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80',
    stock: 9,
    rating: 4.8,
    featured: true,
  },
  {
    id: 4,
    name: 'Prism Travertine Floor Lamp',
    description:
      'A faceted travertine plinth grounds a slim brass stem and opal-glass diffuser, casting a warm, sculptural glow across the floor.',
    price: 320.0,
    category: 'Lighting',
    image:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
    image_url:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
    stock: 22,
    rating: 4.7,
  },
  {
    id: 5,
    name: 'Meridian Walnut Dining Table',
    description:
      'A solid American black-walnut dining table with tapered legs and a hand-oiled top that seats six in quiet, grounded warmth.',
    price: 1680.0,
    category: 'Furniture',
    image:
      'https://images.unsplash.com/photo-1687949289431-7dbbef0f872f?auto=format&fit=crop&w=600&q=80',
    image_url:
      'https://images.unsplash.com/photo-1687949289431-7dbbef0f872f?auto=format&fit=crop&w=600&q=80',
    stock: 10,
    rating: 4.8,
    featured: true,
  },
  {
    id: 6,
    name: 'Halo Alabaster Pendant',
    description:
      'A hand-carved alabaster disc suspended from a brushed-brass canopy, glowing with the soft, veined translucence of natural stone.',
    price: 540.0,
    category: 'Lighting',
    image:
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&q=80',
    image_url:
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&q=80',
    stock: 18,
    rating: 4.8,
  },
  {
    id: 7,
    name: 'Drift Linen Sofa',
    description:
      'A low, generous three-seat sofa in stonewashed Belgian linen over a kiln-dried hardwood frame with feather-down cushions.',
    price: 2150.0,
    category: 'Seating',
    image:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
    image_url:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
    stock: 8,
    rating: 4.9,
    featured: true,
  },
  {
    id: 8,
    name: 'Celadon Stoneware Vase',
    description:
      "Wheel-thrown stoneware finished in a matte celadon glaze, each vessel carrying the subtle irregularities of the maker's hand.",
    price: 220.0,
    category: 'Decor',
    image:
      'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=600&q=80',
    image_url:
      'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=600&q=80',
    stock: 40,
    rating: 4.7,
  },
  {
    id: 9,
    name: 'Nimbus Bouclé Ottoman',
    description:
      'A rounded upholstered ottoman in soft ivory bouclé on a recessed oak plinth — equal parts footrest, seat and sculpture.',
    price: 480.0,
    category: 'Seating',
    image:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80',
    image_url:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80',
    stock: 24,
    rating: 4.6,
  },
  {
    id: 10,
    name: 'Linea Oak Bookshelf',
    description:
      'An open ladder bookshelf in solid white oak with cantilevered shelves that appear to float weightlessly against the wall.',
    price: 760.0,
    category: 'Furniture',
    image:
      'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=600&q=80',
    image_url:
      'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=600&q=80',
    stock: 16,
    rating: 4.6,
  },
  {
    id: 11,
    name: 'Ember Travertine Coffee Table',
    description:
      "A rounded coffee table carved from a single block of Roman travertine, its honed surface tracing the stone's natural striations.",
    price: 620.0,
    category: 'Furniture',
    image:
      'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=600&q=80',
    image_url:
      'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=600&q=80',
    stock: 20,
    rating: 4.7,
  },
  {
    id: 12,
    name: 'Verde Potted Olive Tree',
    description:
      'A mature potted olive in a hand-thrown terracotta vessel — a living sculpture that softens architectural lines with silver-green foliage.',
    price: 320.0,
    category: 'Decor',
    image:
      'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80',
    image_url:
      'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80',
    stock: 9,
    rating: 4.8,
  },
];

export default MOCK_PRODUCTS;

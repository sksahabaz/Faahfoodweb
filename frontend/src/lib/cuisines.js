import { appUrl } from './paths'

/**
 * Cuisine tiles: a small design configuration (label, illustration, alt text) mapped onto
 * REAL data. The database has no cuisine column on restaurants, so membership comes from the
 * menu item categories returned by GET /api/restaurants/{id}/menu: a restaurant belongs to a
 * cuisine when its menu has items in one of the cuisine's `categories`.
 *
 * Illustrations: public/cuisines/<id>.webp (scripts/prepare-cuisines.py). Every image is a
 * square with the food disc centred at CUISINE_DISC_SHARE of its size; food may cross the edge.
 */
export const ALL = 'all'
export const CUISINE_DISC_SHARE = 0.7143

const image = (id) => appUrl(`cuisines/${id}.webp`)

export const CUISINES = [
  { id: ALL, label: 'All', image: image('all'), alt: 'Cheeseburger with lettuce and tomato', categories: [] },
  { id: 'biryani', label: 'Biryani', image: image('biryani'), alt: 'Bowl of chicken biryani', categories: ['Biryani'] },
  { id: 'pizza', label: 'Pizza', image: image('pizza'), alt: 'Slice of pepperoni pizza', categories: ['Pizza'] },
  { id: 'burgers', label: 'Burgers', image: image('burgers'), alt: 'Cheeseburger', categories: ['Burgers'] },
  { id: 'chinese', label: 'Chinese', image: image('chinese'), alt: 'Bowl of noodles with chopsticks', categories: ['Chinese', 'Noodles', 'Momos'] },
  { id: 'south-indian', label: 'South Indian', image: image('south-indian'), alt: 'Dosa with chutneys and sambar', categories: ['South Indian'] },
  { id: 'desserts', label: 'Desserts', image: image('desserts'), alt: 'Chocolate cake with ice cream', categories: ['Desserts'] },
  { id: 'healthy', label: 'Healthy', image: image('healthy'), alt: 'Fresh vegetable salad', categories: ['Healthy', 'Salads', 'Salad'] },
  { id: 'beverages', label: 'Beverages', image: image('beverages'), alt: 'Glass of orange juice', categories: ['Beverages'] },
]

const normalise = (value) => String(value || '').trim().toLowerCase()

/** True when the restaurant's menu categories include one of the cuisine's categories. */
export function servesCuisine(cuisine, menuCategories) {
  if (cuisine.id === ALL) return true
  if (!menuCategories) return false
  return cuisine.categories.some((category) => menuCategories.has(normalise(category)))
}

export const categorySet = (menuItems) => new Set(menuItems.map((item) => normalise(item.category)))

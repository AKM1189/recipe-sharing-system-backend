import 'dotenv/config';
import { PrismaClient, RecipeDifficulty, RecipeStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  }),
});

// helper for steps
const step = (stepNumber: number, title: string, instruction: string) => ({
  stepNumber,
  title,
  instruction,
});

async function main() {
  console.log('🌱 Seeding started...');

  // ✅ Categories
  const categoriesData = [
    'Appetizers',
    'Drinks',
    'Snacks',
    'Breads',
    'Healthy',
    'Meat',
    'Vegetarian',
    'Seafood',
    'Salads',
    'Soups',
    'Sauces',
    'Vegan',
    'Dessert',
    'Breakfasts',
  ];

  const categories = await Promise.all(
    categoriesData.map((name) => {
      const slug = name.toLowerCase();
      return prisma.category.upsert({
        where: { slug },
        update: {},
        create: { name, slug: name.toLowerCase() },
      });
    }),
  );

  // ✅ User
  const user = await prisma.user.findFirst({
    where: { email: 'akm.dev.me@gmail.com' },
  });
  if (!user) throw new Error('User not found');
  const userId = user.id;

  // helper to map categories
  const mapCategories = (names: string[]) =>
    categories
      .filter((c) => names.includes(c.name))
      .map((c) => ({ categoryId: c.id }));

  // ✅ Recipes (12)
  const recipes = [
    {
      title: 'Spaghetti Carbonara',
      description: 'Classic Italian pasta.',
      imageUrl: '',
      cookingTime: 25,
      serving: 2,
      difficulty: RecipeDifficulty.EASY,
      status: RecipeStatus.PUBLISHED,
      ingredients: [{ name: 'Spaghetti', quantity: '200', unit: 'g' }],
      steps: [
        step(1, 'Boil Pasta', 'Boil spaghetti.'),
        step(2, 'Cook Pancetta', 'Fry pancetta.'),
        step(3, 'Mix', 'Combine all.'),
      ],
      categories: ['Appetizers', 'Meat'],
    },

    {
      title: 'Chicken Curry',
      description: 'Spicy chicken curry.',
      imageUrl: '',
      cookingTime: 40,
      serving: 3,
      difficulty: RecipeDifficulty.MEDIUM,
      status: RecipeStatus.PUBLISHED,
      ingredients: [{ name: 'Chicken', quantity: '500', unit: 'g' }],
      steps: [
        step(1, 'Prepare', 'Cut chicken.'),
        step(2, 'Cook', 'Cook with spices.'),
        step(3, 'Serve', 'Serve hot.'),
      ],
      categories: ['Meat', 'Healthy'],
    },

    {
      title: 'Avocado Toast',
      description: 'Healthy breakfast.',
      imageUrl: '',
      cookingTime: 10,
      serving: 1,
      difficulty: RecipeDifficulty.EASY,
      status: RecipeStatus.PUBLISHED,
      ingredients: [{ name: 'Avocado', quantity: '1', unit: 'pcs' }],
      steps: [
        step(1, 'Toast', 'Toast bread.'),
        step(2, 'Mash', 'Mash avocado.'),
        step(3, 'Serve', 'Serve fresh.'),
      ],
      categories: ['Healthy', 'Vegetarian'],
    },

    {
      title: 'Chocolate Brownies',
      description: 'Sweet dessert.',
      imageUrl: '',
      cookingTime: 35,
      serving: 4,
      difficulty: RecipeDifficulty.MEDIUM,
      status: RecipeStatus.PUBLISHED,
      ingredients: [{ name: 'Chocolate', quantity: '150', unit: 'g' }],
      steps: [
        step(1, 'Mix', 'Mix ingredients.'),
        step(2, 'Bake', 'Bake at 180C.'),
        step(3, 'Serve', 'Cool and serve.'),
      ],
      categories: ['Dessert'],
    },

    {
      title: 'Caesar Salad',
      description: 'Fresh salad.',
      imageUrl: '',
      cookingTime: 15,
      serving: 2,
      difficulty: RecipeDifficulty.EASY,
      status: RecipeStatus.PUBLISHED,
      ingredients: [{ name: 'Lettuce', quantity: '1', unit: 'pcs' }],
      steps: [
        step(1, 'Chop', 'Chop lettuce.'),
        step(2, 'Mix', 'Add dressing.'),
        step(3, 'Serve', 'Serve chilled.'),
      ],
      categories: ['Salads', 'Healthy'],
    },

    {
      title: 'Pancakes',
      description: 'Fluffy pancakes.',
      imageUrl: '',
      cookingTime: 20,
      serving: 3,
      difficulty: RecipeDifficulty.EASY,
      status: RecipeStatus.PUBLISHED,
      ingredients: [{ name: 'Flour', quantity: '150', unit: 'g' }],
      steps: [
        step(1, 'Mix', 'Prepare batter.'),
        step(2, 'Cook', 'Cook on pan.'),
        step(3, 'Serve', 'Serve with syrup.'),
      ],
      categories: ['Breakfasts', 'Dessert'],
    },

    {
      title: 'Pad Thai',
      description: 'Thai noodles.',
      imageUrl: '',
      cookingTime: 40,
      serving: 3,
      difficulty: RecipeDifficulty.MEDIUM,
      status: RecipeStatus.PUBLISHED,
      ingredients: [{ name: 'Noodles', quantity: '200', unit: 'g' }],
      steps: [
        step(1, 'Soak', 'Soak noodles.'),
        step(2, 'Cook', 'Stir fry.'),
        step(3, 'Serve', 'Serve hot.'),
      ],
      categories: ['Snacks', 'Seafood'],
    },

    {
      title: 'Grilled Salmon',
      description: 'Healthy salmon.',
      imageUrl: '',
      cookingTime: 20,
      serving: 2,
      difficulty: RecipeDifficulty.EASY,
      status: RecipeStatus.PUBLISHED,
      ingredients: [{ name: 'Salmon', quantity: '2', unit: 'pcs' }],
      steps: [
        step(1, 'Season', 'Add spices.'),
        step(2, 'Grill', 'Grill fish.'),
        step(3, 'Serve', 'Serve hot.'),
      ],
      categories: ['Seafood', 'Healthy'],
    },

    {
      title: 'Mushroom Soup',
      description: 'Creamy soup.',
      imageUrl: '',
      cookingTime: 30,
      serving: 2,
      difficulty: RecipeDifficulty.EASY,
      status: RecipeStatus.PUBLISHED,
      ingredients: [{ name: 'Mushroom', quantity: '200', unit: 'g' }],
      steps: [
        step(1, 'Cook', 'Cook mushrooms.'),
        step(2, 'Blend', 'Blend soup.'),
        step(3, 'Serve', 'Serve warm.'),
      ],
      categories: ['Soups'],
    },

    {
      title: 'Guacamole',
      description: 'Avocado dip.',
      imageUrl: '',
      cookingTime: 10,
      serving: 2,
      difficulty: RecipeDifficulty.EASY,
      status: RecipeStatus.PUBLISHED,
      ingredients: [{ name: 'Avocado', quantity: '2', unit: 'pcs' }],
      steps: [
        step(1, 'Mash', 'Mash avocado.'),
        step(2, 'Mix', 'Add seasoning.'),
        step(3, 'Serve', 'Serve fresh.'),
      ],
      categories: ['Vegan', 'Snacks'],
    },

    {
      title: 'Beef Steak',
      description: 'Juicy steak.',
      imageUrl: '',
      cookingTime: 25,
      serving: 2,
      difficulty: RecipeDifficulty.MEDIUM,
      status: RecipeStatus.PUBLISHED,
      ingredients: [{ name: 'Beef', quantity: '300', unit: 'g' }],
      steps: [
        step(1, 'Season', 'Season beef.'),
        step(2, 'Cook', 'Cook steak.'),
        step(3, 'Serve', 'Serve hot.'),
      ],
      categories: ['Meat'],
    },

    {
      title: 'Fruit Smoothie',
      description: 'Refreshing drink.',
      imageUrl: '',
      cookingTime: 5,
      serving: 1,
      difficulty: RecipeDifficulty.EASY,
      status: RecipeStatus.PUBLISHED,
      ingredients: [{ name: 'Fruits', quantity: '200', unit: 'g' }],
      steps: [
        step(1, 'Add', 'Add fruits to blender.'),
        step(2, 'Blend', 'Blend well.'),
        step(3, 'Serve', 'Serve cold.'),
      ],
      categories: ['Drinks', 'Healthy'],
    },
  ];

  // ✅ Insert recipes
  for (const recipe of recipes) {
    await prisma.recipe.create({
      data: {
        ...recipe,
        userId,
        ingredients: { create: recipe.ingredients },
        steps: { create: recipe.steps },
        categories: { create: mapCategories(recipe.categories) },
      },
    });

    console.log(`✅ Created: ${recipe.title}`);
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

// Creates all tables and fills them with sample data.
// Usage: npm run db:setup   (WARNING: wipes existing data)
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('../src/db');

const categories = ['Starters', 'Mains', 'Breads & Rice', 'Desserts', 'Drinks'];

// [category, name, description, price, veg]
const menu = [
  ['Starters', 'Paneer Tikka', 'Cottage cheese marinated in yoghurt and spices, grilled in the tandoor', 249, true],
  ['Starters', 'Hara Bhara Kebab', 'Spinach and green pea patties with mint chutney', 199, true],
  ['Starters', 'Chicken Seekh Kebab', 'Minced chicken with herbs, cooked on skewers', 279, false],
  ['Starters', 'Crispy Corn', 'Sweet corn tossed with pepper and spring onion', 179, true],
  ['Mains', 'Dal Makhani', 'Black lentils simmered overnight with butter and cream', 249, true],
  ['Mains', 'Paneer Butter Masala', 'Paneer cubes in a rich tomato and cashew gravy', 289, true],
  ['Mains', 'Butter Chicken', 'Tandoori chicken in a smooth tomato butter sauce', 329, false],
  ['Mains', 'Lamb Rogan Josh', 'Slow cooked lamb curry with Kashmiri chilli', 389, false],
  ['Mains', 'Mix Veg Curry', 'Seasonal vegetables in a home-style onion gravy', 219, true],
  ['Breads & Rice', 'Butter Naan', 'Soft leavened bread brushed with butter', 55, true],
  ['Breads & Rice', 'Garlic Naan', 'Naan topped with garlic and coriander', 65, true],
  ['Breads & Rice', 'Tandoori Roti', 'Whole wheat bread from the clay oven', 35, true],
  ['Breads & Rice', 'Chicken Biryani', 'Basmati rice layered with spiced chicken, served with raita', 349, false],
  ['Breads & Rice', 'Veg Pulao', 'Fragrant rice cooked with vegetables and whole spices', 199, true],
  ['Desserts', 'Gulab Jamun', 'Two warm milk dumplings in sugar syrup', 99, true],
  ['Desserts', 'Rasmalai', 'Soft cheese patties in chilled saffron milk', 129, true],
  ['Desserts', 'Brownie with Ice Cream', 'Warm chocolate brownie, vanilla scoop on the side', 169, true],
  ['Drinks', 'Sweet Lassi', 'Thick yoghurt drink, chilled', 89, true],
  ['Drinks', 'Masala Chai', 'Milk tea brewed with ginger and cardamom', 49, true],
  ['Drinks', 'Fresh Lime Soda', 'Sweet, salted or mixed', 69, true],
  ['Drinks', 'Cold Coffee', 'Blended with ice cream', 129, true],
];

// [table number, seats]
const tables = [[1, 2], [2, 2], [3, 2], [4, 4], [5, 4], [6, 4], [7, 6], [8, 8]];

async function run() {
  const schema = fs.readFileSync(path.join(__dirname, '../sql/schema.sql'), 'utf8');
  await pool.query(schema);
  console.log('Tables created');

  const users = [
    ['Admin', 'admin@dinedesk.com', 'admin123', 'admin'],
    ['Kitchen Staff', 'kitchen@dinedesk.com', 'kitchen123', 'kitchen'],
    ['Demo Customer', 'customer@dinedesk.com', 'customer123', 'customer'],
  ];
  for (const [name, email, password, role] of users) {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
      [name, email, hash, role]
    );
  }

  const categoryIds = {};
  for (let i = 0; i < categories.length; i++) {
    const result = await pool.query(
      'INSERT INTO categories (name, sort_order) VALUES ($1, $2) RETURNING id',
      [categories[i], i]
    );
    categoryIds[categories[i]] = result.rows[0].id;
  }

  for (const [category, name, description, price, isVeg] of menu) {
    await pool.query(
      `INSERT INTO menu_items (category_id, name, description, price, is_veg)
       VALUES ($1, $2, $3, $4, $5)`,
      [categoryIds[category], name, description, price, isVeg]
    );
  }

  for (const [number, seats] of tables) {
    await pool.query('INSERT INTO restaurant_tables (table_number, seats) VALUES ($1, $2)', [number, seats]);
  }

  console.log('Sample data added');
  console.log('Admin login:    admin@dinedesk.com / admin123');
  console.log('Kitchen login:  kitchen@dinedesk.com / kitchen123');
  console.log('Customer login: customer@dinedesk.com / customer123');
  await pool.end();
}

run().catch((err) => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});

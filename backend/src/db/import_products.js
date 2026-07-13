const fs = require('fs');
const path = require('path');

const csv = fs.readFileSync(path.resolve(__dirname, '../../../assets/calorie_table_max.csv'), 'utf8');
const parts = csv.split(/\n"/);
const records = [];

for (let i = 1; i < parts.length; i++) {
  try {
    const nameEnd = parts[i].indexOf('"');
    const name = parts[i].substring(0, nameEnd).trim();
    const rest = parts[i].substring(nameEnd + 2);
    const fields = rest.split(',');
    if (name && fields.length >= 4) {
      const kcal = parseFloat(fields[0]) || 0;
      const prot = parseFloat(fields[1]) || 0;
      const fat = parseFloat(fields[2]) || 0;
      const carb = parseFloat(fields[3]) || 0;
      if (kcal > 0 || prot > 0 || fat > 0 || carb > 0) {
        records.push({ name, kcal, prot, fat, carb });
      }
    }
  } catch (e) {}
}

console.log('Parsed ' + records.length + ' products from CSV');

const pool = require('./pool');

async function main() {
  let added = 0;
  let skipped = 0;
  for (const r of records) {
    const existing = await pool.query('SELECT id FROM products WHERE name = ?', [r.name]);
    if (existing.length > 0) {
      skipped++;
      continue;
    }
    await pool.query(
      'INSERT INTO products (name, calories_per_100, proteins_per_100, fats_per_100, carbs_per_100, is_default) VALUES (?, ?, ?, ?, ?, TRUE)',
      [r.name, r.kcal, r.prot, r.fat, r.carb]
    );
    added++;
    if (added % 50 === 0) console.log('Progress: ' + added + ' added, ' + skipped + ' skipped');
  }
  console.log('Done! Added: ' + added + ', Skipped: ' + skipped);
  process.exit(0);
}

main().catch(function(err) {
  console.error('Error:', err);
  process.exit(1);
});

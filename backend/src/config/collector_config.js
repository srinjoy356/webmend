const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const COLLECTORS = [
  {
    id: process.env.FIXTURE_COLLECTOR_ID,
    name: 'Fixture Store (PDP)',
    target_url: 'https://fixture-store.vercel.app',
    expected_schema: [
      'product_name',
      'price',
      'currency',
      'stock_status',
      'image_url',
      'description',
      'last_checked'
    ]
  },
  {
    id: process.env.REAL_TARGET_COLLECTOR_ID,
    name: 'Croma (Discovery)',
    target_url: 'https://www.croma.com/campaign/redmi-note-/c/7574',
    expected_schema: [
      'product_name',
      'availability',
      'rating',
      'product_page_url'
    ]
  },
  {
    id: 'c_msx8l409dtxp9fx0w',
    name: 'Zepto (Search)',
    target_url: 'https://www.zeptonow.com/search?q=milk',
    expected_schema: [
      'current_price',
      'pack_size',
      'brand',
      'image_url',
      'product_page_url'
    ]
  }
];

module.exports = { COLLECTORS };

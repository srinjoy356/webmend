const puppeteer = require('puppeteer');
const path = require('path');

async function run() {
  console.log("Launching browser...");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  console.log("Navigating to Home page...");
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle2' });
  
  const homeUptimePath = path.join(__dirname, 'home_uptime.png');
  await page.screenshot({ path: homeUptimePath, fullPage: true });
  console.log("Home screenshot saved to", homeUptimePath);
  
  await browser.close();
}

run().catch(console.error);

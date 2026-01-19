import puppeteer from 'puppeteer';
import lighthouse from 'lighthouse';
import fs from 'fs';
import { URL } from 'url';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const { report } = await lighthouse('http://localhost:3000', {
      port: new URL(browser.wsEndpoint()).port,
      output: 'html',
      logLevel: 'info'
    });

    if (report) {
      fs.writeFileSync('./lighthouse-report.html', report);
      console.log('Lighthouse report generated: ./lighthouse-report.html');
    } else {
      console.error('Lighthouse report is undefined.');
    }
  } catch (error) {
    console.error('Error running Lighthouse:', error);
  } finally {
    await browser.close();
  }
})();

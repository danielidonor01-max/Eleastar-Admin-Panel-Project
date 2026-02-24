const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('PAGE ERROR:', msg.text());
        }
    });

    page.on('pageerror', err => {
        console.log('PAGE EXCEPTION:', err.toString());
    });

    try {
        await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
        await page.type('input[type="email"]', 'stephen@eleastar.com');
        await page.type('input[type="password"]', '123');
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        console.log("Navigating to CMS by clicking sidebar...");
        await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a, span, div'));
            const cmsLink = links.find(l => l.textContent.includes('Website CMS'));
            if (cmsLink) cmsLink.click();
        });
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: 'debug-error.png', fullPage: true });
        const bodyText = await page.evaluate(() => document.body.innerText);
        console.log("Body text starts with:", bodyText.substring(0, 200));
        console.log("Done waiting.");
    } catch (e) {
        console.log("Script error:", e);
    }

    await browser.close();
})();

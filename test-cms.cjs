const puppeteer = require('puppeteer');

(async () => {
    console.log("Starting validation...");
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Log console messages from the page to debug
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });

    console.log("Typing credentials...");
    await page.type('input[type="email"]', 'stephen@eleastar.com');
    await page.type('input[type="password"]', '123');
    await page.click('button[type="submit"]');

    console.log("Waiting for navigation to dashboard...");
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    console.log("Navigating to CMS Home page...");
    await page.goto('http://localhost:5173/admin/cms?page=Home', { waitUntil: 'networkidle0' });

    console.log("Waiting for app to finish loading...");
    try {
        await page.waitForSelector('.w-64 .cursor-pointer', { timeout: 5000 });
    } catch (e) {
        console.log("Timeout waiting for sections to appear.");
    }

    console.log("Checking if Page Structure elements exist...");
    await page.screenshot({ path: 'debug.png', fullPage: true });

    const sections = await page.$$eval('.w-64 .cursor-pointer', els => els.length);
    console.log(`Found ${sections} sections in sidebar.`);

    if (sections > 0) {
        // Click the first section (Hero)
        console.log("Clicking the Hero section...");
        await page.click('.w-64 .cursor-pointer:first-child');

        // Wait for Editor to show
        await page.waitForSelector('input[aria-label="Headline"]');

        // Switch to preview
        console.log("Switching to preview tab...");
        await page.evaluate(() => {
            const tabs = Array.from(document.querySelectorAll('button'));
            const previewTab = tabs.find(t => t.innerText.includes('Visual Preview'));
            if (previewTab) previewTab.click();
        });

        // Wait for iframe
        console.log("Waiting for iframe...");
        await page.waitForSelector('iframe');
        const elementHandle = await page.$('iframe');
        const frame = await elementHandle.contentFrame();

        // Wait for iframe to load the text
        await frame.waitForSelector('h1', { timeout: 10000 });
        const oldHeadline = await frame.$eval('h1', el => el.innerText);
        console.log(`Old Headline in Iframe: ${oldHeadline}`);

        // Now switch back to Editor tab
        console.log("Switching back to Editor tab...");
        await page.evaluate(() => {
            const tabs = Array.from(document.querySelectorAll('button'));
            const editTab = tabs.find(t => t.innerText.includes('Edit Content'));
            if (editTab) editTab.click();
        });

        // Type into the headline input
        console.log("Typing into the headline input...");
        await page.type('input[aria-label="Headline"]', ' TEST REALTIME');

        // Wait a tiny bit
        await new Promise(r => setTimeout(r, 1000));

        // Switch to preview tab again
        console.log("Switching to preview tab again...");
        await page.evaluate(() => {
            const tabs = Array.from(document.querySelectorAll('button'));
            const previewTab = tabs.find(t => t.innerText.includes('Visual Preview'));
            if (previewTab) previewTab.click();
        });

        // Check new headline
        const newHeadline = await frame.$eval('h1', el => el.innerText);
        console.log(`New Headline in Iframe: ${newHeadline}`);

        if (newHeadline.includes('TEST REALTIME')) {
            console.log("SUCCESS: Realtime Preview is working!");
        } else {
            console.log("FAILURE: Realtime Preview did not update.");
        }
    } else {
        console.log("ERROR: No sections found. CMSPage content is mysteriously empty!");
    }

    await browser.close();
})();

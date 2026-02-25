require('ts-node').register();
const { initialCMSContent } = require('./src/data/mockData.ts');

const activePage = 'Home';
const pageSections = initialCMSContent.filter(s => s.page === activePage || (s.page_slug && s.page_slug === activePage.toLowerCase()));

console.log('Total CMS Sections:', initialCMSContent.length);
console.log('Home Page Sections:', pageSections.length);
console.log('Sections:');
pageSections.forEach(s => {
    console.log(`- [${s.id}] Type: ${s.type}`);
});

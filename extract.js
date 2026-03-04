const fs = require('fs');
const path = require('path');
const jsonPath = path.join(__dirname, 'Backend from victory', 'Eleastar API.postman_collection (3).json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const extractEndpoints = (items, prefix = '') => {
    let results = [];
    items.forEach(item => {
        if (item.item) {
            results = results.concat(extractEndpoints(item.item, prefix + item.name + ' > '));
        } else if (item.request) {
            const method = item.request.method;
            let url = '';
            if (typeof item.request.url === 'string') {
                url = item.request.url;
            } else if (item.request.url && item.request.url.raw) {
                url = item.request.url.raw;
            }
            url = url.replace('{{base_url}}', '').replace('{{baseUrl}}', '');
            results.push(`${prefix}${item.name}: ${method} ${url}`);
        }
    });
    return results;
};

const endpoints = extractEndpoints(data.item);
console.log(endpoints.join('\n'));

import fs from 'fs';

const filePath = 'src/services/cmsService.ts';
let code = fs.readFileSync(filePath, 'utf8');

if (!code.includes('apiClient')) {
    code = code.replace(
        "import { type ApiResponse, mockSuccess, delay } from './api';",
        "import { type ApiResponse, mockSuccess, delay } from './api';\nimport { apiClient } from '../utils/apiClient';"
    );
}

// remove const getAuthToken = ...
code = code.replace(/const getAuthToken = \(\) => localStorage\.getItem\('token'\) \|\| '';\n+/g, '');

// remove const token = getAuthToken();
code = code.replace(/\s*const token = getAuthToken\(\);\n/g, '\n');

// fetch -> apiClient (public)
code = code.replace(
    /fetch\(`\$\{CMS_API_BASE_URL\}(\/cms\/[^`]+)`,\s*\{([\s\S]*?)\}\)/g,
    (match, endpoint, optionsStr) => {
        let cleanOptions = optionsStr.replace(/\s*'Accept': 'application\/json',?/g, '');
        cleanOptions = cleanOptions.replace(/headers:\s*\{/, "requireAuth: false,\n                headers: {");
        return `apiClient(\`${endpoint}\`, {${cleanOptions}})`;
    }
);

// fetch -> apiClient (private)
code = code.replace(
    /fetch\(`\$\{CMS_API_BASE_URL\}(\/portal\/cms\/[^`]+)`,\s*\{([\s\S]*?)\}\)/g,
    (match, endpoint, optionsStr) => {
        let cleanOptions = optionsStr.replace(/\s*'Authorization': `Bearer \$\{token\}`\,?/g, '');
        cleanOptions = cleanOptions.replace(/\s*'Accept': 'application\/json',?/g, '');
        cleanOptions = cleanOptions.replace(/\s*'Content-Type': 'application\/json',?/g, '');
        cleanOptions = cleanOptions.replace(/headers:\s*\{\s*\}/g, '');
        return `apiClient(\`${endpoint}\`, {${cleanOptions}})`;
    }
);

code = code.replace(/headers:\s*\{\s*,?\s*\}/g, 'headers: {}');
code = code.replace(/,\s*\}/g, '\n            }'); // trailing commas in headers objects sometimes break syntax if not careful, actually JS allows trailing commas, so this is safe.

fs.writeFileSync(filePath, code);
console.log('Done refactoring!');

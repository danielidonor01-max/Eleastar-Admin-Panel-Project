const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/services/cmsService.ts');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add apiClient import
if (!code.includes('apiClient')) {
    code = code.replace(
        "import { type ApiResponse, mockSuccess, delay } from './api';",
        "import { type ApiResponse, mockSuccess, delay } from './api';\nimport { apiClient } from '../utils/apiClient';"
    );
}

// 2. Remove getAuthToken helper
code = code.replace(/const getAuthToken = \(\) => localStorage\.getItem\('token'\) \|\| '';\n+/g, '');

// 3. Remove all lines having `const token = getAuthToken();`
code = code.replace(/\s*const token = getAuthToken\(\);\n/g, '\n');

// 4. Transform public fetch calls (requireAuth: false)
// fetch(`${CMS_API_BASE_URL}/cms/...`, { ... })
// => apiClient(`/cms/...`, { requireAuth: false, ... })
code = code.replace(
    /fetch\(`\$\{CMS_API_BASE_URL\}(\/cms\/[^`]+)`,\s*\{([\s\S]*?)\}\)/g,
    (match, endpoint, optionsStr) => {
        // Strip out 'Accept': 'application/json' since apiClient provides it
        let cleanOptions = optionsStr.replace(/\s*'Accept': 'application\/json',?/g, '');
        // We know these public ones need requireAuth: false
        cleanOptions = cleanOptions.replace(/headers:\s*\{/, "requireAuth: false,\n                headers: {");
        return `apiClient(\`${endpoint}\`, {${cleanOptions}})`;
    }
);

// 5. Transform admin fetch calls
// fetch(`${CMS_API_BASE_URL}/portal/cms/...`, { ... })
// => apiClient(`/portal/cms/...`, { ... })
code = code.replace(
    /fetch\(`\$\{CMS_API_BASE_URL\}(\/portal\/cms\/[^`]+)`,\s*\{([\s\S]*?)\}\)/g,
    (match, endpoint, optionsStr) => {
        // Strip out 'Authorization': `Bearer ${token}` and 'Accept': 'application/json'
        let cleanOptions = optionsStr.replace(/\s*'Authorization': `Bearer \$\{token\}`\,?/g, '');
        cleanOptions = cleanOptions.replace(/\s*'Accept': 'application\/json',?/g, '');
        cleanOptions = cleanOptions.replace(/\s*'Content-Type': 'application\/json',?/g, ''); // default in apiClient

        // Clean up empty headers: {} blocks if any
        cleanOptions = cleanOptions.replace(/headers:\s*\{\s*\}/g, '');
        // Clean up empty commas

        return `apiClient(\`${endpoint}\`, {${cleanOptions}})`;
    }
);

// 6. Final cleanup. Sometimes removing 'Accept' leaves trailing commas like `headers: {\n                }`
code = code.replace(/headers:\s*\{\s*,?\s*\}/g, 'headers: {}');

fs.writeFileSync(filePath, code);
console.log('Migration to apiClient completed successfully.');

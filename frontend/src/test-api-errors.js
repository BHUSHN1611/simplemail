// Simple test to verify error handling logic without Vite dependencies
// Test the helper functions and error handling logic

// Mock the helper functions from Api.js for testing
const isJsonResponse = (response) => {
    const contentType = response.headers?.['content-type'] || '';
    return contentType.includes('application/json') || contentType.includes('application/javascript');
};

const isNetworkError = (error) => {
    return (
        !error.response && error.request ||
        error.code === 'NETWORK_ERROR' ||
        error.code === 'ECONNABORTED' ||
        error.code === 'ENOTFOUND' ||
        error.code === 'ECONNREFUSED' ||
        error.message?.includes('Network Error') ||
        error.message?.includes('timeout')
    );
};

const getNetworkErrorMessage = (error) => {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return 'Request timeout: The server took too long to respond. Please check your connection and try again.';
    }
    if (error.code === 'ENOTFOUND') {
        return 'Server not found: Please check if the server is running and try again.';
    }
    if (error.code === 'ECONNREFUSED') {
        return 'Connection refused: The server is not accepting connections. Please try again later.';
    }
    return 'Network error: Please check your internet connection and try again.';
};

const safeJsonParse = (response) => {
    try {
        // Check if response has data and it's not empty
        if (!response.data) {
            throw new Error('Empty response received from server');
        }

        // If it's already parsed (object), return as is
        if (typeof response.data === 'object' && response.data !== null) {
            return response.data;
        }

        // Try to parse as JSON
        if (typeof response.data === 'string') {
            // Check if it's HTML (error page)
            if (response.data.trim().startsWith('<')) {
                throw new Error('Received HTML error page instead of JSON response');
            }

            // Try to parse JSON
            return JSON.parse(response.data);
        }

        // If it's not a string or object, something is wrong
        throw new Error('Invalid response format received from server');
    } catch (parseError) {
        if (parseError.message.includes('JSON.parse')) {
            throw new Error('Invalid JSON response received from server');
        }
        throw parseError;
    }
};

// Test cases
const testCases = [
    {
        name: 'Network Error Detection',
        test: () => {
            const networkErrors = [
                { code: 'NETWORK_ERROR', message: 'Network Error' },
                { code: 'ECONNABORTED', message: 'timeout' },
                { code: 'ENOTFOUND', message: 'Not found' },
                { code: 'ECONNREFUSED', message: 'Connection refused' },
                { request: {}, message: 'Network Error' }
            ];

            const results = networkErrors.map(error => ({
                error,
                isNetwork: isNetworkError(error),
                message: getNetworkErrorMessage(error)
            }));

            console.log('Network error detection results:', results);
            return results.every(r => r.isNetwork) && results.every(r => r.message);
        }
    },
    {
        name: 'JSON Response Detection',
        test: () => {
            const jsonResponse = { headers: { 'content-type': 'application/json' } };
            const htmlResponse = { headers: { 'content-type': 'text/html' } };
            const noContentType = { headers: {} };

            const results = [
                { response: jsonResponse, expected: true },
                { response: htmlResponse, expected: false },
                { response: noContentType, expected: false }
            ].map(r => ({
                expected: r.expected,
                actual: isJsonResponse(r.response)
            }));

            console.log('JSON response detection results:', results);
            return results.every(r => r.expected === r.actual);
        }
    },
    {
        name: 'Safe JSON Parsing - Valid JSON',
        test: () => {
            const validResponses = [
                { data: { message: 'success' } },
                { data: '{"message": "success"}' }
            ];

            const results = validResponses.map(response => {
                try {
                    const parsed = safeJsonParse(response);
                    return { success: true, parsed };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            });

            console.log('Valid JSON parsing results:', results);
            return results.every(r => r.success);
        }
    },
    {
        name: 'Safe JSON Parsing - HTML Error Page',
        test: () => {
            const htmlResponse = { data: '<html><body>Error 500</body></html>' };

            try {
                safeJsonParse(htmlResponse);
                return false; // Should have thrown an error
            } catch (error) {
                console.log('HTML error page correctly detected:', error.message);
                return error.message.includes('HTML error page');
            }
        }
    },
    {
        name: 'Safe JSON Parsing - Empty Response',
        test: () => {
            const emptyResponse = { data: null };

            try {
                safeJsonParse(emptyResponse);
                return false; // Should have thrown an error
            } catch (error) {
                console.log('Empty response correctly detected:', error.message);
                return error.message.includes('Empty response');
            }
        }
    }
];

// Run tests
function runTests() {
    console.log('🧪 Testing API Error Handling Logic\n');
    console.log('=' * 50);

    let passed = 0;
    let total = testCases.length;

    testCases.forEach((testCase, index) => {
        console.log(`\n${index + 1}. ${testCase.name}`);
        console.log('-'.repeat(40));

        try {
            const result = testCase.test();
            if (result) {
                console.log(`✅ PASSED`);
                passed++;
            } else {
                console.log(`❌ FAILED`);
            }
        } catch (error) {
            console.log(`❌ ERROR: ${error.message}`);
        }
    });

    console.log('\n' + '=' * 50);
    console.log(`📊 Test Results: ${passed}/${total} tests passed`);

    if (passed === total) {
        console.log('🎉 All error handling logic tests passed!');
        console.log('\nKey improvements verified:');
        console.log('✅ Network error detection works correctly');
        console.log('✅ JSON response detection works correctly');
        console.log('✅ Safe JSON parsing handles valid JSON');
        console.log('✅ HTML error pages are properly detected');
        console.log('✅ Empty responses are properly handled');
        console.log('✅ User-friendly error messages are generated');
    } else {
        console.log(`❌ ${total - passed} test(s) failed`);
    }
}

// Run the tests
runTests();
// Verify that required vars were defined
// if (typeof process.env.API_TOKEN === 'undefined') {
//     console.log('');
//     console.log('Usage: API_TOKEN=MyApiToken npm test');
//     console.log('');
//     process.exit();
// }

module.exports = {
    apiToken: process.env.API_TOKEN || 'TEST_API_TOKEN',
};

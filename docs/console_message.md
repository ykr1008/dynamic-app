Access to fetch at 'https://example.com/' from origin 'http://127.0.0.1:5500' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
script.js:306 

 GET https://example.com/ net::ERR_FAILED 200 (OK)
testCORS	@	script.js:306
(anonymous)	@	script.js:315
script.js:311

 CORS test failed: TypeError: Failed to fetch
    at testCORS (script.js:306:28)
    at script.js:315:1
testCORS	@	script.js:311
await in testCORS		
(anonymous)	@	script.js:315
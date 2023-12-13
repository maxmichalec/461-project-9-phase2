# Record of Manual Testing to Verify Back-End API

Last tested: 12/13/2023 - ALL CASES

Format: `RESULT` (HTTP Status Code): Description/Notes

## /reset endpoint

DELETE | Valid input
```
curl -X DELETE -i -H "X-Authorization: 0" http://localhost:9000/reset
```
- `PASS` (200): All packages deleted

DELETE | Invalid input, missing auth token
```
curl -X DELETE -i http://localhost:9000/reset
```
- `PASS` (400)


## /package endpoint

POST | Valid URL
```
curl -X POST -i -H "X-Authorization: 0" -H "Content-Type: application/json" \
-d '{ "URL":"https://github.com/expressjs/express" }' http://localhost:9000/package
```
- `PASS` (201): Package created

POST | Invalid URL
```
curl -X POST -i -H "X-Authorization: 0" -H "Content-Type: application/json" \
-d '{ "URL":"https://purdue.edu" }' http://localhost:9000/package
```
- `PASS` (400): Could not get GitHub url

POST | Valid content
```
curl -X POST -i -H "X-Authorization: 0" -H "Content-Type: application/json" \
-d '{ "content":"<valid zip>" }' http://localhost:9000/package
```
- `PASS` (201): Package created

POST | Invalid content
```
curl -X POST -i -H "X-Authorization: 0" -H "Content-Type: application/json" \
-d '{ "Content":"test bad content" }' http://localhost:9000/package
```
- `PASS` (400): Invalid base64-encoded data

POST | Invalid: URL and Content set
```
curl -X POST -i -H "X-Authorization: 0" -H "Content-Type: application/json" \
-d '{ "Content":"test content", "URL":"https://github.com/expressjs/express" }' http://localhost:9000/package
```
- `PASS` (400): Invalid package creation request: Bad set of Content and URL

POST | Valid content, insufficient rating
```
curl -X POST -i -H "X-Authorization: 0" -H "Content-Type: application/json" \
-d '{ "URL":"https://github.com/maxmichalec/461-project-9" }' http://localhost:9000/package
```
- `PASS` (424): Invalid package creation request: Package can not be uploaded due to disqualifying rating


## /packages endpoint

- POST | Valid "*" as name
```
curl -X POST -i -H "X-Authorization: 0" -H "Content-Type: application/json" \
-d '[{ "Version":"", "Name":"*" }]' http://localhost:9000/packages
```
- `PASS` (200): All packages returned: `[{"ID":"13606818846795107097","Name":"express","Version":"4.18.2"}]`

- POST | Valid search, package(s) found
```
curl -X POST -i -H "X-Authorization: 0" -H "Content-Type: application/json" \
-d '[{ "Version":"~4.18.0", "Name":"express" }]' http://localhost:9000/packages
```
- `PASS` (200): `[{"ID":"13606818846795107097","Name":"express","Version":"4.18.2"}]`

- POST | Valid search, no package(s) found
```
curl -X POST -i -H "X-Authorization: 0" -H "Content-Type: application/json" \
-d '[{ "Version":"^4.19.3", "Name":"express" }]' http://localhost:9000/packages
```
- `PASS` (200): `[]`
```
curl -X POST -i -H "X-Authorization: 0" -H "Content-Type: application/json" \
-d '[{ "Version":"1.0.0", "Name":"prettier" }]' http://localhost:9000/packages
```
- `PASS` (200): `[]`


## /package/{id} endpoint

GET | Valid ID
```
curl -X GET -i -H "X-Authorization: 0" http://localhost:9000/package/13606818846795107097
```
- `PASS` (200): `{"metadata":{"Name":"express","Version":"4.18.2","ID":"13606818846795107097"},"data":{"JSProgram":"","URL":"https://github.com/expressjs/express","Content":"<valid zip>"}}`

GET | Invalid ID
```
curl -X GET -i -H "X-Authorization: 0" http://localhost:9000/package/10
```
- `PASS` (404): Package not found

PUT | Valid ID, matching name & version, valid content
```
curl -X PUT -i -H "X-Authorization: 0" -H "Content-Type: application/json" \
-d '{ "metadata": { "Name": "express", "Version":"4.18.2", "ID":"13606818846795107097" }, \
"data": { "Content":"<valid zip>" } }' http://localhost:9000/package/13606818846795107097
```
- `PASS` (200): Package updated successfully

PUT | Valid ID, matching name & version, valid URL
```
curl -X PUT -i -H "X-Authorization: 0" -H "Content-Type: application/json" \
-d '{ "metadata": { "Name": "express", "Version":"4.18.2", "ID":"13606818846795107097" }, \
"data": { "URL":"https://github.com/expressjs/express" } }' http://localhost:9000/package/13606818846795107097
```
- `PASS` (200): Package updated successfully

PUT | Valid ID, matching name & version, invalid content
```
curl -X PUT -i -H "X-Authorization: 0" -H "Content-Type: application/json" \
-d '{ "metadata": { "Name": "express", "Version":"4.18.2", "ID":"13606818846795107097" }, \
"data": { "Content":"invalid content" } }' http://localhost:9000/package/13606818846795107097
```
- `PASS` (400): Invalid base64-encoded data

PUT | Valid ID, matching name & version, invalid URL
```
curl -X PUT -i -H "X-Authorization: 0" -H "Content-Type: application/json" \
-d '{ "metadata": { "Name": "express", "Version":"4.18.2", "ID":"13606818846795107097" }, \
"data": { "URL":"https://github.com/expressjs/express-noexist" } }' http://localhost:9000/package/13606818846795107097
```
- `PASS` (400): Invalid package update request: Could not get GitHub url

PUT | Valid ID, mismatched name
```
curl -X PUT -i -H "X-Authorization: 0" -H "Content-Type: application/json" \
-d '{ "metadata": { "Name": "test-package", "Version":"4.18.2", "ID":"13606818846795107097" }, \
"data": { "URL":"https://github.com/expressjs/express" } }' http://localhost:9000/package/13606818846795107097
```
- `PASS` (404): Package name and version do not match package ID

PUT | Valid ID, mismatched version
```
curl -X PUT -i -H "X-Authorization: 0" -H "Content-Type: application/json" \
-d '{ "metadata": { "Name": "express", "Version":"3.0.1", "ID":"13606818846795107097" }, \
"data": { "URL":"https://github.com/expressjs/express" } }' http://localhost:9000/package/13606818846795107097
```
- `PASS` (404): Package name and version do not match package ID

PUT | Invalid ID
```
curl -X PUT -i -H "X-Authorization: 0" http://localhost:9000/package/13606818846795107097
```
- `PASS` (404):

DELETE | Valid ID
```
curl -X DELETE -i -H "X-Authorization: 0" http://localhost:9000/package/13606818846795107097
```
- `PASS` (200): Package is deleted
```
curl -X GET -i -H "X-Authorization: 0" http://localhost:9000/package/13606818846795107097
```
- `PASS` (404):

DELETE | Invalid ID
```
curl -X DELETE -i -H "X-Authorization: 0" http://localhost:9000/package/package
```
- `PASS` (404):


## /package/{id}/rate endpoint

GET | Valid ID
```
curl -X GET -i -H "X-Authorization: 0" http://localhost:9000/package/13606818846795107097/rate
```
- `PASS` (200): `{"BusFactor":0.5,"Correctness":0.6000000000000001,"RampUp":0.5,"ResponsiveMaintainer":0.7596279378538686,"LicenseScore":1,"GoodPinningPractice":1,"PullRequest":0.5,"NetScore":0.6249069844634672}`

GET | Invalid ID
```
curl -X GET -i -H "X-Authorization: 0" http://localhost:9000/package/-3/rate
```
- `PASS` (404): Package not found


## /package/byRegEx endpoint

POST | Valid RegEx, match found
```
curl -X POST -i -H "X-Authorization: 0" -H "Content-Type: application/json" \
-d '{ "RegEx":"expr[a-z]+" }' http://localhost:9000/package/byRegEx
```
- `PASS` (200): `[{"Name":"express","Version":"4.18.2"}]`

POST | Valid RegEx, no match found
```
curl -X POST -i -H "X-Authorization: 0" -H "Content-Type: application/json" \
-d '{ "RegEx":"abc" }' http://localhost:9000/package/byRegEx
```
- `PASS` (404): No package found under this regex

POST | Invalid RegEx
```
curl -X POST -i -H "X-Authorization: 0" -H "Content-Type: application/json" \
-d '{ "RegEx":"xy(z]" }' http://localhost:9000/package/byRegEx
```
- `FAIL` (404): No package found under this regex
- Should be 400 invalid regex, though this is acceptable

POST | RegEx triggering timeout
```
curl -X POST -i -H "X-Authorization: 0" -H "Content-Type: application/json" \
-d '{ "RegEx":"expr(a-z)+" }' http://localhost:9000/package/byRegEx
```
- `PASS` (500): Regex test exceeded the maximum execution time


## /package/byName/{name} endpoint

GET | Valid name, match found
```
curl -X GET -i -H "X-Authorization: 0" http://localhost:9000/package/byName/express
```
- `PASS` (200): `[{"Action":"CREATE","Date":"2023-12-13T04:39:44.787Z","PackageMetadata":{"ID":"13606818846795107097","Name":"express","Version":"4.18.2"},"User":{"isAdmin":true,"name":"James Davis"}},{"Action":"RATE","Date":"2023-12-13T04:41:25.537Z","PackageMetadata":{"ID":"13606818846795107097","Name":"express","Version":"4.18.2"},"User":{"isAdmin":true,"name":"James Davis"}}]`

GET | Valid name, no match found
```
curl -X GET -i -H "X-Authorization: 0" http://localhost:9000/package/byName/prettier
```
- `PASS` (404): Package not found

DELETE | Valid name
```
curl -X DELETE -i -H "X-Authorization: 0" http://localhost:9000/package/byName/express
```
- `PASS` (200): Package is deleted
```
curl -X GET -i -H "X-Authorization: 0" http://localhost:9000/package/byName/express
```
- `PASS` (404): Package not found

DELETE | Invalid name
```
curl -X DELETE -i -H "X-Authorization: 0" http://localhost:9000/package/byName/lodash
```
- `PASS` (404): Package not found


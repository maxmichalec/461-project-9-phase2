/*
 * File: packageRegexController.ts
 * Author: Madi Arnold
 * Description: The /package/byRegEx endpoint logic
 */
import { Request, Response } from 'express';
import { AuthenticationToken, PackageMetadata, PackageRegEx } from '../types';
import { dbclient, log_request, log_response } from './controllerHelpers';
import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

export const postPackageByRegEx = async (req: Request, res: Response) => {
  try {
    log_request(req);
    console.log('Handling /package/byRegEx request');

    // Verify the X-Authorization header for authentication and permission
    const authorizationHeader: AuthenticationToken | undefined = Array.isArray(req.headers['x-authorization'])
      ? req.headers['x-authorization'][0] // Use the first element if it's an array
      : req.headers['x-authorization']; // Use the value directly if it's a string or undefined

    if (!authorizationHeader) {
      console.error('Authentication token missing or invalid');
      log_response(400, "{ error: 'Authentication token missing or invalid' }");
      return res.status(400).json({ error: 'Authentication token missing or invalid' });
    }

    console.log('Authentication token:', authorizationHeader);
      
    // Extract the regex from the request body
    const requestBody: PackageRegEx = req.body;

    if (!requestBody.RegEx) {
      console.error('Missing or invalid regex in the request body');
      log_response(400, "{ error: 'Missing or invalid regex in the request body' }");
      return res.status(400).json({ error: 'Missing or invalid regex in the request body' });
    }

    console.log('Regex from request body:', requestBody.RegEx);

    // Use DynamoDB to scan for packages matching the regex
    const scanCommand = new ScanCommand({
      TableName: 'packages',
    });

    console.log('Executing DynamoDB scan');

    const scanResult = await dbclient.send(scanCommand);

    console.log('DynamoDB scan result:', scanResult);

    // Convert DynamoDB items to PackageMetadata
    const packageHistory: PackageMetadata[] = (scanResult.Items || []).map((item) => {
      const unmarshalledItem = unmarshall(item);
      const valueObject = unmarshalledItem.value || {};

      return {
        ID: valueObject.ID, 
        Name: unmarshalledItem.name,
        Version: unmarshalledItem.version,
      };
    });

    console.log('Converted DynamoDB items:', packageHistory);

    const regexObject = new RegExp(requestBody.RegEx);
    const MAX_EXECUTION_TIME = 1000;
    
    async function testRegexWithTimeout(input: string): Promise<boolean> {
      return Promise.race([
        regexObject.test(input), // Regular expression test
        new Promise<boolean>((resolve) =>
          setTimeout(() => resolve(false), MAX_EXECUTION_TIME)
        ), // Timeout promise
      ]);
    }
    
    // Perform additional regex filtering on the client side
    let timeoutOccurred = false;
    const regexFilteredPackages: PackageMetadata[] = [];
    
    for (const pkg of packageHistory) {
      const result = await testRegexWithTimeout(pkg.Name);
    
      if (!result) {
        timeoutOccurred = true;
        break; // Exit the loop if timeout occurs
      }
    
      if (result) {
        regexFilteredPackages.push(pkg);
      }
    }
    
    if (timeoutOccurred) {
      console.error('Regex test exceeded the maximum execution time');
      log_response(500, "{ error: 'Regex test exceeded the maximum execution time' }");
      return res.status(500).json({ error: 'Regex test exceeded the maximum execution time' });
    }
    
    console.log('Packages after regex filtering:', regexFilteredPackages);

    if (regexFilteredPackages.length === 0) {
      console.warn('No packages found under this regex');
      log_response(404, "{ error: 'No package found under this regex' }");
      return res.status(404).json({ error: 'No package found under this regex' });
    }

    console.log('Returning packages:', regexFilteredPackages);

    // Respond with the package history entries
    log_response(200, JSON.stringify(regexFilteredPackages));
    res.status(200).json(regexFilteredPackages);
  } catch (error) {
    console.error('Error handling /package/byRegEx:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

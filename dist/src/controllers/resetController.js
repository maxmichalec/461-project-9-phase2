"use strict";
/*
 * File: resetController.ts
 * Author: Madi Arnold
 * Description: The /reset endpoint logic
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetRegistry = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const client_s3_1 = require("@aws-sdk/client-s3");
const dynamoDb = new client_dynamodb_1.DynamoDBClient({ region: 'us-east-1' });
const s3 = new client_s3_1.S3Client({ region: 'us-east-1' });
// Controller function for handling the DELETE request to /reset
const resetRegistry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Handling /reset request');
        // Verify the X-Authorization header for authentication and permission
        const authorizationHeader = Array.isArray(req.headers['x-authorization'])
            ? req.headers['x-authorization'][0] // Use the first element if it's an array
            : req.headers['x-authorization']; // Use the value directly if it's a string or undefined
        if (!authorizationHeader) {
            console.error('Authentication token missing or invalid');
            return res.status(400).json({ error: 'Authentication token missing or invalid' });
        }
        console.log('Authentication token:', authorizationHeader);
        // Perform the registry reset
        // Delete all items from DynamoDB table
        yield deleteAllItemsFromDynamoDB('packages');
        yield deleteAllItemsFromDynamoDB('packageHistory');
        console.log('DynamoDB items deleted successfully');
        // Delete all objects from S3 bucket
        // Uncomment the line below once the issue with S3 bucket access is resolved
        yield deleteAllObjectsFromS3Bucket('pckstore');
        console.log('S3 objects deleted successfully');
        // Respond with a success message
        res.status(200).json({ message: 'Registry reset successfully' });
    }
    catch (error) {
        console.error('Error handling /reset:', error);
        res.status(500).json({ error: 'Internal Server Error' }); // Handle any errors
    }
});
exports.resetRegistry = resetRegistry;
function deleteAllItemsFromDynamoDB(tableName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`Deleting all items from DynamoDB table: ${tableName}`);
            const scanParams = {
                TableName: tableName,
            };
            const scanResult = yield dynamoDb.send(new client_dynamodb_1.ScanCommand(scanParams));
            if (scanResult.Items) {
                // Delete each item from DynamoDB (hard-coded if/else since keys differ)
                const deletePromises = scanResult.Items.map((item) => {
                    if (tableName === 'packages') {
                        const deleteParams = {
                            TableName: tableName,
                            Key: {
                                id: item.id,
                            },
                        };
                        return dynamoDb.send(new client_dynamodb_1.DeleteItemCommand(deleteParams));
                    }
                    else if (tableName === 'packageHistory') {
                        const deleteParams = {
                            TableName: tableName,
                            Key: {
                                name: item.name,
                            },
                        };
                        return dynamoDb.send(new client_dynamodb_1.DeleteItemCommand(deleteParams));
                    }
                });
                yield Promise.all(deletePromises);
                console.log(`All items deleted from DynamoDB table: ${tableName}`);
            }
            else {
                console.log(`No items found in DynamoDB table: ${tableName}`);
            }
        }
        catch (error) {
            console.error('Error deleting items from DynamoDB:', error);
            throw error;
        }
    });
}
function deleteAllObjectsFromS3Bucket(bucketName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`Deleting all objects from S3 bucket: ${bucketName}`);
            const listParams = {
                Bucket: bucketName,
            };
            const listResult = yield s3.send(new client_s3_1.ListObjectsCommand(listParams));
            if (listResult.Contents) {
                // Delete each object from S3 bucket
                const deletePromises = listResult.Contents.map((object) => {
                    const deleteParams = {
                        Bucket: bucketName,
                        Key: object.Key || '',
                    };
                    return s3.send(new client_s3_1.DeleteObjectCommand(deleteParams));
                });
                yield Promise.all(deletePromises);
                console.log(`All objects deleted from S3 bucket: ${bucketName}`);
            }
            else {
                console.log(`No objects found in S3 bucket: ${bucketName}`);
            }
        }
        catch (error) {
            console.error('Error deleting objects from S3 bucket:', error);
            throw error;
        }
    });
}

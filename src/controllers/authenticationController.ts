/*
 * File: authenticationController.ts
 * Author: Madi Arnold
 * Description: The /authenticate endpoint, however we are not implementing this endpoint
 */

import { Request, Response } from 'express';
import { log_request, log_response } from './controllerHelpers';

// Controller function for handling the PUT request to /authenticate
export const createAuthToken = (req: Request, res: Response) => {
	log_request(req);
	log_response(501, 'We do not support authentication');
	return res.status(501).json({ error: 'We do not support authentication' });
};

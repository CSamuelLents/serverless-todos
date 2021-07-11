import 'source-map-support/register';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda';

import { getTodos } from '../../businessLogic/todos';
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger';

const logger = createLogger('getTodos');

export const handler: APIGatewayProxyHandler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing getTodos request', event);

    try {
      const userId = getUserId(event);
      const todos = await getTodos(userId);

      logger.info(`Resolved userId to ${userId}`);
      logger.info('Successfully fetched todos', { todos });

      return {
        statusCode: 200,
        body: JSON.stringify({ items: todos })
      };
    } catch (error) {
      logger.error('Error caught in getTodos handler.', error);

      return {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: error.message
      };
    }
  }
).use(cors({ credentials: true, origin: '*' }));

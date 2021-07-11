import 'source-map-support/register';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult
} from 'aws-lambda';

import { getUserId } from '../utils';
import { deleteTodo } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';

const logger = createLogger('deleteTodo');

export const handler: APIGatewayProxyHandler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing deleteTodo request', event);

    try {
      const userId = getUserId(event);
      await deleteTodo(userId, event.pathParameters.todoId);

      return {
        statusCode: 200,
        body: ''
      };
    } catch (error) {
      logger.error(error);

      return {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: error.message
      };
    }
  }
).use(cors({ credentials: true, origin: '*' }));

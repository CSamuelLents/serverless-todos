import 'source-map-support/register';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda';

import { createTodo } from '../../businessLogic/todos';
import { getUserId } from '../utils';
import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import { createLogger } from '../../utils/logger';

const logger = createLogger('createTodo');

export const handler: APIGatewayProxyHandler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing createTodo request', event);

    try {
      const todoRequest: CreateTodoRequest = JSON.parse(event.body);
      const userId = getUserId(event);
      const newTodo = await createTodo(todoRequest, userId);

      return {
        statusCode: 201,
        body: JSON.stringify({ item: newTodo })
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

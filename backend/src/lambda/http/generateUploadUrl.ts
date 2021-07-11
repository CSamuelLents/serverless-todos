import 'source-map-support/register';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda';

import { getUserId } from '../utils';
import { getUploadUrl } from '../../businessLogic/s3';
import { todoExists, attachUploadUrlToTodo } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';

const logger = createLogger('generateUploadUrl');

export const handler: APIGatewayProxyHandler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing generateUploadUrl request', event);

    try {
      const userId = getUserId(event);
      const todoId = event.pathParameters.todoId;
      const validTodoId = await todoExists(userId, todoId);

      if (!validTodoId) {
        logger.debug(
          `generateUploadUrl received invalid or nonexistent todoId: ${todoId}`
        );

        return {
          statusCode: 404,
          body: JSON.stringify({
            error: `Entry with todoId ${todoId} does not exist.`
          })
        };
      }

      const uploadUrl = getUploadUrl(todoId);
      await attachUploadUrlToTodo(userId, todoId);

      return {
        statusCode: 200,
        body: JSON.stringify({ uploadUrl })
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
).use(cors({ credentials: true }));

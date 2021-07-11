import 'source-map-support/register';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import {
  APIGatewayEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda';

import { getUserId } from '../utils';
import { updateTodo } from '../../businessLogic/todos';
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest';
import { createLogger } from '../../utils/logger';

const logger = createLogger('updateTodo');

export const handler: APIGatewayProxyHandler = middy(
  async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    logger.info('processing updateTodo request', event);

    const updateTodoRequest: UpdateTodoRequest = JSON.parse(event.body);
    const userId = getUserId(event);
    const todoId = event.pathParameters.todoId;

    await updateTodo(userId, todoId, updateTodoRequest);

    return {
      statusCode: 200,
      body: ''
    };
  }
).use(cors({ credentials: true, origin: '*' }));

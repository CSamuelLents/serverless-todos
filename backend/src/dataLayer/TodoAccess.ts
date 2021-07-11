import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import * as XRay from 'aws-xray-sdk';

import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from '../models/TodoUpdate';

const XRayAWS = XRay.captureAWS(AWS);

export class TodoAccess {
  private readonly docClient: DocumentClient = createDynamoDBClient();
  private readonly todosTable = process.env.TODOS_TABLE;
  private readonly userIdIndex = process.env.INDEX_NAME;
  private readonly bucketName = process.env.IMAGES_S3_BUCKET;

  async getTodos(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        IndexName: this.userIdIndex,
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise();

    return result.Items as TodoItem[];
  }

  async todoExists(userId: string, todoId: string): Promise<boolean> {
    const result = await this.docClient
      .get({
        TableName: this.todosTable,
        Key: { userId, todoId }
      })
      .promise();

    return !!result.Item;
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todo
      })
      .promise();

    return todo;
  }

  async updateTodo(
    userId: string,
    todoId: string,
    todoUpdate: TodoUpdate
  ): Promise<void> {
    await this.docClient.update({
      TableName: this.todosTable,
      Key: { userId, todoId },
      UpdateExpression: 'set name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeValues: {
        ':name': todoUpdate.name,
        ':dueDate': todoUpdate.dueDate,
        ':done': todoUpdate.done
      }
    });
  }

  async attachUploadUrlToTodo(userId: string, todoId: string): Promise<void> {
    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: { userId, todoId },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
        }
      })
      .promise();
  }

  async deleteTodo(userId: string, todoId: string): Promise<void> {
    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: { userId, todoId }
      })
      .promise();
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance');

    return new XRayAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    });
  }

  return new XRayAWS.DynamoDB.DocumentClient();
}

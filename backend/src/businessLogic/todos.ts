import * as uuid from 'uuid';

import { TodoItem } from '../models/TodoItem';
import { TodoAccess } from '../dataLayer/TodoAccess';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';

const todoAccess = new TodoAccess();

export async function getTodos(userId: string): Promise<TodoItem[]> {
  return todoAccess.getTodos(userId);
}

export async function todoExists(
  userId: string,
  todoId: string
): Promise<boolean> {
  return todoAccess.todoExists(userId, todoId);
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  return await todoAccess.createTodo({
    todoId: uuid.v4(),
    userId: userId,
    attachmentUrl: undefined,
    createdAt: new Date().toISOString(),
    done: false,
    ...createTodoRequest
  });
}

export async function updateTodo(
  userId: string,
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<void> {
  return await todoAccess.updateTodo(userId, todoId, updateTodoRequest);
}

export async function attachUploadUrlToTodo(
  userId: string,
  todoId: string
): Promise<void> {
  return await todoAccess.attachUploadUrlToTodo(userId, todoId);
}

export async function deleteTodo(
  userId: string,
  todoId: string
): Promise<void> {
  return todoAccess.deleteTodo(userId, todoId);
}

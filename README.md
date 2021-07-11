# Serverless Todo

Allows creating/removing/updating/fetching todo items. Todo items optionally support an attachment image. Each user only has access to todos that they created.

## Todo items

The application stores Todo items, with each Todo item containing the following fields:

- `todoId` (string) - a unique ID for an item
- `userId` (string) - a unique ID for a user
- `createdAt` (string) - date and time when an item was created
- `name` (string) - name of a Todo item (e.g. "Change a light bulb")
- `dueDate` (string) - date and time by which an item should be completed
- `done` (boolean) - true if an item was completed, false otherwise
- `attachmentUrl` (string) (optional) - a URL pointing to an image attached to a Todo item

## Functionality

The following functions have been implemented and are configured in the `serverless.yml` file:

- `Auth` - this function implements a custom authorizer for API Gateway using Auth0.

- `GetTodos` - returns all TODOs for a current user. A user ID can be extracted from a JWT token that is sent by the frontend

- `CreateTodo` - creates a new Todo for a current user. The shape of data send by a client application to this function can be found in the `CreateTodoRequest.ts` file

It receives a new Todo item in the following format:

```json
{
  "createdAt": "2019-07-27T20:01:45.424Z",
  "name": "Go to the place",
  "dueDate": "2019-07-29T20:01:45.424Z",
  "done": false,
  "attachmentUrl": "http://example.com/image.png"
}
```

It returns a new Todo item:

```json
{
  "item": {
    "todoId": "123",
    "createdAt": "2019-07-27T20:01:45.424Z",
    "name": "Hop to it",
    "dueDate": "2019-07-29T20:01:45.424Z",
    "done": false,
    "attachmentUrl": "http://example.com/image.png"
  }
}
```

- `UpdateTodo` - updates a Todo item created by the current user. The shape of data send by a client application to this function can be found in the `UpdateTodoRequest.ts` file

It receives an object that containing three fields:

```json
{
  "name": "Do the thing",
  "dueDate": "2019-07-29T20:01:45.424Z",
  "done": true
}
```

The ID of an item that should be updated is passed as a URL parameter and returns an empty body.

- `DeleteTodo` - deletes a Todo item created by a current user. Expects an ID of a Todo item to remove.

Returns an empty body.

- `GenerateUploadUrl` - returns a pre-signed URL that can be used to upload an attachment file for a Todo item.

Returns the following JSON object:

```json
{
  "uploadUrl": "https://s3-bucket-name.s3.eu-west-2.amazonaws.com/image.png"
}
```

## Frontend

The `client` folder contains a web application that uses the above API.

This frontend works with the serverless application once deployed. No changes need to be made to the code, excepting the `config.ts` file in the `client` folder. This file configures the client application and contains an API endpoint and Auth0 configuration:

```ts
const apiId = '...' API Gateway ID
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: '...',    // Domain from Auth0
  clientId: '...',  // Client ID from an Auth0 application
  callbackUrl: 'http://localhost:3000/callback'
}
```

## How to Run the Application

### Deploy the Backend

To deploy the application, run the following commands:

```bash
cd backend
npm install
sls deploy -v
```

### Run the Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```bash
cd client
npm install
npm start
```

This starts a development server and runs the React application that interacts with the serverless app.

## Postman collection

As an alternative way to test the API, you can use the Postman collection containing sample requests. To import this collection:

Click on the import button:

![Alt text](images/import-collection-1.png?raw=true 'Image 1')

Click on "Choose Files":

![Alt text](images/import-collection-2.png?raw=true 'Image 2')

Select a file to import:

![Alt text](images/import-collection-3.png?raw=true 'Image 3')

Right click on the imported collection to set variables for the collection:

![Alt text](images/import-collection-4.png?raw=true 'Image 4')

Provide variables for the collection:

![Alt text](images/import-collection-5.png?raw=true 'Image 5')

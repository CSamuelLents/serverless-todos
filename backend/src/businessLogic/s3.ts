import { S3Access } from '../dataLayer/S3Access';

const s3Access = new S3Access();

export function getUploadUrl(todoId: string) {
  return s3Access.getUploadUrl(todoId);
}

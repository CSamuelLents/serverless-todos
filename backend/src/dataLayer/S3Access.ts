import * as AWS from 'aws-sdk';
import * as XRay from 'aws-xray-sdk';

const XRayAWS = XRay.captureAWS(AWS);
const s3 = new XRayAWS.S3({ signatureVersion: 'v4' });

export class S3Access {
  private readonly imagesS3Bucket = process.env.IMAGES_S3_BUCKET;
  private readonly signedURLExpiration = process.env.SIGNED_URL_EXPIRATION;

  getUploadUrl(todoId: string) {
    return s3.getSignedUrl('putObject', {
      Key: todoId,
      Bucket: this.imagesS3Bucket,
      Expires: +this.signedURLExpiration
    });
  }
}

const { S3Client, PutObjectCommand, ListBucketsCommand, ListObjectsV2Command, DeleteObjectCommand, HeadObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const axios = require('axios');

class R2Client {
  constructor(accountId, accessKey, secretKey, region = 'auto') {
    this.endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
    this.s3 = new S3Client({
      region: region,
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    });
    this.publicDomain = null;
  }

  setPublicDomain(domain) {
    this.publicDomain = domain;
  }

  async generateSignedUrl(bucketName, keyName, expiresIn = 604800) {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: keyName,
    });
    return await getSignedUrl(this.s3, command, { expiresIn });
  }

  async put(bucketName, keyName, fileBuffer, contentType = 'application/octet-stream') {
    try {
      const signedUrl = await this.generateSignedUrl(bucketName, keyName);

      // Upload file using signed URL
      const response = await axios.put(signedUrl, fileBuffer, {
        headers: {
          'Content-Type': contentType,
        },
      });

      if (response.status === 200) {
        const objectURL = await this.getObjectURL(bucketName, keyName);
        if (objectURL.success) {
          return {
            data: objectURL,
            status: response.status,
            message: 'Object has been uploaded successfully',
          };
        } else {
          return {
            success: false,
            message: 'Object uploaded but failed to generate URL',
            error: objectURL.error,
          };
        }
      } else {
        return {
          success: false,
          status: response.status,
          message: 'Object upload failed',
        };
      }
    } catch (error) {
      console.error('Error:', error);
      return {
        success: false,
        message: 'Object upload failed',
        error: error.message,
      };
    }
  }

  async listBuckets() {
    try {
      const command = new ListBucketsCommand({});
      const response = await this.s3.send(command);
      const jsonResp = {buckets: response.Buckets}
      return jsonResp
    } catch (error) {
      console.error('Error listing buckets:', error);
    }
  }

  async listObjects(bucketName) {
    try {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
      });
      const response = await this.s3.send(command);
      const jsonResp = {objects: response.Contents}
      return jsonResp;
    } catch (error) {
      console.error('Error listing objects:', error);
    }
  }

  async deleteObject(bucketName, keyName) {
    try {
      // Check if the object exists
      const headCommand = new HeadObjectCommand({
        Bucket: bucketName,
        Key: keyName,
      });
      try {
        await this.s3.send(headCommand);
      } catch (error) {
        if (error.name === 'NotFound') {
          return {
            success: false,
            message: 'Object does not exist',
          };
        }
        throw error;
      }

      // Object exists, proceed to delete
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: keyName,
      });
      const response = await this.s3.send(command);
      const success = response.$metadata.httpStatusCode === 204;
      return {
        success: success,
        message: 'Object has been deleted',
        statusCode: response.$metadata.httpStatusCode,
        attempts: response.$metadata.attempts,
        totalRetryDelay: response.$metadata.totalRetryDelay,
        requestId: response.$metadata.requestId,
        extendedRequestId: response.$metadata.extendedRequestId,
        cfId: response.$metadata.cfId
      };
    } catch (error) {
      console.error('Error deleting object:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getObjectURL(bucketName, keyName, expiresIn = 604800) {
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: keyName,
      });
      const url = await getSignedUrl(this.s3, command, { expiresIn });
      const permanentURL = this.publicDomain ? `${this.publicDomain}/${keyName}` : null;
      return {
        success: true,
        statusCode: 200,
        expire: expiresIn,
        bucket: bucketName,
        keyname: keyName,
        url: url,
        permanentURL: permanentURL,
        message: 'Generated signed URL for object',
      };
    } catch (error) {
      console.error('Error generating object URL:', error);
      return {
        success: false,
        message: 'Failed to generate signed URL for object',
        error: error.message,
      };
    }
  }

  async ping() {
    try {
      const start = Date.now();
      const command = new ListBucketsCommand({});
      await this.s3.send(command);
      const latency = Date.now() - start;
      return {
        success: true,
        latency: latency,
        message: 'Ping successful',
      };
    } catch (error) {
      console.error('Ping failed:', error);
      return {
        success: false,
        message: 'Ping failed',
        error: error.message,
      };
    }
  }
}

module.exports = R2Client;

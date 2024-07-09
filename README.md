# r2-sdk

A streamlined Node.js library for effortless integration and management of Cloudflare R2 Object Storage, simplifying cloud storage operations in your projects.

## Installation

To install the library, use npm:

```sh
npm install cloudflare-r2-sdk
```

## Documentation language support
Languages: `English` *current* | `ไทย` *coming soon*

### Example Usage
**Declare the Client**
```js
const R2Client = require('cloudflare-r2-sdk');

const objectStorageClient = new R2Client(
  ACCOUNT_ID, // Your ACCOUNT_ID from Cloudflare R2 Dashboard
  ACCESS_KEY_ID, // Your Access Key from Cloudflare R2 API
  SECRET_ACCESS_KEY // Your Secret Key from Cloudflare R2 API
);
```

**Upload the image object to bucket**
```js
const uploadResponse = await bucket.put(
  bucketName: 'your-bucket-name', 
  keyName: 'img/image.jpg', 
  fileBuffer: buffer,
  contentType: 'image/jpeg'
);

console.log(uploadResponse);
```
**Reponse**
```json
{
  "data": {
    "success": true,
    "statusCode": 200,
    "expire": 604800, // in ms default is 7 days
    "bucket": "company",
    "keyname": "img/image.jpg",
    "url": "https://company.7492760310487df2252ef9441759c9a0.r2.cloudflarestorage.com/img/image.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=f525dac59ab797357113dcf3dedbdbca%2F20240709%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20240709T030506Z&X-Amz-Expires=604800&X-Amz-Signature=a15aaa3fb8162eb285e8d7eabf99253adee28dc22945c867e9c0cca959388936&X-Amz-SignedHeaders=host&x-id=GetObject", // temp url
    "permanentURL": null, // Will appears when after you set a Custom Public Domain
    "message": "Generated signed URL for object"
  },
  "status": 200,
  "message": "Object has been uploaded successfully"
}
```



**Get an Object URL**
```js
const objectURL = await objectStorageClient.getObjectURL({
  bucketName: BUCKET_NAME,
  keyName: 'img/image.jpg',
  expiresIn: 30 // Expires in MS
});

console.log(objectURL);
```

**Response**
```json
{
  "success": true,
  "statusCode": 200,
  "expire": 30,
  "bucket": "company",
  "keyname": "img/image.jpg",
  "url": "https://company.7492760310487df2252ef9441759c9a0.r2.cloudflarestorage.com/img/image.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=f525dac59ab797357113dcf3dedbdbca%2F20240709%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20240709T024330Z&X-Amz-Expires=30&X-Amz-Signature=e4675c9df9e2c7a32989254f87e2cabe006dc057f291a4c231c788d51c10bc29&X-Amz-SignedHeaders=host&x-id=GetObject", // temp url
  "permanentURL": null, // Will appears when after you set a Custom Public Domain
  "message": "Generated signed URL for object"
}
```

**Set a Custom Public Domain**
```js
objectStorageClient.setPublicDomain('https://r2.yourdomain.com');
```
**Get an Object URL with Custom Domain**
```js
const objectURL = await objectStorageClient.getObjectURL({
  bucketName: BUCKET_NAME,
  keyName: 'img/image.jpg',
  expiresIn: 30 // Expires in MS
});

console.log(objectURL);
```
**Response with Custom Domain**
```json
{
  "success": true,
  "statusCode": 200,
  "expire": 30,
  "bucket": "company",
  "keyname": "img/image.jpg",
  "url": "https://company.7492760310487df2252ef9441759c9a0.r2.cloudflarestorage.com/img/image.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=f525dac59ab797357113dcf3dedbdbca%2F20240709%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20240709T024330Z&X-Amz-Expires=30&X-Amz-Signature=e4675c9df9e2c7a32989254f87e2cabe006dc057f291a4c231c788d51c10bc29&X-Amz-SignedHeaders=host&x-id=GetObject",
  "permanentURL": "https://r2.yourdomain.com/img/image.jpg", // <--- Your permanent URL
  "message": "Generated signed URL for object"
}
```
**Check for latency**
```js
const latency = await objectStorageClient.ping();
console.log(latency);
```
**Response the latency**
```json
{ "success": true, "latency": 377, "message": "Ping successful" }
```
**Delete an object from the bucket**
```js
const deleteResponse = await objectStorageClient.deleteObject(
  bucketName: 'your-bucket-name',
  keyName: 'company-video.mp4'
);

console.log(deleteResponse);
```
**Reponse**
```json
{
  "success": true,
  "message": "Object has been deleted",
  "statusCode": 204,
  "attempts": 1,
  "totalRetryDelay": 0,
  "requestId": null,
  "extendedRequestId": null,
  "cfId": null
}
```
**List all the buckets**
```js
const listBuckets = await objectStorageClient.listBuckets();
console.log(listBuckets);
```
**Reponse**
```json
{
  "buckets": [
    {
      "Name": "mybucket",
      "CreationDate": "2024-03-29T09:50:42.147Z"
    }
  ]
}
```
**List all the objects inside the bucket**
```js
const objectsInsideBucket = await bucket.listObjects(bucketName: 'mybucket');
console.log(objectsInsideBucket);
```
**Response**
```json
{
  "objects": [
    {
      "Key": "web/icon/promotion.webp",
      "LastModified": "2024-07-09T00:16:06.865Z",
      "ETag": "\"d18a28a70c56bad694b175842e6985ef\"",
      "Size": 64097,
      "StorageClass": "STANDARD"
    },
    {
      "Key": "employees/John/profile.jpg",
      "LastModified": "2024-05-02T20:25:14.914Z",
      "ETag": "\"c4f8dfd0d8bdbe7dd44374613bf9e8dc\"",
      "Size": 34639,
      "StorageClass": "STANDARD"
    },
    {
      "Key": "marketing/present/company-presentation.mp4",
      "LastModified": "2024-05-02T16:23:07.405Z",
      "ETag": "\"2ae672014edaf6170298f7695abc155d\"",
      "Size": 9526626,
      "StorageClass": "STANDARD"
    }
  ]
}
```

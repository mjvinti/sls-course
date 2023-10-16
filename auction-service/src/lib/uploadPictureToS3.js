const AWS = require('aws-sdk');

const s3 = new AWS.S3();

const uploadPictureToS3 = async (key, body) => {
  const result = await s3
    .upload({
      Body: body,
      Bucket: process.env.AUCTIONS_BUCKET_NAME,
      ContentEncoding: 'base64',
      ContentType: 'image/jpeg',
      Key: key
    })
    .promise();
  return result.Location;
};

module.exports = { uploadPictureToS3 };

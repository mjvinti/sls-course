const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const setAuctionPictureUrl = async (id, pictureUrl) => {
  const params = {
    ExpressionAttributeValues: { ':pictureUrl': pictureUrl },
    Key: { id },
    ReturnValues: 'ALL_NEW',
    TableName: process.env.AUCTIONS_TABLE_NAME,
    UpdateExpression: 'set pictureUrl = :pictureUrl'
  };

  const result = await dynamodb.update(params).promise();
  return result.Attributes;
};

module.exports = { setAuctionPictureUrl };

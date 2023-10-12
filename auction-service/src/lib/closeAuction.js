const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const closeAuction = async (auction) => {
  const params = {
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: { ':status': 'CLOSED' },
    Key: { id: auction.id },
    TableName: process.env.AUCTIONS_TABLE_NAME,
    UpdateExpression: 'set #status = :status'
  };

  const result = await dynamoDb.update(params).promise();
  return result;
};

module.exports = { closeAuction };

const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const getEndedAuctions = async () => {
  const now = new Date(),
    params = {
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': 'OPEN',
        ':now': now.toISOString()
      },
      IndexName: 'statusAndEndDate',
      KeyConditionExpression: '#status = :status AND endingAt <= :now',
      TableName: process.env.AUCTIONS_TABLE_NAME
    };

  const result = await dynamoDb.query(params).promise();
  return result.Items;
};

module.exports = { getEndedAuctions };

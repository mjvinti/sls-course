const AWS = require('aws-sdk');
const createErrors = require('http-errors');
const validator = require('@middy/validator');
const { transpileSchema } = require('@middy/validator/transpile');

const commonMiddleware = require('../lib/commonMiddleware');
const getAuctionsSchema = require('../lib/schemas/getAuctionsSchema');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const getAuctions = async (event, context) => {
  const {
    queryStringParameters: { status }
  } = event;
  let auctions;

  const params = {
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: { ':status': status },
    IndexName: 'statusAndEndDate',
    KeyConditionExpression: '#status = :status',
    TableName: process.env.AUCTIONS_TABLE_NAME
  };

  try {
    const result = await dynamoDb.query(params).promise();

    auctions = result.Items;
  } catch (error) {
    console.error(error);
    throw new createErrors.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auctions, null, 2)
  };
};

module.exports = {
  handler: commonMiddleware(getAuctions).use(
    validator({
      eventSchema: transpileSchema(getAuctionsSchema),
      i18nEnabled: false,
      ajvOptions: { useDefaults: true }
    })
  )
};

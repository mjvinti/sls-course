const AWS = require('aws-sdk');
const { v4: uuid } = require('uuid');
const createErrors = require('http-errors');
const validator = require('@middy/validator');
const { transpileSchema } = require('@middy/validator/transpile');

const commonMiddleware = require('../lib/commonMiddleware');
const createAuctionSchema = require('../lib/schemas/createAuctionSchema');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const createAuction = async (event, context) => {
  const {
      body: { title }
    } = event,
    now = new Date();
  const endDate = new Date();
  endDate.setHours(now.getHours() + 1);

  const auction = {
    createdAt: now.toISOString(),
    endingAt: endDate.toISOString(),
    highestBid: { amount: 0 },
    id: uuid(),
    status: 'OPEN',
    title
  };

  try {
    await dynamoDb
      .put({ TableName: process.env.AUCTIONS_TABLE_NAME, Item: auction })
      .promise();
  } catch (error) {
    console.error(error);
    throw new createErrors.InternalServerError(error);
  }

  return {
    statusCode: 201,
    body: JSON.stringify(auction, null, 2)
  };
};

module.exports = {
  handler: commonMiddleware(createAuction).use(
    validator({
      eventSchema: transpileSchema(createAuctionSchema),
      i18nEnabled: false,
      ajvOptions: { strict: false }
    })
  )
};

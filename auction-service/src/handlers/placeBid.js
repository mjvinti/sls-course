const AWS = require('aws-sdk');
const createErrors = require('http-errors');
const validator = require('@middy/validator');
const { transpileSchema } = require('@middy/validator/transpile');

const commonMiddleware = require('../lib/commonMiddleware');
const placeBidSchema = require('../lib/schemas/placeBidSchema');
const { getAuctionById } = require('./getAuction');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const placeBid = async (event, context) => {
  const {
    body: { amount },
    pathParameters: { id },
    requestContext: {
      authorizer: { email }
    }
  } = event;

  const auction = await getAuctionById(id);

  if (email === auction.seller) {
    throw new createErrors.Forbidden('You cannot bid on your own auctions!');
  }

  if (email === auction.highestBid.bidder) {
    throw new createErrors.Forbidden('You are already the highest bidder!');
  }

  if (auction.status !== 'OPEN') {
    throw new createErrors.Forbidden('You cannot bid on closed auctions!');
  }

  if (amount <= auction.highestBid.amount) {
    throw new createErrors.Forbidden(
      `Your bid must be higher than ${auction.highestBid.amount}!`
    );
  }

  const params = {
    ExpressionAttributeValues: { ':amount': amount, ':bidder': email },
    Key: { id },
    ReturnValues: 'ALL_NEW',
    TableName: process.env.AUCTIONS_TABLE_NAME,
    UpdateExpression:
      'set highestBid.amount = :amount, highestBid.bidder = :bidder'
  };

  let updatedAuction;
  try {
    const result = await dynamoDb.update(params).promise();
    updatedAuction = result.Attributes;
  } catch (error) {
    console.error(error);
    throw new createErrors.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction, null, 2)
  };
};

module.exports = {
  handler: commonMiddleware(placeBid).use(
    validator({
      eventSchema: transpileSchema(placeBidSchema),
      i18nEnabled: false,
      ajvOptions: { strict: false }
    })
  )
};

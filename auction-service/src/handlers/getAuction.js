const AWS = require('aws-sdk');
const createErrors = require('http-errors');

const commonMiddleware = require('../lib/commonMiddleware');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const getAuctionById = async (id) => {
  let auction;
  try {
    const result = await dynamoDb
      .get({
        Key: { id },
        TableName: process.env.AUCTIONS_TABLE_NAME
      })
      .promise();
    auction = result.Item;
  } catch (error) {
    console.error(error);
    throw new createErrors.InternalServerError(error);
  }

  if (!auction) {
    throw new createErrors.NotFound(`Auction with ID "${id}" not found!`);
  }

  return auction;
};

const getAuction = async (event, context) => {
  const {
    pathParameters: { id }
  } = event;

  const auction = await getAuctionById(id);

  return {
    statusCode: 200,
    body: JSON.stringify(auction, null, 2)
  };
};

module.exports = { handler: commonMiddleware(getAuction), getAuctionById };

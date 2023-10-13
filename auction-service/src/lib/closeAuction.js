const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

const closeAuction = async (auction) => {
  const params = {
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: { ':status': 'CLOSED' },
    Key: { id: auction.id },
    TableName: process.env.AUCTIONS_TABLE_NAME,
    UpdateExpression: 'set #status = :status'
  };

  await dynamoDb.update(params).promise();

  const {
    title,
    seller,
    highestBid: { amount, bidder }
  } = auction;

  const notifySeller = sqs
    .sendMessage({
      QueueUrl: process.env.MAIL_QUEUE_URL,
      MessageBody: JSON.stringify({
        subject: 'Your Item has been sold',
        recipient: seller,
        body: `Woohoo! Your item "${title}" has been sold for $${amount}.`
      })
    })
    .promise();

  const notifyBidder = sqs
    .sendMessage({
      QueueUrl: process.env.MAIL_QUEUE_URL,
      MessageBody: JSON.stringify({
        subject: 'You won an auction!',
        recipient: bidder,
        body: `What a great deal! You got yourself a "${title}" for $${amount}.`
      })
    })
    .promise();

  return Promise.all([notifySeller, notifyBidder]);
};

module.exports = { closeAuction };

const createErrors = require('http-errors');
const httpErrorHandler = require('@middy/http-error-handler');
const middy = require('@middy/core');

const { getAuctionById } = require('./getAuction');
const { uploadPictureToS3 } = require('../lib/uploadPictureToS3');

const uploadAuctionPicture = async (event, context) => {
  const {
    body,
    pathParameters: { id }
  } = event;

  const auction = await getAuctionById(id);
  const base64 = body.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');

  try {
    const uploadToS3Result = await uploadPictureToS3(
      auction.id + '.jpg',
      buffer
    );
    console.log(uploadToS3Result);
  } catch (error) {
    console.error(error);
    throw new createErrors.InternalServerError(error);
  }

  return { statusCode: 200, body: JSON.stringify({}) };
};

module.exports = {
  handler: middy(uploadAuctionPicture).use(httpErrorHandler())
};

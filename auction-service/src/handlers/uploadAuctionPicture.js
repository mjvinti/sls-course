const createErrors = require('http-errors');
const httpErrorHandler = require('@middy/http-error-handler');
const middy = require('@middy/core');
const validator = require('@middy/validator');
const { transpileSchema } = require('@middy/validator/transpile');

const { getAuctionById } = require('./getAuction');
const { setAuctionPictureUrl } = require('../lib/setAuctionPictureUrl');
const { uploadPictureToS3 } = require('../lib/uploadPictureToS3');
const uploadAuctionPictureSchema = require('../lib/schemas/uploadAuctionPictureSchema');

const uploadAuctionPicture = async (event, context) => {
  const {
    body,
    requestContext: {
      authorizer: { email }
    },
    pathParameters: { id }
  } = event;

  if (auction.seller !== email) {
    throw new createErrors.Forbidden('You are not the seller of this auction!');
  }

  const auction = await getAuctionById(id);
  const base64 = body.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');

  let updatedAuction;
  try {
    const pictureUrl = await uploadPictureToS3(auction.id + '.jpg', buffer);
    updatedAuction = await setAuctionPictureUrl(auction.id, pictureUrl);
  } catch (error) {
    console.error(error);
    throw new createErrors.InternalServerError(error);
  }

  return { statusCode: 200, body: JSON.stringify(updatedAuction) };
};

module.exports = {
  handler: middy(uploadAuctionPicture)
    .use(httpErrorHandler())
    .use(
      validator({
        eventSchema: transpileSchema(uploadAuctionPictureSchema),
        i18nEnabled: false,
        ajvOptions: { useDefaults: true }
      })
    )
};

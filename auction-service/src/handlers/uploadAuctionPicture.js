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

  const uploadToS3Result = await uploadPictureToS3(auction.id + '.jpg', buffer);
  console.log(uploadToS3Result);

  return { statusCode: 200, body: JSON.stringify({}) };
};

module.exports = { handler: uploadAuctionPicture };

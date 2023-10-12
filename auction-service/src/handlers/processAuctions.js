const createErrors = require('http-errors');

const { closeAuction } = require('../lib/closeAuction');
const { getEndedAuctions } = require('../lib/getEndedAuctions');

const processAuctions = async (event, context) => {
  try {
    const auctionsToClose = await getEndedAuctions();
    const closePromises = auctionsToClose.map((auction) =>
      closeAuction(auction)
    );
    await Promise.all(closePromises);

    return { closed: closePromises.length };
  } catch (error) {
    console.error(error);
    throw new createErrors.InternalServerError(error);
  }
};

module.exports = { handler: processAuctions };

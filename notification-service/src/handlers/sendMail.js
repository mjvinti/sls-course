const sendMail = async (event, conext) => {
  console.log(event);
  return event;
};

module.exports = { handler: sendMail };

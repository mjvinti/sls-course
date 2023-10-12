const AWS = require('aws-sdk');

const ses = new AWS.SES({ region: 'us-east-1' });

const sendMail = async (event, conext) => {
  const params = {
    Source: 'email',
    Destination: {
      ToAddresses: ['email']
    },
    Message: {
      Body: {
        Text: {
          Data: 'Hello There, Obi Wan Kenobi!'
        }
      },
      Subject: {
        Data: 'Test Mail'
      }
    }
  };

  try {
    const result = await ses.sendEmail(params).promise();
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  }
};

module.exports = { handler: sendMail };

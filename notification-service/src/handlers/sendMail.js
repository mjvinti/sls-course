const AWS = require('aws-sdk');

const ses = new AWS.SES({ region: 'us-east-1' });

const sendMail = async (event, conext) => {
  const record = event.Records[0];
  console.log('record processing', record);

  const email = JSON.parse(record.body);
  const { subject, body, recipient } = email;

  const params = {
    Source: 'email',
    Destination: {
      ToAddresses: [recipient]
    },
    Message: {
      Body: {
        Text: {
          Data: body
        }
      },
      Subject: {
        Data: subject
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

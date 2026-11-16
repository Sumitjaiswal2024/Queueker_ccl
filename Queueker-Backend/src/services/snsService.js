const { SNSClient, SubscribeCommand, PublishCommand } = require('@aws-sdk/client-sns');

const snsClient = new SNSClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

const TOPIC_ARN = process.env.SNS_TOPIC_ARN;

/**
 * Subscribes customer's email with a FilterPolicy so they only get messages for their token.
 */
async function subscribeEmailToToken(email, tokenId) {
  if (!TOPIC_ARN || !email) return;

  try {
    const command = new SubscribeCommand({
      TopicArn: TOPIC_ARN,
      Protocol: 'email',
      Endpoint: email,
      Attributes: {
        FilterPolicy: JSON.stringify({
          tokenId: [tokenId.toString()]
        })
      }
    });
    await snsClient.send(command);
    console.log(`[SNS] Subscription sent for ${email} on token ${tokenId}`);
  } catch (err) {
    console.warn('[SNS] Subscription error:', err.message);
  }
}

/**
 * Publishes a message to SNS when the customer's token is called.
 */
async function notifyTokenServing(token, queueName) {
  if (!TOPIC_ARN || !token.email) return;

  try {
    const command = new PublishCommand({
      TopicArn: TOPIC_ARN,
      Subject: `Queueker: Token #${token.tokenNumber} is Now Serving!`,
      Message: `Hello ${token.name},\n\nYour token #${token.tokenNumber} for "${queueName || 'Queue'}" is now being served! Please proceed to the service desk.\n\nThank you for using Queueker.`,
      MessageAttributes: {
        tokenId: {
          DataType: 'String',
          StringValue: token._id.toString()
        }
      }
    });
    await snsClient.send(command);
    console.log(`[SNS] Serving notification sent for token #${token.tokenNumber}`);
  } catch (err) {
    console.warn('[SNS] Publish error:', err.message);
  }
}

module.exports = { subscribeEmailToToken, notifyTokenServing };
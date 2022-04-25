/* eslint-disable global-require */
const authToken = process.env.TWILIO_AUTH_TOKEN;
const accountSid = process.env.TWILIO_ACCOUNT_SID;

class SMS {
  constructor(message, to) {
    this.client = require('twilio')(accountSid, authToken);
    this.message = message;
    this.to = to;
  }

  send() {
    console.log(this.message, this.to);
    return this.client.messages.create({
      body: `${this.message}`,
      messagingServiceSid: 'MG7513662ed6b35edd1e2ed26c5c6e612a',
      to: `+2${this.to}`,
    });
  }
}

module.exports = SMS;

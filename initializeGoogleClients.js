const {google} = require('googleapis');

let forms, sheets;
const initializeGoogleClients = (req) => {
  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials(req.user.tokens);
  forms = google.forms({ version: 'v1', auth: oAuth2Client });
  sheets = google.sheets({ version: 'v4', auth: oAuth2Client });
  return {"forms" : forms, "sheets" : sheets, "oAuth2Client" : oAuth2Client};
};

module.exports = { initializeGoogleClients, forms, sheets };




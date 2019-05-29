# Twilio-SMS-node-data-spam
server.js sends SMS with express server in  response to SMS keyword requests to a Twilio phone number

daily.js sends out informational messages once a day 

Both files are set up to run with Twilio's Notify service, which needs to be configured to send and receive webhooks for your Twilio phone number

clone or download

`npm install`

configTemplate.js needs to be updated with personal API keys and twillio access tokens and more precise LatLong for dark sky query and renamed to config.js

`node server`
`node daily`


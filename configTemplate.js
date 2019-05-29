const TWILIO_MESSAGING_SERVICE_SID = '';
const TWILIO_NOTIFY_SERVICE_SID = '';
const DARKSKY_KEY = '';
const DARKSKY_LATLONG = '28.,-80.';
const TWILIO_ACCOUNT = '';
const TWILIO_TOKEN = '';
const TWILIO_FROM = '+';
const NUMBERS = [''];
const WUNDERGROUND_KEY = '';
const WU_OPTIONS = {
    uri: 'https://api.weather.com/v2/pws/observations/current',
    qs: {
        stationId: 'KFLMELBO333',
        units: 'e',
        format: 'json',
        apiKey: WUNDERGROUND_KEY
    },
    headers: {
        'User-Agent': 'Request'
    },
    json: true // Automatically parses the JSON string in the response
};
const WUSUMMARY_OPTIONS = {
    uri: 'https://api.weather.com/v2/pws/dailysummary/7day',
    qs: {
        stationId: 'KFLMELBO333',
        units: 'e',
        format: 'json',
        apiKey: WUNDERGROUND_KEY
    },
    headers: {
        'User-Agent': 'Request'
    },
    json: true // Automatically parses the JSON string in the response

};
const LAUNCH_OPTIONS = {
    uri: 'https://spacelaunchnow.me/api/3.3.0/launch/upcoming',
    qs: {
        search: 'FL',
        limit: '2'
    },
        headers: {
        'User-Agent': 'Request'
    },
    json: true // Automatically parses the JSON string in the response
};
const DS_OPTIONS = {
    uri: `https://api.darksky.net/forecast/${DARKSKY_KEY}/${DARKSKY_LATLONG}`,
    qs: {
        exclude: 'minutely&hourly&flags',
    },
        headers: {
        'User-Agent': 'Request'
    },
    json: true // Automatically parses the JSON string in the response
};
module.exports = {
    TWILIO_MESSAGING_SERVICE_SID,
    TWILIO_NOTIFY_SERVICE_SID,
    DARKSKY_KEY,
    DARKSKY_LATLONG,
    TWILIO_ACCOUNT,
    TWILIO_TOKEN,
    TWILIO_FROM,
    NUMBERS,
    WUNDERGROUND_KEY,
    WU_OPTIONS,
    WUSUMMARY_OPTIONS,
    LAUNCH_OPTIONS,
    DS_OPTIONS,
    toCard
};

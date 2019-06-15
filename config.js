function moonEmoji(phase) {
    switch(phase) {
      case 'New moon':
        emoji = '🌑';
        break;
      case 'Waxing crescent':
        emoji = '🌒';
        break;
      case 'First Quarter':
        emoji = '🌓';
        break;
      case 'Waxing gibbous':
        emoji = '🌔';
        break;
      case 'Full moon':
        emoji = '🌕';
        break;
      case 'Waning gibbous':
        emoji = '🌖';
        break;
      case 'Last Quarter':
        emoji = '🌗';
        break;
      case 'Waning crescent':
        emoji = '🌘';
        break;
      default:
        emoji = '';
        break;
    }
    return emoji;
  }

const WU_OPTIONS = {
    uri: 'https://api.weather.com/v2/pws/observations/current',
    qs: {
        stationId: 'KFLMELBO333',
        units: 'e',
        format: 'json',
        apiKey: process.env.WUNDERGROUND_KEY
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
        apiKey: process.env.WUNDERGROUND_KEY
    },
    headers: {
        'User-Agent': 'Request'
    },
    json: true // Automatically parses the JSON string in the response

};
const LAUNCH_OPTIONS = {
    uri: 'https://spacelaunchnow.me/api/3.3.0/launch/upcoming',
    qs: {
        search: 'Space Launch Complex FL',
        limit: '2'
    },
        headers: {
        'User-Agent': 'Request'
    },
    json: true // Automatically parses the JSON string in the response
};
const DS_OPTIONS = {
    uri: `https://api.darksky.net/forecast/${process.env.DARKSKY_KEY}/${process.env.DARKSKY_LATLONG}`,
    qs: {
        exclude: 'minutely&hourly&flags',
    },
        headers: {
        'User-Agent': 'Request'
    },
    json: true // Automatically parses the JSON string in the response
};

const HERE_OPTIONS = {
    uri: `https://weather.api.here.com/weather/1.0/report.json?name=32935&product=forecast_astronomy&app_id=${process.env.HERE_APPID}&app_code=${process.env.HERE_APPCODE}`,
        headers: {
        'User-Agent': 'Request'
    },
    json: true // Automatically parses the JSON string in the response
};

module.exports = {
    WU_OPTIONS,
    WUSUMMARY_OPTIONS,
    LAUNCH_OPTIONS,
    DS_OPTIONS,
    HERE_OPTIONS
};

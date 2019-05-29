const http = require('http');
const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');
DarkSkyApi = require('dark-sky-api');
const config = require('./config');
const request = require('request');
DarkSkyApi.apiKey = process.env.DARKSKY_KEY;
var card = new Array();
var toCard = (degrees) => {
card =  ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE','S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N'];
    var index = degrees/22.5;
    return card[index];
};
var dateFormat = require('dateformat');
const position = {
  latitude: 28.11439905797519, 
  longitude: -80.65110467074518
};
DarkSkyApi.proxy = true; 
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason)
})
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/sms', (req, res) => {

  const twiml = new MessagingResponse();
  res.writeHead(200, {'Content-Type': 'text/xml'});
  console.log(req.body.From);
  console.log(req.body.Body);
  if (req.body.Body.toLowerCase().includes('hello') || req.body.Body.toLowerCase().includes('hi'))
  {
    twiml.message('Hi!');
    res.end(twiml.toString());
  }
  else if (req.body.Body.toLowerCase().includes('bye'))
  {
    twiml.message('Goodbye');
    res.end(twiml.toString());
  }
  else if (req.body.Body.toLowerCase().includes('?'))
  {
    twiml.message("'Current' for current conditions. 'Summary' for today's summary. Forecast' for tomorrow's info. 'Launch' for upcoming launch info.");
    res.end(twiml.toString());
  }
  
  else if (req.body.Body.toLowerCase().includes('launch'))
  {
    request(process.env.LAUNCH_OPTIONS, (err, response, data) => {
      if (err) { return console.log(err); }
      var launchDate = new Date();
      if (data.results[0].status.id == '3') {
        var success = 1
      }
      else {
        var success = 0
      };

      twiml.message(`
Next launch at Cape Canaveral, FL: ${dateFormat(data.results[success].net, "ddd m/d 'at' h:MM t")}
Rocket: ${data.results[success].rocket.configuration.name}
Launch Agency: ${data.results[success].rocket.configuration.launch_service_provider}
Mission: ${data.results[success].mission.name}
Status: ${data.results[success].status.name}
`);

      res.end(twiml.toString());
      console.log(twiml.toString());
    });
  }
  else if (req.body.Body.toLowerCase().includes('forecast'))
  {
    const getInfo = async () => {
    await DarkSkyApi.loadForecast(position)
      .then((dsData) => {
        var forecastDate = new Date();
        twiml.message(`
Forecast for ${dateFormat(dsData.daily.data[1].time*1000, "ddd m/d")}:
${dsData.daily.data[1].summary}
Sunrise: ${dateFormat(dsData.daily.data[1].sunriseTime*1000, "h:mm")}
Sunset: ${dateFormat(dsData.daily.data[1].sunsetTime*1000, "h:mm")}
Moonphase: ${dsData.daily.data[1].moonPhase}
Temperature: ${dsData.daily.data[1].temperatureLow} - ${dsData.daily.data[0].temperatureHigh}
Feels Like: ${dsData.daily.data[1].apparentTemperatureLow} - ${dsData.daily.data[0].apparentTemperatureHigh} (at ${dateFormat(dsData.daily.data[1].apparentTemperatureHighTime*1000, "h:mm")})
Rain Chance: ${dsData.daily.data[1].precipProbability*100}%
Wind Speed: ${dsData.daily.data[1].windSpeed} mph
UV Index: ${dsData.daily.data[1].uvIndex}`);
        });
      
    res.end(twiml.toString());
    console.log(twiml.toString());
    }
    getInfo();
  }
  else if (req.body.Body.toLowerCase().includes('current'))
  {
    request(process.env.WU_OPTIONS, (err, response, data) => {
      if (err) { return console.log(err); }
      var wind = data.observations[0].winddir;
      var windCard = toCard(wind);
      twiml.message(`
Current from WU Station ${data.observations[0].stationID}
Temp: ${data.observations[0].imperial.temp}
Heat Index: ${data.observations[0].imperial.heatIndex}
Wind Speed: ${data.observations[0].imperial.windSpeed} mph
Wind Direction: ${data.observations[0].winddir}
Rain Today: ${data.observations[0].imperial.precipTotal} inches
Pressure: ${data.observations[0].imperial.pressure} inHg
Humidity: ${data.observations[0].humidity}%`);

      res.end(twiml.toString());
      console.log(twiml.toString());

    });
  }
  else if (req.body.Body.toLowerCase().includes('summary'))
  {
    request(process.env.WUSUMMARY_OPTIONS, (err, response, data) => {
      if (err) { return console.log(err); }
      twiml.message(`
Today's summary from WU Station ${data.summaries[6].stationID}
Heat index high: ${data.summaries[6].imperial.heatindexHigh}
Wind gust high: ${data.summaries[6].imperial.windgustHigh} mph 
`);
      res.end(twiml.toString());
      console.log(twiml.toString());
    });
  }
  else
  {
    twiml.message("Keyword not recognized. 'Current' for current conditions. 'Summary' for today's summary. 'Forecast' for tomorrow's info.");
    res.end(twiml.toString());

  };

});


http.createServer(app).listen(1337, () => {
  console.log('Express server listening on port 1337');
});

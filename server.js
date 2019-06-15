const http = require('http');
const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');
DarkSkyApi = require('dark-sky-api');
const config = require('./config');
const request = require('request');
DarkSkyApi.apiKey = process.env.DARKSKY_KEY;
var card = new Array();
function toCard(degrees) {
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
  
  //hi
  
  if (req.body.Body.toLowerCase().includes('hello') || req.body.Body.toLowerCase().includes('hi'))
  {
    twiml.message('Hi!');
    res.end(twiml.toString());
  }
  
  //bye
  
  else if (req.body.Body.toLowerCase().includes('bye'))
  {
    twiml.message('Goodbye');
    res.end(twiml.toString());
  }
  
  //?
  
  else if (req.body.Body.toLowerCase().includes('?'))
  {
    twiml.message(`
'Current' for current conditions. 
'Summary' for today's summary. 
'Forecast' for tomorrow's info. You can also include either 'today' or 'tomorrow' (default)
'Launch' for info on the next Space Center launch.
'Moon' for current moon phase and rise and set.`);
    res.end(twiml.toString());
  }
  
  //launch
  
  else if (req.body.Body.toLowerCase().includes('launch'))
  {
    request(config.LAUNCH_OPTIONS, (err, response, data) => {
      if (err) { return console.log(err); }
      var launchDate = new Date();
      //this endpoint will return launches with status "success"  to avoid that we will look at index 1 if index 0 returns success 
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
  
  //forecast
  
  else if (req.body.Body.toLowerCase().includes('forecast'))
  {
    const getInfo = async () => {
    await DarkSkyApi.loadForecast(position)
      .then((dsData) => {
        var forecastDate = new Date();
if(req.body.Body.toLowerCase().includes('today'))
{var forecastDay = 0}
else 
{var forecastDay = 1}
        twiml.message(`
Forecast for ${dateFormat(dsData.daily.data[forecastDay].time*1000, "ddd m/d")}:
${dsData.daily.data[forecastDay].summary}
Sunrise: ${dateFormat(dsData.daily.data[forecastDay].sunriseTime*1000, "h:mm")}
Sunset: ${dateFormat(dsData.daily.data[forecastDay].sunsetTime*1000, "h:mm")}
Moonphase: ${dsData.daily.data[forecastDay].moonPhase}
Temperature: ${dsData.daily.data[forecastDay].temperatureLow} - ${dsData.daily.data[forecastDay].temperatureHigh}
Feels Like: ${dsData.daily.data[forecastDay].apparentTemperatureLow} - ${dsData.daily.data[forecastDay].apparentTemperatureHigh} (at ${dateFormat(dsData.daily.data[forecastDay].apparentTemperatureHighTime*1000, "h:mm")})
Rain Chance: ${dsData.daily.data[forecastDay].precipProbability*100}%
Wind Speed: ${dsData.daily.data[forecastDay].windSpeed} mph
UV Index: ${dsData.daily.data[forecastDay].uvIndex}`);
        });
      
    res.end(twiml.toString());
    console.log(twiml.toString());
    }
    getInfo();
  }
  
  //current
  
  else if (req.body.Body.toLowerCase().includes('current'))
  {
    request(config.WU_OPTIONS, (err, response, data) => {
      if (err) { return console.log(err); }
      var wind = data.observations[0].winddir;
      console.log(wind);
      var windCard = toCard(wind);
      console.log(windCard);
      twiml.message(`
Current from WU Station ${data.observations[0].stationID}
Temp: ${data.observations[0].imperial.temp}
Heat Index: ${data.observations[0].imperial.heatIndex}
Wind Speed: ${data.observations[0].imperial.windSpeed} mph
Wind Direction: ${windCard}(${data.observations[0].winddir})
Rain Today: ${data.observations[0].imperial.precipTotal} inches
Pressure: ${data.observations[0].imperial.pressure} inHg
Humidity: ${data.observations[0].humidity}%`);

      res.end(twiml.toString());
      console.log(twiml.toString());

    });
  }
  
  //summary
  
  else if (req.body.Body.toLowerCase().includes('summary'))
  {
    request(config.WUSUMMARY_OPTIONS, (err, response, data) => {
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
  
  //moon
  
  else if (req.body.Body.toLowerCase().includes('moon'))
  {
    request(config.HERE_OPTIONS, (err, response, data) => {
      if (err) { return console.log(err); }
      twiml.message(`
Current moon phase: ${data.astronomy.astronomy[0].moonPhase*100}%
${config.moonEmoji(data.astronomy.astronomy[0].moonPhaseDesc)}${data.astronomy.astronomy[0].moonPhaseDesc}
Moon Rise: ${data.astronomy.astronomy[0].moonrise}
Moon Set: ${data.astronomy.astronomy[0].moonset}
`);
      res.end(twiml.toString());
      console.log(twiml.toString());
    });
  }
  
  //unrecognized
  
  else
  {
    twiml.message(`
Keyword not recognized. 
'Current' for current conditions. 
'Summary' for today's summary. 
'Forecast' for tomorrow's info. You can also include either 'today' or 'tomorrow' (default)
'Launch' for info on the next Space Center launch.
'Moon' for current moon phase and rise and set.`);
    res.end(twiml.toString());

  };

});

//create server

http.createServer(app).listen(process.env.PORT, () => {
  console.log(`Express server listening on port ${process.env.PORT}`);
});

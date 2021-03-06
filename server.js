const http = require('http');
const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');
const config = require('./config');
const chrono = require('chrono-node');
const request = require('request-promise');

var card = new Array();
function toCard(degrees) {
card =  ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE','S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N'];
    var index = degrees/22.5;
    return card[index];
};
var dateFormat = require('dateformat');
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason)
})
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

//configure app functions on /sms path
app.post('/sms', (req, res) => {
  text = req.body.Body.toLowerCase();
  const twiml = new MessagingResponse();
  res.writeHead(200, {'Content-Type': 'text/xml'});
  console.log(req.body.From);
  console.log(req.body);
  console.log(text);
  
  //hi
  
  if (text.includes('hello') || text.includes('hi'))
  {
    twiml.message('Hey there!');
    res.end(twiml.toString());
  }
  
  //bye
  
  else if (text.includes('bye'))
  {
    twiml.message('Goodbye');
    res.end(twiml.toString());
  }
  
  //?
  
  else if (text.includes('?') || text.includes('keyword'))
  {
    twiml.message(config.keywordString);
    res.end(twiml.toString());
  }
  
  //launch
  
  else if (text.includes('launch'))
  {
    request(config.LAUNCH_OPTIONS, (err, response, data) => {})
      .then(function(data) {
        if (data.results[0].status.id==6 || data.results[0].status.id==3){success = 1}
        else {success=0}
      twiml.message(`
Next launch at Cape Canaveral, FL: ${dateFormat(data.results[success].net, "ddd m/d 'at' h:MM t")}
Rocket: ${data.results[success].rocket.configuration.name}
Launch Agency: ${data.results[success].rocket.configuration.launch_service_provider}
Mission: ${data.results[success].mission.name}
Status: ${data.results[success].status.name}
`);
      })
      .then(function() {
      res.end(twiml.toString());
      console.log(twiml.toString());
    });
  }
  
  //forecast
  
  else if (text.includes('forecast'))
  {
    if (chrono.parseDate(text) == null) {//if there are no other recognized dates default to today
      request(config.DS_OPTIONS, (err, response, dsData) => {})
      .then(function(dsData) {
      twiml.message(`
Forecast for ${dateFormat(dsData.daily.data[0].time*1000, "ddd m/d")}:
${dsData.daily.data[0].summary}
Sunrise: ${dateFormat(dsData.daily.data[0].sunriseTime*1000, "h:mm")}
Sunset: ${dateFormat(dsData.daily.data[0].sunsetTime*1000, "h:mm")}
Moonphase: ${Math.round(dsData.daily.data[0].moonPhase)*100}
Temperature: ${dsData.daily.data[0].temperatureLow} - ${dsData.daily.data[0].temperatureHigh}
Feels Like: ${dsData.daily.data[0].apparentTemperatureLow} - ${dsData.daily.data[0].apparentTemperatureHigh} (at ${dateFormat(dsData.daily.data[0].apparentTemperatureHighTime*1000, "h:mm")})
Rain Chance: ${dsData.daily.data[0].precipProbability*100}%
Wind Speed: ${dsData.daily.data[0].windSpeed} mph
UV Index: ${dsData.daily.data[0].uvIndex}
powered by darksky.net`);
      })
      .then(function() {
        res.end(twiml.toString());
        console.log(twiml.toString());
      })
    }
    else {//set request-promise options to time machine endpoint and pass sms request body to chrono.parseDate to concat into url
      request(config.dsTimeMachine(text), (err, response, dsData) => {})
      .then(function(dsData) {
        twiml.message(`
Forecast for ${dateFormat(dsData.daily.data[0].time*1000, "ddd m/d")}:
${dsData.daily.data[0].summary}
Sunrise: ${dateFormat(dsData.daily.data[0].sunriseTime*1000, "h:mm")}
Sunset: ${dateFormat(dsData.daily.data[0].sunsetTime*1000, "h:mm")}
Moonphase: ${Math.round(dsData.daily.data[0].moonPhase)*100}
Temperature: ${dsData.daily.data[0].temperatureLow} - ${dsData.daily.data[0].temperatureHigh}
Feels Like: ${dsData.daily.data[0].apparentTemperatureLow} - ${dsData.daily.data[0].apparentTemperatureHigh} (at ${dateFormat(dsData.daily.data[0].apparentTemperatureHighTime*1000, "h:mm")})
Rain Chance: ${dsData.daily.data[0].precipProbability*100}%
Wind Speed: ${dsData.daily.data[0].windSpeed} mph
UV Index: ${dsData.daily.data[0].uvIndex}
powered by darksky.net`);
        })
        .then(function() {
          res.end(twiml.toString());
          console.log(twiml.toString());
        })  
    }    
  }
 
  //current
  
  else if (text.includes('current'))
  {
    request(config.WU_OPTIONS, (err, response, data) => {})
    .then(function(data) {
    wind = toCard(data.observations[0].winddir);
      twiml.message(`
Current from WU Station ${data.observations[0].stationID}
Temp: ${data.observations[0].imperial.temp}
Heat Index: ${data.observations[0].imperial.heatIndex}
Wind Speed: ${data.observations[0].imperial.windSpeed} mph
Wind Direction: ${wind}(${data.observations[0].winddir})
Rain Today: ${data.observations[0].imperial.precipTotal} inches
Pressure: ${data.observations[0].imperial.pressure} inHg
Humidity: ${data.observations[0].humidity}%`);
    })
    .then(function() {
      res.end(twiml.toString());
      console.log(twiml.toString());
    })
  }
  
  //summary
  
  else if (text.includes('summary'))
  {
    request(config.WUSUMMARY_OPTIONS, (err, response, data) => {})
    .then(function(data) {//index 6 is today
     wind = toCard(data.summaries[6].winddirAvg);
     twiml.message(`
Today's summary from WU Station ${data.summaries[6].stationID}
Temperature high: ${data.summaries[6].imperial.tempHigh}
Heat index high: ${data.summaries[6].imperial.heatindexHigh}
Wind gust high: ${data.summaries[6].imperial.windgustHigh} mph
Wind speed average: ${data.summaries[6].imperial.windspeedAvg} mph
Average wind direction: ${wind} (${data.summaries[6].winddirAvg})
Precipitation total: ${data.summaries[6].imperial.precipTotal} inches of rain
`)
    })
    .then(function() {
      res.end(twiml.toString());
      console.log(twiml.toString());
    })
  }
  
  //moon
  
  else if (text.includes('moon'))
  {
    request(config.HERE_OPTIONS, (err, response, data) => {})
    .then(function(data) {
        twiml.message(`
Current moon phase: ${Math.round(data.astronomy.astronomy[0].moonPhase*100)}%
${config.moonEmoji(data.astronomy.astronomy[0].moonPhaseDesc)}${data.astronomy.astronomy[0].moonPhaseDesc}
Moon Rise: ${data.astronomy.astronomy[0].moonrise}
Moon Set: ${data.astronomy.astronomy[0].moonset}
`)   
    })
      .then(function() {
      res.end(twiml.toString());
      console.log(twiml.toString());
    })
  }
  
//mysportsfeeds

  else if (text.includes('baseball')) 
  {
    request(config.msfNewDate('today'), (err, response, data) => { })
      .then(function (data) {
        console.log(data.games[0].schedule.id);
        twiml.message(data.games[0].schedule.id);
      })
      .then(function () {
        res.end(twiml.toString());
      })
  }

  //unrecognized
  
  else
  {
    twiml.message(`
Keyword not recognized. 
${config.keywordString}`);
    res.end(twiml.toString());
  };
});

//create server

http.createServer(app).listen(process.env.PORT, () => {
  console.log(`Express server listening on port ${process.env.PORT}`);
});
var express = require("express");
var app = express();
var request = require("request");
var weather_get = require("./weather_get.js");
var mqtt = require("mqtt");
var options = {
  host: "13.125.207.178",
  port: 1883,
  protocol: "mqtt",
};

//======================================================================================
const client = mqtt.connect(options);

app.use(express.json());

client.on("connect", () => {
  console.log("connected : " + client.connected);
});

client.on("error", (error) => {
  console.log("Can't connect : " + error);
});

//=====================================================================================
const { getXY } = weather_get;
const { getDustData } = weather_get;
const { getWeatherData } = weather_get;

client.subscribe("station");
client.on("message", async (topic, message, packet) => {
  //	console.log("message is " + JSON.parse(message))
  //	console.log("topic is " + topic)
  var station = JSON.parse(message);
  //	console.log(station)
  var loc = getXY(station.province, station.city, station.town);

  var dust = await getDustData(station.city);
  var weather = await getWeatherData(loc.x, loc.y);

  console.log(JSON.stringify(dust));
  console.log(JSON.stringify(weather));

  client.publish("DustEvent", JSON.stringify(dust));
  client.publish("WeatherEvent", JSON.stringify(weather));
});

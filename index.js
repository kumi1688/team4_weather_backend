const { getXY, getDustData, getAllData } = require("./weather_get");
var mqtt = require("mqtt");
var options = {
  host: "13.125.207.178",
  port: 1883,
  protocol: "mqtt",
};

const client = mqtt.connect(options);

client.on("connect", () => {
  console.log("mqtt 연결됨");
});

client.on("error", (error) => {
  console.log("mqtt 연결 끊김 : " + error);
});

client.subscribe("req/weather/weather");
client.subscribe("req/weather/dust");

const fs = require("fs");
client.on("message", async (topic, message, packet) => {
  console.log("topic :", topic);
  if (topic === "req/weather/weather") {
    const { province, city, town } = JSON.parse(message);
    const loc = getXY(province, city, town);
    const weatherData = await getAllData(loc.x, loc.y);

    let data = [];
    weatherData.map((wd) => wd.map((w) => (data = [...data, w.data])));
    data = data.filter((d) => d.response.body);
    data = data.map((d) => d.response.body.items);

    // console.dir(data);
    client.publish("res/weather/weather", JSON.stringify(data));
  } else if (topic === "req/weather/dust") {
    const { station } = JSON.parse(message);
    const dust = await getDustData(station);
    client.publish("res/weather/dust", JSON.stringify(dust));
  }
});

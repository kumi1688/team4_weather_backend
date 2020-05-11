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

client.subscribe("req/weather/weather"); // 날씨 받아오기
client.subscribe("req/weather/dust"); // 미세먼지 받아오기

const fs = require("fs");
client.on("message", async (topic, message, packet) => {
  if (topic === "req/weather/weather") { // 날씨 정보 요청에 대한 응답
    const { province, city, town } = JSON.parse(message); // 도, 시, 마을 정보 분해할당
    const loc = getXY(province, city, town);  // 도,시,마을에 대한 X,Y 좌표 찾기
    const weatherData = await getAllData(loc.x, loc.y); // 공공데이터 포털에서 X,Y 에 해당하는 날씨 정보 받아오기

    // 공공데이터 포텔에서 받아온 데이터 중에서 실제 데이터 부분만 추출하기
    let data = [];
    weatherData.map((wd) => wd.map((w) => (data = [...data, w.data])));
    data = data.filter((d) => d.response.body);
    data = data.map((d) => d.response.body.items);

    client.publish("res/weather/weather", JSON.stringify(data)); // 추출한 날씨 데이터 전송하기
  } else if (topic === "req/weather/dust") { // 미세먼지 자료 요청에 대한 응답
    const { station } = JSON.parse(message); // 관측소 정보 분해할당 
    const dust = await getDustData(station); // 전달받은 관측소에 해당하는 미세먼지 정보 공공데이터 포털에서 받아오기
    client.publish("res/weather/dust", JSON.stringify(dust)); // 데이터 BackEnd로 전송하기
  }
});

const axios = require("axios");
const weatherStation = require("./weatherStation.json");

// XY 정보 가져오기 (동네예보)
function getXY(province, city, town) {
  const result = weatherStation.find(
    (ws) =>
      ws["1단계"] === province && ws["2단계"] === city && ws["3단계"] === town
  );
  return { x: result["격자 X"], y: result["격자 Y"] };
}

//미세먼지 정보 가져오기
async function getDustData(station) {
  const url = `http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?stationName=${encodeURI(
    station
  )}&dataTerm=month&pageNo=1&numOfRows=10&ServiceKey=rtVVwR6hnZErSceeqbvBPb9%2B6039VEkeewcHjC60EFIUnvJ%2FX%2BZ92jvi8DmR0mgX7GyvXlEE%2BV9pUnGMGQqKUA%3D%3D&ver=1.3&_returnType=json`;
  const result = await axios.get(url);
  return result.data;
}

function numberPad(n, width) {
  n = n + "";
  return n.length >= width ? n : new Array(width - n.length + 1).join("0") + n;
}

var now = new Date();
var nowDate = `${now.getFullYear()}${numberPad(
  now.getMonth() + 1,
  2
)}${numberPad(now.getDate(), 2)}`;
var nowTime = now.getHours();
if (nowTime >= 5 && nowTime < 8) _hours = "0500";
else if (nowTime >= 8 && nowTime < 11) _hours = "0800";
else if (nowTime >= 11 && nowTime < 14) _hours = "1100";
else if (nowTime >= 14 && nowTime < 17) _hours = "1400";
else if (nowTime >= 17 && nowTime < 20) _hours = "1700";
else if (nowTime >= 20 && nowTime < 23) _hours = "0800";
else if (nowTime >= 23) _hours = "2300";
else _hours = "0200";

// 특정 위치의 받아올 수 있는 모든 데이터 받아오기
function getAvailableDay() {
  const now = new Date();
  let today, yesterday;

  // 이번달이 첫 달, 첫 날이면 지난해 마지막 달 마지막 날 데이터 가져오기
  if (now.getMonth() === 0 && now.getDate() === 1) {
    today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    yesterday = new Date(now.getFullYear() - 1, 11, 31);
  } else if (now.getDate() === 1) {
    // 이번달이 첫 달은 아닌데 첫 날이 경우 지난 달 마지막 날 데이터 가져오기
    today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    yesterday = new Date(now.getFullYear(), now.getMonth(), 0);
  } else {
    today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  }
  return { today, yesterday };
}

async function getAllData(x, y) {
  const { today, yesterday } = getAvailableDay();
  const todayToString = `${today.getFullYear()}${
    today.getMonth() + 1 < 10
      ? "0" + (today.getMonth() + 1)
      : today.getMonth() + 1
  }${today.getDate() < 10 ? '0' + today.getDate() : today.getDate()}`;
  const yesterdayToString = `${yesterday.getFullYear()}${
    yesterday.getMonth() + 1 < 10
      ? "0" + (yesterday.getMonth() + 1)
      : yesterday.getMonth() + 1
  }${yesterday.getDate() < 10 ? '0' + yesterday.getDate() : yesterday.getDate()}`;

  const availableDays = [todayToString, yesterdayToString];
  console.log(availableDays);
  const timeQueue = [
    [2, "0200"],
    [5, "0500"],
    [8, "0800"],
    [11, "1100"],
    [14, "1400"],
    [17, "1700"],
    [20, "2000"],
    [23, "2300"],
  ];

  const result = Promise.all(
    availableDays.map((day) =>
      Promise.all(timeQueue.map((time) => getWeatherData(x, y, day, time[1])))
    )
  );
  return result;
}

//service key
//rQjnKIBh3WlSp%2BF8BMs3nzy30zT1zEujUFXCVobY7HQfuR%2Ba7KJvBpvGIRBQhnlLGR2MT3WgggFJIMgClfYZnA%3D%3D
//another service key
//fQQmInPFuI3k1pbQjX1BaCfOE6zFzNXa9hXAEs92vl6OI140GB+GkwowNuF0YyKuRNTRFy/5BWAZb7N0ZfDuUw==
// 특정 날짜, 특정 시간 데이터 받아오기
function getWeatherData(x, y, day, time) {
  var url =
    "http://apis.data.go.kr/1360000/VilageFcstInfoService/getVilageFcst";
  var queryParams =
    "?" +
    encodeURIComponent("ServiceKey") +
    "=" +
    "rQjnKIBh3WlSp%2BF8BMs3nzy30zT1zEujUFXCVobY7HQfuR%2Ba7KJvBpvGIRBQhnlLGR2MT3WgggFJIMgClfYZnA%3D%3D"; /* Service Key*/
  queryParams +=
    "&" +
    encodeURIComponent("ServiceKey") +
    "=" +
    encodeURIComponent("-"); /* 공공데이터포털에서 받은 인증키 */
  queryParams +=
    "&" +
    encodeURIComponent("pageNo") +
    "=" +
    encodeURIComponent("1"); /* 페이지번호 */
  queryParams +=
    "&" +
    encodeURIComponent("numOfRows") +
    "=" +
    encodeURIComponent("11"); /* 한 페이지 결과 수 */
  queryParams +=
    "&" +
    encodeURIComponent("dataType") +
    "=" +
    encodeURIComponent("JSON"); /* 요청자료형식(XML/JSON)Default: XML */
  queryParams +=
    "&" +
    encodeURIComponent("base_date") +
    "=" +
    encodeURIComponent(day); /* 15년 12월 1일발표 */
  queryParams +=
    "&" +
    encodeURIComponent("base_time") +
    "=" +
    encodeURIComponent(time); /* 05시 발표 */
  queryParams +=
    "&" +
    encodeURIComponent("nx") +
    "=" +
    encodeURIComponent(x); /* 예보지점 X 좌표값 */
  queryParams +=
    "&" +
    encodeURIComponent("ny") +
    "=" +
    encodeURIComponent(y); /* 예보지점의 Y 좌표값 */
  // console.log(url + queryParams);
  return axios.get(url + queryParams);
}

module.exports = {
  getXY,
  getDustData,
  getAllData,
};

const weatherStation = require("./weatherStation.json");

// XY 정보 가져오기 (동네예보)
function getXY(province, city, town) {
	const result = weatherStation.find(
		(ws) =>
		ws["1단계"] === province && ws["2단계"] === city && ws["3단계"] === town
	);
	return { x: result["격자 X"], y: result["격자 Y"] };
}

const axios = require("axios");

//미세먼지 정보 가져오기
async function getDustData(station) {
	const url = `http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?stationName=${encodeURI(
	station
	)}&dataTerm=month&pageNo=1&numOfRows=10&ServiceKey=rtVVwR6hnZErSceeqbvBPb9%2B6039VEkeewcHjC60EFIUnvJ%2FX%2BZ92jvi8DmR0mgX7GyvXlEE%2BV9pUnGMGQqKUA%3D%3D&ver=1.3&_returnType=json`;
	const result = await axios.get(url);
	return result.data;
}

//======================================================================================
function numberPad(n, width) {
	n = n+ '';
	return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}

var now = new Date()
var nowDate = `${now.getFullYear()}${numberPad(now.getMonth()+1,2)}${numberPad(now.getDate(),2)}`
var nowTime = now.getHours() + 9;
if (nowTime >= 5 && nowTime < 8)
	_hours = "0500";
else if (nowTime >= 8 && nowTime < 11)
	_hours = "0800";
else if (nowTime >= 11 && nowTime < 14)
	_hours = "1100";
else if (nowTime >= 14 && nowTime < 17)
	_hours = "1400";
else if (nowTime >= 17 && nowTime < 20)
	_hours = "1700";
else if (nowTime >= 20 && nowTime < 23)
	_hours = "0800";
else if (nowTime >= 23)
	_hours = "2300";
else 
	_hours = "0200";

async function getWeatherData(x, y) {
	var url = 'http://apis.data.go.kr/1360000/VilageFcstInfoService/getVilageFcst';
	var queryParams = '?' + encodeURIComponent('ServiceKey') + '=rQjnKIBh3WlSp%2BF8BMs3nzy30zT1zEujUFXCVobY7HQfuR%2Ba7KJvBpvGIRBQhnlLGR2MT3WgggFJIMgClfYZnA%3D%3D'; /* Service Key*/
	queryParams += '&' + encodeURIComponent('ServiceKey') + '=' + encodeURIComponent('-'); /* 공공데이터포털에서 받은 인증키 */
	queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /* 페이지번호 */
	queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('11'); /* 한 페이지 결과 수 */
	queryParams += '&' + encodeURIComponent('dataType') + '=' + encodeURIComponent('JSON'); /* 요청자료형식(XML/JSON)Default: XML */
	queryParams += '&' + encodeURIComponent('base_date') + '=' + encodeURIComponent(`${nowDate}`); /* 15년 12월 1일발표 */
	queryParams += '&' + encodeURIComponent('base_time') + '=' + encodeURIComponent(_hours); /* 05시 발표 */
	queryParams += '&' + encodeURIComponent('nx') + '=' + encodeURIComponent(x); /* 예보지점 X 좌표값 */
	queryParams += '&' + encodeURIComponent('ny') + '=' + encodeURIComponent(y); /* 예보지점의 Y 좌표값 */
	const result = await axios.get(url+queryParams);
	return result.data;
}

module.exports = {
	getXY,
	getDustData,
	getWeatherData
};

//getWeatherData(61, 120).then(data=>console.log(data))
//getDustData('기흥').then(data=>console.log(data))

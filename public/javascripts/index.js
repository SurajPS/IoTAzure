$(document).ready(function () {
  var timeData = [],
    temperatureData = [],
    humidityData = [],
  tempex = [],
  humidex = [];
  var data = {
      labels: timeData,
      datasets: [
          {
              fill: false,
              label: 'Temperature',
              yAxisID: 'Temperature',
              borderColor: ["rgba(255, 200, 0, 1)", "rgba(255, 0, 0, 1)"],
              pointBoarderColor: ["rgba(255, 200, 0, 1)", "rgba(255, 0, 0, 1)"],
              backgroundColor: ["rgba(255, 200, 0, 0.9)", "rgba(255, 0, 0, 1)"],
              pointHoverBackgroundColor: ["rgba(255, 200, 0, 1)", "rgba(255, 0, 0, 1)"],
              pointHoverBorderColor: ["rgba(255, 200, 0, 1)", "rgba(255, 0, 0, 1)"],
              data: [temperatureData, tempex]
          },
          {
              fill: false,
              label: 'Humidity',
              yAxisID: 'Humidity',
              borderColor: ["rgba(0, 220, 240, 1)", "rgba(0, 0, 240, 1)"],
              pointBoarderColor: ["rgba(0, 241, 240, 1)", "rgba(0, 0, 240, 1)"],
              backgroundColor: ["rgba(0, 241, 240, 0.9)", "rgba(0, 0, 240, 1)"],
              pointHoverBackgroundColor: ["rgba(0, 241, 240, 1)", "rgba(0, 0, 240, 1)"],
              pointHoverBorderColor: ["rgba(0, 241, 240, 1)", "rgba(0, 0, 240, 1)"],
              data: [humidityData, humidex]
          }
    ]
  }
   
    //The chart Creation 

  var basicOption = {
    title: {
      display: true,
      text: 'Temperature & Humidity Real-time Data',
      fontSize: 36
    },
    scales: {
      yAxes: [{
        id: 'Temperature',
        type: 'linear',
        scaleLabel: {
          labelString: 'Temperature(C)',
          display: true
        },
        position: 'left',
      }, {
          id: 'Humidity',
          type: 'linear',
          scaleLabel: {
            labelString: 'Humidity(%)',
            display: true
          },
          position: 'right'
        }]
    }
  }

  //Get the context of the canvas element we want to select
  var ctx = document.getElementById("myChart").getContext("2d");
  var optionsNoAnimation = { animation: true }
  var myLineChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: basicOption
  });


  var ws = new WebSocket('wss://' + location.host);
  ws.onopen = function () {
    console.log('Successfully connect WebSocket');
  }
  ws.onmessage = function (message) {
    console.log('receive message' + message.data);
    try {
      var obj = JSON.parse(message.data);
      if(!obj.time || !obj.temperature) {
        return;
      }
      timeData.push(obj.time);
      //temperatureData.push(obj.temperature);
      console.log(obj.temperature);
      if (obj.temperature > 30)
          tempex.push(obj.temperature);
      else
          temperatureData.push(obj.temperature);
      // only keep no more than 50 points in the line chart
      const maxLen = 50;
      var len = timeData.length;
      if (len > maxLen) {
        timeData.shift();
        temperatureData.shift();
      }

      if (obj.humidity) {
          //humidityData.push(obj.humidity);
          console.log(obj.humidity);
          if (obj.humidity > 30)
              humidex.push(obj.humidity);
          else
              humidityData.push(obj.humidity);
      }
      if (humidityData.length > maxLen) {
          humidityData.shift();
      }

      myLineChart.update();
    } catch (err) {
      console.error(err);
    }
  }
});

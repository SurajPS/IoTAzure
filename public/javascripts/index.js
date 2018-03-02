//Main program part


var sensorname="";
var previoussensor="";
var timeData = [],
allData=[],
adat={},
allTempData = [],
allHumidData=[],
alltimeData=[],
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
           borderColor: "rgba(255, 200, 0, 1)",
           pointBoarderColor: "rgba(255, 240, 0, 1)",
           backgroundColor: "rgba(255, 240, 0, 0.4)",
           pointHoverBackgroundColor: "rgba(255, 200, 0, 1)",
           pointHoverBorderColor: "rgba(255, 200, 0, 1)",
           data: temperatureData
           },
           {
           fill: false,
           label: 'Humidity',
           yAxisID: 'Humidity',
           borderColor: "rgba(0, 240, 240, 1)",
           pointBoarderColor: "rgba(0, 240, 240, 1)",
           backgroundColor: "rgba(0, 210, 240, 0.4)",
           pointHoverBackgroundColor: "rgba(0, 210, 240, 1)",
           pointHoverBorderColor: "rgba(0, 210, 240, 1)",
           data: humidityData
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



$(document).ready(function () {



    var ws = new WebSocket('wss://' + location.host);
    ws.onopen = function () {
                  console.log('Successfully connected WebSocket:L');
                  console.log(ws);
    }
    ws.onmessage = function (message) {
                  

                  
        console.log('receive message' + message.data);
        try {
            var obj = JSON.parse(message.data);
                
                  dateformat(obj.time);
                  allData.push(obj);
                  if(!adat[String(obj.deviceId).toLowerCase()]){
                  var atime=[];atime[0]=(obj.time);
                  var atemp=[];atemp[0]=(obj.temperature);
                  var ahum=[];ahum[0]=(obj.humidity);
                  var vals={};
                  vals['time']= atime;
                  vals['temp']= atemp;
                  vals['hum']= ahum;
                  //var val3=[];
                  //val3.push(vals);
                  adat[String(obj.deviceId).toLowerCase()]=vals;
                  }
                  else
                  {
                  var val2=adat[String(obj.deviceId).toLowerCase()];console.log(val2);
                  var vtemp=val2['temp']; vtemp.push(obj.temperature);
                  var vtime=val2['time']; vtime.push(obj.time);
                  var vhum=val2['hum']; vhum.push(obj.humidity);
                 /* var val2={time:obj.time,
                  temp: obj.temperature,
                  hum: obj.humidity}
                  vals.push(val2);*/
                  if (timeData.length > 50) {
                  timeData.shift();
                  temperatureData.shift();
                  humidityData.shift();
                  }
                  
                  var vals={'time':vtime,'temp':vtemp,'hum':vhum};
                  adat[String(obj.deviceId).toLowerCase()]=vals;
                  }
                  
                  
                  
            if (!obj.time || !obj.temperature || String(obj.deviceId).toLowerCase()!=sensorname.toLowerCase()) {
                return;
                  }
                  
             
            
            timeData.push(obj.time);
            temperatureData.push(obj.temperature);
            console.log(obj.temperature);
            if (obj.temperature > 30)
                tempex.push(obj.temperature);
            // only keep no more than 50 points in the line chart
            const maxLen = 50;
            var len = timeData.length;
            if (len > maxLen) {
                timeData.shift();
                temperatureData.shift();
            }

            if (obj.humidity) {
                humidityData.push(obj.humidity);
                console.log(obj.humidity);
                if (obj.humidity > 30)
                    humidex.push(obj.humidity);
            }
            if (humidityData.length > maxLen) {
                humidityData.shift();
            }
                  console.log(temperatureData);
                  d3.select('#linechart').remove();
                  var svg= d3.select('#graphDiv').append('svg:svg').attr('id', 'linechart')
                  .attr('width',1600)
                  .attr('height','300');
                /*
            //.append('rect').attr('width','100%').attr('height','100%').attr('fill','#FEFEFE');
                  
                  g = svg.append("g").attr("transform", "translate(180px,180px)");
                  
                  var parseTime = d3.timeParse("%y:%m:%d");
                  
                  var x = d3.scaleTime()
                  .rangeRound([0, 1500]);
                  
                  var y = d3.scaleLinear()
                  .rangeRound([200, 0]);
                  
                  var line = d3.line()
                  .x(function(d) { return x(timeData); })
                  .y(function(d) { return y(temperatureData); });
                  
                 
                  d3.tsv("data.tsv", function(d) {
                         d.date = parseTime(timeData);
                         d.temperatureData = +temperatureData;
                         return d;
                         }, function(error, data) {
                         if (error) throw error;
                         
                         g.append("g")
                         .attr("transform", "translate(0,200px)")
                         .call(d3.axisBottom(x))
                         .select(".domain")
                         .remove();
                         
                         g.append("g")
                         .call(d3.axisLeft(y))
                         .append("text")
                         .attr("fill", "#000")
                         .attr("transform", "rotate(-90)")
                         .attr("y", 6)
                         .attr("dy", "0.71em")
                         .attr("text-anchor", "end")
                         .text("Temperature");
                         
                         g.append("path")
                         .datum(data)
                         .attr("fill", "none")
                         .attr("stroke", "steelblue")
                         .attr("stroke-linejoin", "round")
                         .attr("stroke-linecap", "round")
                         .attr("stroke-width", 1.5)
                         .attr("d", line);
                         });
*/
                  

            myLineChart.update();
        } catch (err) {
            console.error(err);
        }
    }




});


function refreshsensor(){
    var inputfield= document.getElementById('sensorname');
    console.log(adat);
    console.log(temperatureData);
    console.log(humidityData);
    console.log(timeData);
    console.log(inputfield.value);
    sensorname= inputfield.value;
    
    temperatureData.length=0;
    humidityData.length=0;
    timeData.length=0;
    if(adat[String(sensorname).toLowerCase()]){
        timeData.push(adat[String(sensorname).toLowerCase()].time);console.log(timeData);
        temperatureData.push(adat[String(sensorname).toLowerCase()].temp);console.log(temperatureData);
        humidityData.push(adat[String(sensorname).toLowerCase()].hum);console.log(humidityData);
    }
    else
        console.log("Unknown Sensor Name");
    /*for(var ind=0;ind<allData.length;ind++){
        var val1=allData[ind];
        if(String(val1.deviceId).toLowerCase() == sensorname.toLowerCase())
        {
            timeData.push(val1.time);
            temperatureData.push(val1.temperature);
            humidityData.push(val1.humidity);
        }
    }*/
    myLineChart.update();
}

function dateformat(da){
    var year=(String(da)).substring(0,4);
    var month=(String(da)).substring(5,7);
    var day= (String(da)).substring(8,10);
    var hour=(String(da)).substring(11,13);
    var min=(String(da)).substring(14,16);
    var sec=(String(da)).substring(17,19);
    var sdatetime=(year+"-"+month+"-"+day+"T"+hour+":"+min+":"+sec+"Z");
    var datetime= new Date(sdatetime);
    console.log(sdatetime);
}

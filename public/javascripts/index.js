//Main program part


var sensorname="";
var previoussensor="";
var datapresenceT=false,datapresenceH=false;
var timeData = [],
tbutton=false;
allData=[],
adat={},
d3sizes={'width': 712, 'height':534},
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

var div = d3.select("body").append("div")
.attr("class", "tooltip").style("position", "absolute")
.style("z-index", "10").style("background","#DADADA")
.style("visibility", "hidden");


$(document).ready(function () {



    var ws = new WebSocket('wss://' + location.host);
    ws.onopen = function () {
                  console.log('Successfully connected WebSocket:V');
                  console.log(ws);
    }
                  d3lineChart();
    ws.onmessage = function (message) {
                  

                  
        console.log('receive message' + message.data);
        try {
            var obj = JSON.parse(message.data);
                
                
                  var datetime=dateformat(obj.time);
                  allData.push(obj);
                  
                  if(!adat[String(obj.deviceId).toLowerCase()]){
                  var atime=[];atime[0]=(datetime);
                  var atemp=[];atemp[0]=(obj.temperature)?obj.temperature:-100;
                  var ahum=[];ahum[0]=(obj.humidity)?obj.humidity:-1;
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
                  var vtemp=val2['temp']; vtemp.push((obj.temperature)?obj.temperature:-100);
                  var vtime=val2['time']; vtime.push(datetime);
                  var vhum=val2['hum']; vhum.push((obj.humidity)?obj.humidity:-1);
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
                  
             
            
            timeData.push(datetime);
                  if(obj.temperature)
                    temperatureData.push(obj.temperature);
                  else
                    temperatureData.push(-100);
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
                if (obj.humidity > 30)
                    humidex.push(obj.humidity);
            }
                  else
                  humidityData.push(-1);
            if (humidityData.length > maxLen) {
                humidityData.shift();
                  }
                  d3lineChart();


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
        var sensorTime=adat[String(sensorname).toLowerCase()].time;
        var sensorTemp=adat[String(sensorname).toLowerCase()].temp;
        var sensorHum=adat[String(sensorname).toLowerCase()].hum;
        sensorTime.forEach(function(d,i){timeData.push(d);temperatureData.push(sensorTemp[i]);humidityData.push(sensorHum[i]);});
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
    d3lineChart();
    myLineChart.update();
}

function sizeredmor(){
    console.log("button release");
    tbutton=false;
}


function sizechange(val){
    switch(val){
        case 1:
            d3sizes.width=400;
            d3sizes.height=300;
            break;
        case 2:
            d3sizes.width=712;
            d3sizes.height=534;
            break;
        case 3:
            d3sizes.width=1024;
            d3sizes.height=768;
            break;
        case 0:
            tbutton=true;
            while(tbutton){
                d3sizes.width=(d3sizes.width-4)<400?400:(d3sizes.width-4);
                d3sizes.height=(d3sizes.height-3)<300?300:(d3sizes.height-3);
               d3lineChart();
                sleep(500);
            }
            break;
        case 4:
            tbutton=true;
            while(tbutton){
            d3sizes.width=d3sizes.width+4;
                d3sizes.height=d3sizes.height+3;
                d3lineChart();
                sleep(500);
            }
            break;
    }
    d3lineChart();
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    while(1) {
        if ((new Date().getTime() - start) > milliseconds)
            break;
    }
}

function d3lineChart(){
    var datas = temperatureData.map(function(d, i){
                                    return { 'date' : timeData[i], 'temp' : temperatureData[i], 'hum' : humidityData[i] };
                                    });
    
    
    
    //Adding the line Chart
    d3.select('#linechart').remove();
    // set the dimensions and margins of the graph
    var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = d3sizes.width - margin.left - margin.right,
    height = d3sizes.height - margin.top - margin.bottom;
    
    // parse the date / time
    var parseTime = d3.timeFormat("%d %b %H:%M:%S");
    
    // set the ranges
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
    
    // define the line
    var valueline = d3.line()
    .x(function(d) { if((d.temp>-100)||(d.hum>=0))return x(d.date); })
    .y(function(d) { if(d.temp>-100) return y(d.temp); });
    
    var valueline2 = d3.line()
    .x(function(d) { if((d.temp>-100)||(d.hum>=0))return x(d.date); })
    .y(function(d) { if(d.hum>-100) return y(d.hum); });
    
    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#graphdiv").append("svg").attr('id','linechart')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
    
    // Get the data
    
    // Scale the range of the data
    var ymax=d3.max(datas, function(d) {return d.hum; });
    x.domain(d3.extent(datas, function(d) { return d.date; }));
    y.domain([0, !ymax?100:ymax]);
    console.log(d3.extent(datas, function(d) { return d.date; }));
    console.log(d3.max(datas, function(d) { return d.hum; }));
    
    // Add the X Axis
    
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));
    
    svg.append("text")
    .attr("transform",
          "translate(" + (width/2) + " ," +
          (height + margin.top + 20) + ")")
    .style("text-anchor", "middle")
    .text("Time");
    
    // Add the Y Axis
    svg.append("g")
    .call(d3.axisLeft(y))
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)");
    
    svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Value");
    
    
    // Add the valueline path.
    
    
    if(document.getElementById("temperaturecheck").checked==true){
    svg.append("path")
    .data([datas])
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5)
    .attr("d", valueline);
    
    svg.selectAll("dot")
    .data(datas)
    .enter().append("circle")
    .attr("r", 3)
    .attr("cx", function(d) { return x(d.date); })
    .attr("cy", function(d) { return y(d.temp); })
    .on("mouseover", function(d) {
        div.transition()
        .duration(200)
        .style("visibility", "visible");
        var dispDate=(String(d.date)).slice(4,-15);
        div.html(dispDate + "<br/> Temperature:  "  + (Math.round(d.temp*100)/100)+"<br/>Humidity:  "+(Math.round(d.hum*100)/100))
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 40) + "px")
        })
    .on("mouseout", function(d) {
        div.transition()
        .duration(400)
        .style("visibility", "hidden");
        });
    
    }
    
    
    if(document.getElementById("humiditycheck").checked==true){
    svg.append("path")
    .data([datas])
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "#DF7171")
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5)
    .attr("d", valueline2);

    
    svg.selectAll("dot")
    .data(datas)
    .enter().append("circle")
    .attr("r", 3)
    .attr("cx", function(d) { return x(d.date); })
    .attr("cy", function(d) { return y(d.hum); })
    .on("mouseover", function(d) {
        div.transition()
        .duration(200)
        .style("visibility", "visible");
        var dispDate=(String(d.date)).slice(4,-15);
        div.html(dispDate + "<br/> Temperature:  "  + (Math.round(d.temp*100)/100)+"<br/>Humidity:  "+(Math.round(d.hum*100)/100))
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 40) + "px")
        })
    .on("mouseout", function(d) {
        div.transition()
        .duration(400)
        .style("visibility", "hidden");
        });
    }
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
    //var dattm= datetime.getDate()+"-"+(datetime.getMonth()+1)+"-"+datetime.getFullYear()+"\n"+datetime.getHours()+":"+datetime.getMinutes;
    return datetime;
}

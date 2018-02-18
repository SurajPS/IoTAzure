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


    var ws = new WebSocket('wss://' + location.host);
    ws.onopen = function () {
        console.log('Successfully connect WebSocket');
    }
    ws.onmessage = function (message) {
                  

                  
        console.log('receive message' + message.data);
        try {
            var obj = JSON.parse(message.data);
            if (!obj.time || !obj.temperature) {
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
                  d3.select('#linechart').remove();
                  var v43= d3.select('#graphDiv').append('svg:svg').attr('id', 'linechart')
                  .attr('width',600)
                  .attr('height','300');
            //.append('rect').attr('width','100%').attr('height','100%').attr('fill','#FEFEFE');
                  
                  g = svg.append("g").attr("transform", "translate(180px,180px)");
                  
                  var parseTime = d3.timeParse("%y:%m:%d");
                  
                  var x = d3.scaleTime()
                  .rangeRound([0, 200]);
                  
                  var y = d3.scaleLinear()
                  .rangeRound([200, 0]);
                  
                  var line = d3.line()
                  .x(function(d) { return x(timeData); })
                  .y(function(d) { return y(temperatureData); });
                  
                 
                         
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

                  

            myLineChart.update();
        } catch (err) {
            console.error(err);
        }
    }




});

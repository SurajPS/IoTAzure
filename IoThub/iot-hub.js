/*
 * IoT Gateway BLE Script - Microsoft Sample Code - Copyright (c) 2016 - Licensed MIT
 */
'use strict';

var EventHubClient = require('azure-event-hubs').Client;

// Close connection to IoT Hub.
IoTHubReaderClient.prototype.stopReadMessage = function() {
    console.log("Stop Read");
  this.iotHubClient.close();
}

// Read device-to-cloud messages from IoT Hub.
IoTHubReaderClient.prototype.startReadMessage = function(cb) {
    console.log("Start Read");
  var printError = function(err) {
    console.error(err.message || err);
  };

  var deviceId = process.env['Azure.IoT.IoTHub.DeviceId'];

  this.iotHubClient.open()
    .then(this.iotHubClient.getPartitionIds.bind(this.iotHubClient))
    .then(function(partitionIds) {
      return partitionIds.map(function(partitionId) {
        return this.iotHubClient.createReceiver(this.consumerGroupName, partitionId, {
          'startAfterTime': Date.now()
        })
        .then(function(receiver) {
          receiver.on('errorReceived', printError);
          receiver.on('message', (message) => {
            var from = message.annotations['iothub-connection-device-id'];
            if (deviceId && deviceId !== from) {
              return;
            }
            cb(message.body, Date.parse(message.enqueuedTimeUtc));
          });
        }.bind(this));
      }.bind(this));
    }.bind(this))
    .catch(printError);
}

function IoTHubReaderClient(connectionString, consumerGroupName) {
    console.log("Reader Stuff");
  this.iotHubClient = EventHubClient.fromConnectionString(connectionString);
  this.consumerGroupName = consumerGroupName;
}

module.exports = IoTHubReaderClient;

/*
 * IoT Gateway BLE Script - Microsoft Sample Code - Copyright (c) 2016 - Licensed MIT
 */
'use strict';

var EventHubClient = require('azure-event-hubs').Client;

// Close connection to IoT Hub.
IoTHubReaderClient.prototype.stopReadMessage = function() {
    console.log('stopreadmessage');
  this.iotHubClient.close();
}

// Read device-to-cloud messages from IoT Hub.
IoTHubReaderClient.prototype.startReadMessage = function(cb) {
    console.log('start read message');
  var printError = function(err) {
    console.error(err.message || err);
  };

  var deviceId = process.env['Azure.IoT.IoTHub.DeviceId'];
    console.log('IoT Hub- dev ID:' +deviceId);

  this.iotHubClient.open()
    .then(this.iotHubClient.getPartitionIds.bind(this.iotHubClient))
    .then(function(partitionIds) {
          console.log('IoTHub1');
      return partitionIds.map(function(partitionId) {
                              console.log('IoTHub2');
        return this.iotHubClient.createReceiver(this.consumerGroupName, partitionId, {
          'startAfterTime': Date.now()
        })
        .then(function(receiver) {
          receiver.on('errorReceived', printError);
          receiver.on('message', (message) => {
            var from = message.annotations['iothub-connection-device-id'];
                      console.log('IoTHub3');
            if (deviceId && deviceId !== from) {
                      console.log('IoTHub4');
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
  this.iotHubClient = EventHubClient.fromConnectionString(connectionString);
  this.consumerGroupName = consumerGroupName;
    console.log("Entered Function-IoTHubReaderClient");
}

module.exports = IoTHubReaderClient;

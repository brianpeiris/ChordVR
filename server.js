var UART_SERVICE_UUID = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E';
var TX_CHAR_UUID = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E';
var RX_CHAR_UUID = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E';

var noble = require('noble-uwp');

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning([UART_SERVICE_UUID], true);
  } else {
    noble.stopScanning();
  }
});

var hands = {
  left: false,
  right: false,
};

noble.on('discover', function(peripheral) {
  var name = peripheral.advertisement.localName;
  if (!/chordvr/.test(name)) { return; }

  var hand = peripheral.advertisement.localName.split(' ')[1];
  if (hands[hand]) { return; }

  console.log('peripheral discovered ' + peripheral.id + ' ' + name);

  hands[hand] = true;
  peripheral.connect(function (error) {
    if (error) { console.log(error); return; }

    console.log('connected', hand);
    peripheral.discoverAllServicesAndCharacteristics(function (error, services, characteristics) {
      if (error) { console.log(error); return; }

      characteristics.forEach(function (characteristic) {
        if (characteristic.uuid === RX_CHAR_UUID.replace(/-/g, '').toLowerCase()) {
          characteristic.on('data', function (data) {
            console.log('data', hand, data[0]);
          });
          characteristic.subscribe();
          console.log('waiting for data', hand);
        }
      });
    });
  });
});

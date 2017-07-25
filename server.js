var UART_SERVICE_UUID = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E';
var TX_CHAR_UUID = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E';
var RX_CHAR_UUID = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E';

function Uart() {
        this._uart = device.find_service(UART_SERVICE_UUID);
        this._tx = this._uart.find_characteristic(TX_CHAR_UUID);
        this._rx = this._uart.find_characteristic(RX_CHAR_UUID);
        this._queue = Queue.Queue();
        this._rx.start_notify(this._rx_received);
}
Uart.prototype._rx_received = function (data) {
        this._queue.put(data);
}
Uart.prototype.write = function (data) {
        this._tx.write_value(data);
}
Uart.prototype.read = function (timeout) {
    return this._queue.get(timeout=timeout_sec);
}

var noble = require('noble-uwp');

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning([UART_SERVICE_UUID], true);
  } else {
    noble.stopScanning();
  }
});

var tx;

noble.on('discover', function(peripheral) {
  noble.stopScanning();
  console.log('peripheral discovered ' + peripheral.id);
  peripheral.connect(function (error) {
    if (error) { console.log(error); return; }
    console.log('connected');
    peripheral.discoverAllServicesAndCharacteristics(
      function (error, services, characteristics) {
        if (error) { console.log(error); return; }
    try { 
          services.forEach(function (service) {
            console.log('service', service.uuid);
          });
          characteristics.forEach(function (characteristic) {
            console.log(characteristic.uuid);
            if (characteristic.uuid === TX_CHAR_UUID.replace(/-/g, '').toLowerCase()) {
              tx = characteristic;
            }
            if (characteristic.uuid === RX_CHAR_UUID.replace(/-/g, '').toLowerCase()) {
              characteristic.on('data', function (data) {
                console.log('data', data);
              });
              characteristic.subscribe();
              console.log('waiting for data');
            }
          });
    } catch(e) { console.log(e); }
      }
    );
  });
});

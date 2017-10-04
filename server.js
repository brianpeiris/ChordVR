var UART_SERVICE_UUID = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E';
var RX_CHAR_UUID = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E';

var noble = require('noble-uwp');
var robot = require('robotjs');
var curry = require('lodash.curry');

var hands = {
  left: {
    connected: false,
    peripheral: null,
    val: 0
  },
  right: {
    connected: false,
    peripheral: null,
    val: 0
  }
};

var chordToKeyIndex = [
  0, 1, 2, 15, 3, 27, 19, 46, 4, 42, 36, 16, 33, 28, 20, 47, 5, 35, 59, 17, 32, 29, 21, 48, 7, 8, 9, 44, 10, 41, 38,
  56, 6, 34, 31, 18, 43, 30, 22, 49, 23, 24, 25, 58, 26, 60, 40, 62, 11, 12, 13, 37, 14, 39, 45, 63, 50, 51, 52, 54,
  53, 55, 57, 61
];

var normalKeys = [
  "NULL", "a", "b", "c", "d","e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", 
  "v", "w", "x", "y", "z", "th", "that ", "the ", "of ", 
  ".", ",", "!", "?", "-", "'", "\\", "/", "and ", null, "to ", 
  "up", "down", "pageup", "pagedown", "backspace", "left", "^left", "home", "space", "right", "^right", "end", 
  "enter", "tab", "escape", "delete", "insert", "_SHIFT_", "_SYMBOL_", null, "control", "command" 
];
var shiftKeys = [
  "NULL", "A", "B", "C", "D","E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", 
  "V", "W", "X", "Y", "Z", "Th", "That ", "The ", "Of ", 
  ":", ";", "|", "~", "_", "\"", "`", "/", "And ", null, "To ",
  "up", "down", "pageup", "pagedown", "backspace", "left", "^left", "home", "space", "right", "^right", "end", 
  "enter", "tab", "escape", "delete", "insert", "_SHIFT_", "_SYMBOL_", null, "control", "command" 
];
var symbolKeys = [
  "NULL", "1", "2", "3", "4","5", "6", "0", "7", "8", "9", "#", "@", null, "&", "+", "%", "=", "^", "*", "$", null, 
  null, "(", "[", "<", "{", ")", "]", ">", "}", 
  ":", ";", "|", "~", "_", "\"", "`", null, null, null, null, 
  "up", "down", "pageup", "pagedown", "backspace", "left", "^left", "home", "space", "right", "^right", "end", 
  "enter", "tab", "escape", "delete", "insert", "_SHIFT_", "_SYMBOL_", null, "control", "command" 
];

var lastChord = 0;
var lastKey = null;
var lastIndex = null;
var mode = '_NORMAL_';
var sticky = false;
function processChord(chord) {
  if (chord === 0) {
    if (lastKey !== null) {
      if (lastKey.length > 1 && lastKey[0] === '_') {
        if (mode === lastKey) {
          if (sticky) {
            mode = '_NORMAL_';
            sticky = false;
          }
          else {
            sticky = true;
          }
        }
        else {
          mode = lastKey;
        }
        process.stdout.write(mode + ' ');
      }
      else {
        process.stdout.write(lastKey + ' ');
        // everything from the 41st index and above are control commands.
        if (mode === '_SHIFT_' && lastIndex <= 41) {
          robot.keyTap(lastKey, 'shift');
        }
        else if (lastIndex <= 41) {
          robot.typeString(lastKey);
        }
        else {
          robot.keyTap(lastKey);
        }
        if (!sticky) {
          mode = '_NORMAL_';
        }
      }
      // sys.stdout.flush();
    }
    lastKey = null;
    lastChord = 0;
    lastIndex = null;
    return;
  }

  if (chord <= lastChord) { return; }

  var key = null;
  var index = chordToKeyIndex[chord];
  if (mode === '_NORMAL_') {
    key = normalKeys[index];
  }
  else if (mode === '_SHIFT_') {
    key = shiftKeys[index];
  }
  else {
    key = symbolKeys[index];
  }

  lastChord = chord;
  lastKey = key;
  lastIndex = index;
}

noble.on('stateChange', function (state) {
  if (state === 'poweredOn') {
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});

function findAndSubscribeToRxCharacteristic(hand, characteristic) {
  if (characteristic.uuid === RX_CHAR_UUID.replace(/-/g, '').toLowerCase()) {
    characteristic.on('data', function (data) {
      hands[hand].val = data[0];
      processChord(hands.left.val + (hands.right.val << 3));
    });
    characteristic.subscribe();
    console.log('waiting for data', hand);
  }
}

function scanCharacteristics(hand, error, services, characteristics) {
  if (error) { console.log(error); return; }
  characteristics.forEach(curry(findAndSubscribeToRxCharacteristic)(hand));
}

console.log('scanning');
noble.on('discover', function(peripheral) {
  var name = peripheral.advertisement.localName;
  if (!/chordvr/.test(name)) { return; }

  var hand = peripheral.advertisement.localName.split(' ')[1];
  if (hands[hand].connected) { return; }

  console.log('peripheral discovered ' + peripheral.id + ' ' + name);

  hands[hand].connected = true;
  hands[hand].peripheral = peripheral;
  peripheral.once('disconnect', function () {
    console.log('disconnected', hand);
  });
  peripheral.connect(function (error) {
    if (error) { console.log(error); return; }

    console.log('connected', hand);
    peripheral.discoverAllServicesAndCharacteristics(curry(scanCharacteristics)(hand));
  });
});

process.on('SIGINT', function () {
  if (hands.left.peripheral) {
    hands.left.peripheral.disconnect();
  }
  if (hands.right.peripheral) {
    hands.right.peripheral.disconnect();
  }
});

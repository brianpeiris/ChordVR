# ChordVR

A [chorded keyboard](https://en.wikipedia.org/wiki/Chorded_keyboard) for VR.

The current iteration of this project uses Adafruit's
(Feather nRF52 Bluefruit microcontroller](https://www.adafruit.com/product/3406) and is designed to work with Vive
controllers. The keyboard uses Cherry MX (or compatible) mechanical keys with
[The Enabler](https://techkeys.us/collections/accessories/products/the-enabler) single switch PCB.

The software implements the [GKOS system](http://gkos.com/gkos/page1.html) for chorded keyboards.

## File Structure

- code/gkos-bluefruit/gkos-bluefruit.ino
	Arduino code that's uploaded to the Feather nRF52s. Takes care of setting up the bluetooth peripheral and sending
	keypress data via BLE UART.
- code/server/server.js
	Connects to the nRF52 boards, receives and translates the key presses into GKOS chords and emulates a keyboard
	on the host machine.
- models/src/ChordVR.f3d
	An Autodesk Fusion 360 model of the hardware sleeve designed to slip onto a Vive controller.
- models/prints/*
	STL files for 3D printing the hardware.

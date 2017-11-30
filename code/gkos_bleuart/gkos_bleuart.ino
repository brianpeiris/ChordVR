#include <bluefruit.h>

BLEUart bleUart;

int button1 = 15;
int button2 = 7;
int button3 = 16;

bool enableSerial = false;

void setup()
{
  pinMode(button1, INPUT_PULLUP);
  pinMode(button2, INPUT_PULLUP);
  pinMode(button3, INPUT_PULLUP);

  if (enableSerial) { Serial.begin(115200); }

  // turn off the blue led by default
  Bluefruit.autoConnLed(false);

  Bluefruit.begin();
  Bluefruit.setName("chordvr left");
  Bluefruit.setConnInterval(2, 8);

  bleUart.begin();

  Bluefruit.Advertising.addFlags(BLE_GAP_ADV_FLAGS_LE_ONLY_GENERAL_DISC_MODE);
  Bluefruit.Advertising.addTxPower();
  Bluefruit.Advertising.addService(bleUart);
  Bluefruit.ScanResponse.addName();
  Bluefruit.Advertising.start();
}

byte val;
byte lastVal; 
int debounce = 50;
int lastDebounce;
void loop()
{
  if ((millis() - lastDebounce) < debounce) { return; }
  lastDebounce = millis();

  val = 0b000;
  
  if (digitalRead(button1) == LOW)
  {
    digitalWrite(LED_RED, HIGH);
    val |= 0b001;
  }
  if (digitalRead(button2) == LOW)
  {
    digitalWrite(LED_RED, HIGH);
    val |= 0b010;
  }
  if (digitalRead(button3) == LOW)
  {
    digitalWrite(LED_RED, HIGH);
    val |= 0b100;
  }

  if (val == 0b000)
  {
    digitalWrite(LED_RED, LOW);
  }
  
  if(val != lastVal)
  {
    if (enableSerial)
    {
      Serial.print(String(val).c_str());
    }
    bleUart.write(val);
    lastVal = val;
  }
}

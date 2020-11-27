/*
  Keyboard Serial
  该程序用于将控制台的按钮信号转换为openrails的快捷键
  Openrails机车控制默认快捷键：
  机车向前：W
  倒退：S
  功率+：D
  功率-：A
  加档：E
  减档：Shift+E
  紧急制动：Back
  鸣笛：Space
  左边车门：Q
  右边车门：Shift+Q

*/

#include "Keyboard.h"

void setup() {
  // open the serial port:
  Serial.begin(9600);
  Serial1.begin(9600);
  // initialize control over the keyboard:
  Keyboard.begin();
}

void loop() {
  // check for incoming serial data:
  if (Serial1.available() > 0) {
    // read incoming serial data:
    char inChar = Serial1.read();
    // Type the next ASCII value from what you received:
   Keyboard.press(inChar);
   delay(50);
   Keyboard.release(inChar);
   Serial.println(inChar);
  }
}

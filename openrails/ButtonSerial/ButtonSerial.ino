
// the setup function runs once when you press reset or power the board
void setup() {
  // initialize digital pin LED_BUILTIN as an output.
  Serial1.begin(9600);
  Serial.begin(9600);
  pinMode(7,INPUT_PULLUP);
}

// the loop function runs over and over again forever
void loop() {
  int x = digitalRead(7);
  if(!x){
    Serial1.print('d');    
    Serial.println(x);
  }
  delay(50);
}

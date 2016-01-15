<?php
//function printESCP() {
//if (notReady()) { return; }
//
//qz.append('\x1B' + '\x40'); // init
//qz.append('\x1B' + '\x61' + '\x31'); // center align
//qz.append('Hello world!' + '\x0A');
//qz.append('\x0A'); // line break
//qz.append('\x1B' + '\x61' + '\x30'); // left align
//qz.append('This is a test...' + '\x0A');
//qz.append('\x0A');
//qz.append('\x1B' + '\x45' + '\x0D'); // bold on
//qz.append('Here\'s some bold text!');
//qz.append('\x1B' + '\x45' + '\x0A'); // bold off
//qz.append('\x0A' + '\x0A');
//qz.append('\x1B' + '\x61' + '\x32'); // right align
//qz.append('\x1B' + '\x21' + '\x30'); // em mode on
//qz.append('DRINK ME');
//qz.append('\x1B' + '\x21' + '\x0A' + '\x1B' + '\x45' + '\x0A'); // em mode off
//qz.append('\x0A' + '\x0A');
//qz.append('\x1B' + '\x61' + '\x30'); // left align
//qz.append('------------------------------------------' + '\x0A');
//qz.append('\x1B' + '\x4D' + '\x31'); // small text
//qz.append('EAT ME' + '\x0A');
//qz.append('\x1B' + '\x4D' + '\x30'); // normal text
//qz.append('------------------------------------------' + '\x0A');
//qz.append('\x1B' + '\x61' + '\x30'); // left align
//qz.append('\x0A' + '\x0A' + '\x0A' + '\x0A' + '\x0A' + '\x0A' + '\x0A');
//qz.append('\x1B' + '\x69'); // cut paper
//
//// Send characters/raw commands to printer
//qz.print();
//}
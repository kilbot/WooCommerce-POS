append('\x1B' + '\x40'); // init
append('\x1B' + '\x61' + '\x31'); // center align
append('Hello world!' + '\x0A');
append('\x0A'); // line break
append('\x1B' + '\x61' + '\x30'); // left align
append('This is a test...' + '\x0A');
append('\x0A');
append('\x1B' + '\x45' + '\x0D'); // bold on
append('Here\'s some bold text!');
append('\x1B' + '\x45' + '\x0A'); // bold off
append('\x0A' + '\x0A');
append('\x1B' + '\x61' + '\x32'); // right align
append('\x1B' + '\x21' + '\x30'); // em mode on
append('DRINK ME');
append('\x1B' + '\x21' + '\x0A' + '\x1B' + '\x45' + '\x0A'); // em mode off
append('\x0A' + '\x0A');
append('\x1B' + '\x61' + '\x30'); // left align
append('------------------------------------------' + '\x0A');
append('\x1B' + '\x4D' + '\x31'); // small text
append('EAT ME' + '\x0A');
append('\x1B' + '\x4D' + '\x30'); // normal text
append('------------------------------------------' + '\x0A');
append('\x1B' + '\x61' + '\x30'); // left align
append('\x0A' + '\x0A' + '\x0A' + '\x0A' + '\x0A' + '\x0A' + '\x0A');
append('\x1B' + '\x69'); // cut paper
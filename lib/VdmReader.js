'use strict';

const htmlparser = require('htmlparser2');

class VdmReader {

  constructor(html) {
    this.parser = new htmlparser.Parser({
      onopentag: this.onOpenTag.bind(this)
    });

    this.count = 0;

    this.parser.write(html);
    this.parser.end();
  }

  getCount() {
    return this.count;
  }

  setCount(count) {
    this.count = count;
  }

  onOpenTag(name, attribs) {
    if (name !== 'div') {
      return;
    }

    if (!attribs.class) {
      return;
    }

    let _classes = attribs.class.split(' ');

    if (_classes[0] === 'post' && _classes[1] === 'article'){
      this.setCount(this.count+1);
    }
  }
}

module.exports = VdmReader;

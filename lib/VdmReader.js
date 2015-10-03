'use strict';

const htmlparser  = require('htmlparser2');
const moment      = require('moment');

class VdmReader {

  constructor(html) {
    this.parser = new htmlparser.Parser({
      onopentag: this.onOpenTag.bind(this),
      ontext: this.onText.bind(this),
      onclosetag: this.onCloseTag.bind(this)
    });

    this.count = 0;

    this.isReadingVdm = false;
    this.isInVdm = false;
    this.paragraphCountInVdm = 0;

    this.vdms = [];

    this.currentVdm = {};

    this.parser.write(html);
    this.parser.end();
  }

  getCount() {
    return this.count;
  }

  setCount(count) {
    this.count = count;
  }

  getFirst() {
    return this.vdms[0];
  }

  onOpenTag(name, attribs) {
    if (name === 'div') {
      this.readDiv(attribs);
    }

    if (name === 'p' && this.isInVdm === true) {
      this.isReadingVdm = true;
      this.paragraphCountInVdm += 1;
    }
  }

  onText(value) {
    if (this.isReadingVdm === true){

      if (this.paragraphCountInVdm === 1) {
        // Reading content of VDM
        if (this.currentVdm.content === undefined) {
          this.currentVdm.content = '';
        }

        this.currentVdm.content += value;
      }

      if (this.paragraphCountInVdm === 3) {
        // Reading date and author
        let _values = value.split(' ');

        if (this.currentVdm.date === undefined) {
          // We did not read date, so it must be the date
          // Ex: "Le 03/10/2015 à 15:32 - " --> splitted = ['Le', '03/10/2015', 'à', '15:32', '-', '']
          this.currentVdm.date = moment(_values[1] + ' ' + _values[3], 'DD/MM/YYYY HH:mm').format('YYYY-MM-DD HH:mm:ss');
          return;
        }

        if (this.currentVdm.author === undefined) {
          // We did not read author, so it may be it
          // It is possible this is the vdm's category and not the author
          // To decide, I will split from spaces, and look at length
          // Ex: " - par <author> (" vs. "<category>"
          // splitted -> ['', '-', 'par', '<author>', '('] --> so index 3, length 5
          if (_values.length === 5) {
            this.currentVdm.author = _values[3];
          }
        }
      }
    }
  }

  onCloseTag(name) {
    if (name === 'p' && this.isReadingVdm === true){
      this.isReadingVdm = false;

      if (this.paragraphCountInVdm === 3) {
        this.vdms.push(this.currentVdm);
        this.currentVdm = {};

        this.paragraphCountInVdm = 0;
        this.isReadingVdm = false;
        this.isInVdm = false;
      }
    }
  }

  readDiv(attribs) {
    if (!attribs.class) {
      return;
    }

    let _classes = attribs.class.split(' ');

    if (_classes[0] === 'post' && _classes[1] === 'article'){
      this.setCount(this.count+1);
      this.isInVdm = true;
    }
  }
}

module.exports = VdmReader;

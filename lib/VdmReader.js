'use strict';

const htmlparser  = require('htmlparser2');
const moment      = require('moment');

class VdmReader {

  /**
   * initialize parser and attributes
   */
  constructor() {
    this.parser = new htmlparser.Parser({
      onopentag: this.onOpenTag.bind(this),
      ontext: this.onText.bind(this),
      onclosetag: this.onCloseTag.bind(this)
    });

    this.isReadingVdm = false;
    this.isInVdm = false;
    this.paragraphCountInVdm = 0;

    this.vdms = [];

    this.currentVdm = {};
  }

  /**
   * parseHtml : reads given HTML and stores VDMs
   * @param  {String} html www.viedemerde.fr page
   * @return {VdmReader} instance of VdmReader
   */
  parseHtml(html) {
    this.parser.write(html);
    this.parser.end();
    return this;
  }

  /**
   * getCount : returns number of VDMs stored from given html strings
   * @return {Number}
   */
  getCount() {
    return this.vdms.length;
  }

  /**
   * getFirst: returns the first stored VDM
   * @return {Object} VDM
   */
  getFirst() {
    return this.vdms[0];
  }

  /**
   * onOpenTag: function called each time a tag opening is parsed in HTML
   * A VDM in a HTML page looks like this :
   * ```
   * <div class="post article" id="8624214">
   *   <p>
   *     <!-- PARAGRAPH ONE IS THE CONTENT -->
   *     <a ...>Aujourd'hui, j'ai découpé, assemblé deux par deux, puis classé dans l'ordre décroissant une trentaine de chromosomes pour un devoir d'SVT.</a>
   *     <a ...> Après deux heures de travail, je finis enfin et pousse un soupir de soulagement.</a>
   *     <a ...> Tous mes chromosomes se sont éparpillés.</a>
   *     <a ...> VDM</a>
   *   </p>
   *   <div class="date">
   *     <div class="left_part">
   *       <a ...>#8624214</a><br>
   *       <span ...>33 commentaires</span>
   *     </div>
   *     <div class="right_part">
   *       <p>
   *         <!-- PARAGRAPH TWO IS THE VOTING SYSTEM -->
   *         <span ...>
   *           <a ...>je valide, c'est une VDM</a> (<span ...>3221</span>)
   *         </span> -
   *         <span ...>
   *           <a ...>tu l'as bien mérité</a> (<span ...>529</span>)
   *         </span>
   *       </p>
   *       <p>
   *         <!-- PARAGRAPH THREE IS DATE, CATEGORY AND AUTHOR -->
   *         Le 03/10/2015 à 15:32 -
   *         <a ...>travail</a>
   *          - par soupir
   *       </p>
   *     </div>
   *   </div>
   *   <div ...>
   *     <div ...>
   *       <!-- FACEBOOK -->
   *       <iframe style="width: 30px; height: 19px; border: 0px;"></iframe>
   *     </div>
   *       <!-- TWITTER -->
   *       <a ..></a>
   *   </div>
   * </div>
   * ```
   * in this function, I simply detect the div opening of a VDM (class = "post article")
   * and I count paragraphs
   *
   * @param  {String} name    name of the tag opened (div, span, p, ...)
   * @param  {Object} attribs attributes of the tag
   */
  onOpenTag(name, attribs) {
    if (name === 'div') {
      if (!attribs.class) {
        return;
      }

      let _classes = attribs.class.split(' ');

      // div contains a VDM
      if (_classes[0] === 'post' && _classes[1] === 'article') {
        this.isInVdm = true;
      }
    }

    if (name === 'p' && this.isInVdm === true) {
      this.isReadingVdm = true;
      this.paragraphCountInVdm += 1;
    }
  }

  /**
   * onText: function called each time the parser encounters content
   * this function will store useful content based on the VDM detection in onOpenTag.
   *
   * @param  {String} value html tag content
   */
  onText(value) {
    if (this.isReadingVdm === false) {
      return;
    }

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
        // splitted -> ['', '-', 'par', '<author>', '(']
        // author can be "le roxxor", so we must take everything after 'par'
        if (_values[1] === '-' && _values[2] === 'par') {
          this.currentVdm.author = _values.slice(3, -1).join(' ');
        }
      }
    }
  }

  /**
   * onCloseTag: function called each time the parser encounters a closing tag
   * When closing the reading of the third paragraph, there is no more useful information to read,
   * therefore, we store the VDM, and reset our counters and detection parameters
   *
   * @param  {String} name name of the tag
   */
  onCloseTag(name) {
    if (name === 'p' && this.isReadingVdm === true) {
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
}

module.exports = VdmReader;

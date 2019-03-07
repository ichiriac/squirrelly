const STATES = {
  S_DOC: 0,
  S_TAG: 1
};

/**
 * Define lexer tokens
 */
const TOKENS = {
  T_EOF:                0,  // 
  T_DOC:                1,  // ...
  T_OPEN_TAG:           2,  // {{
  T_CLOSE_TAG:          3,  // }}
  T_CODE:               4,  // else (js extra code)
};

const TERMINALS = [
  ':', '/', ' ', '\t', '\n', '\r', '/', '"', "'", "`"
]

/**
 * Define the lexer wrapper
 */
class lexer {
  constructor(buffer) {
    this.buffer = buffer;
    this.state = STATES.S_DOC;
    this.lastOffset = buffer.length;
    this.openTag = '{{';
    this.closeTag = '}}';
    this.aheadOffset = -1;
    this.aheadType = -1;
    this.offset = 0;
    this.prev_offset = this.offset;
  }
  /**
   * Generates an token
   */
  token(type) {
    const src = this.prev_offset > this.lastOffset ? 
      null: 
      this.buffer.substring(this.prev_offset, this.offset);
    return [type, src, this.prev_offset, this.offset];
  }

  /**
   * Register next tag
   * @param {*} type 
   * @param {*} offset 
   */
  ahead(type, offset) {
    this.aheadType = type;
    this.aheadOffset = offset || (this.offset + 1);
    return this;
  }

  /**
   * Reads the next token
   */
  next() {
    this.prev_offset = this.offset;
    if (this.aheadOffset !== -1) {
      this.offset = this.aheadOffset + 1;
      this.aheadOffset = -1;
      return this.token(this.aheadType);
    }
    while(this.offset < this.lastOffset) {
      if (this.state === STATES.S_DOC) {
        // SEARCH THE OPEN TAG
        let tag = this.buffer.indexOf(this.openTag, this.offset);
        if (tag === -1) {
          this.offset = this.lastOffset;
        } else {
          this.offset = tag;
          this.state = STATES.S_TAG;
          this.ahead(TOKENS.T_OPEN_TAG, tag + this.openTag.length - 1);
          return this.token(TOKENS.T_DOC);
        }
      } else if (this.state === STATES.S_TAG) {
        let tag = this.buffer.indexOf(this.closeTag, this.offset);
        if (tag === -1) {
          this.offset = this.lastOffset;
        } else {
          this.offset = tag;
          this.state = STATES.S_DOC;
          this.ahead(TOKENS.T_CLOSE_TAG, tag + this.closeTag.length - 1);
          return this.token(TOKENS.T_CODE);
        }
      } else {
        // never reached
        throw new Error('Bad state');
      }
      this.offset ++;
    }
    if (this.prev_offset === this.offset) {
      return this.token(TOKENS.T_EOF);
    } else {
      return this.token(TOKENS.T_DOC);
    }
  }

};

module.exports = {
  lexer, TOKENS, STATES, default: lexer
};
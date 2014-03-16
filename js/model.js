var Textus = Textus || {};
Textus.Model = {};

(function(my) {

/**
 * The maximum number of character to retrieve in a single request from the text service
 * when populating the text container. This must be a power of two - we don't check for this
 * later on and setting it to anything else will cause confusion.
 */
var textChunkSize = 2048;

my.PartialText = Backbone.Model.extend({
  defaults : {
    text : "",
    // Offset of the first character in the retrieved text
    offset : 0,
    // Array containing typographical annotations which overlap with the retrieved text
    typography : [],
    // Array containing semantic annotations which overlap with the retrieved text
    annotations: [],
    // Used to cache the HTML version of the text, including marker spans for
    // annotations etc.
    cachedHTML : null,
    // Structure of the current text, the structure is an array of markers indicating
    // structure boundary start points.
    structure : []
  }
});

my.Text = Backbone.Model.extend({
  defaults : {
    textUrl: '',
    typographyUrl: '',
    annotationApi: '',
    // sometimes we do not have an API - just a readable list of annotations
    annotationsUrl: '',
    /* Text retrieved from the server */
    text : "",
    /* Offset of the first character in the retrieved text */
    offset : 0,
    /*
     * Array containing typographical annotations which overlap with the retrieved text
     */
    typography : [],
    /*
     * Array containing semantic annotations which overlap with the retrieved text
     */
    annotations: [],
    /*
     * Used to cache the HTML version of the text, including marker spans for
     * annotations etc.
     */
    cachedHTML : null,
    /*
     * Structure of the current text, the structure is an array of markers indicating
     * structure boundary start points.
     */
    structure : []
  },

  initialize: function() {
    this.currentText = new my.PartialText();
  },

  fetch: function(callback) {
    var self = this;
    var result = {semantics: []};
    var count = 3;
    $.get(self.get('textUrl'), function(data) {
      self.set({text: data});
      count --;
      if (count == 0) callback();
    });
    $.getJSON(self.get('typographyUrl'), function(data) {
      self.set({typography: data});
      count --;
      if (count == 0) callback();
    });
    $.getJSON(self.get('annotationsUrl'), function(data) {
      self.set({annotations: data});
      count --;
      if (count == 0) callback();
    });
  },

  // Load a part of the Text in to this.currentText
  //
  // TODO: actually see view height ...
  // For present lets' just render a certain amount of text ...
  // TODO: forwards stuff
  getPart: function(offset, length, forwards) {
    offset = Math.max(0, offset);
    var self = this;
    var text = self.attributes.text.slice(offset, offset+length);

    var annotationFilter = function(a) {
      return a.end >= offset && a.start <= (offset + length);
    };

    var typos = _.filter(self.attributes.typography, annotationFilter);
    var annotations = _.filter(self.attributes.annotations, annotationFilter);
    var html = Textus.Util.markupText(
      text,
      offset,
      typos,
      annotations
    );
    self.currentText.set({
      text: text,
      typography: typos,
      annotations: annotations,
      cachedHTML: html
    });
  }
});


/**
 * Trim the content of the input struct until the text exactly fits in the target
 * container height. Do this by testing for a fit, and changing the start or end offset
 * (depending on whether we're going forwards or backwards) by an amount which is
 * progressively reduced each iteration.
 */
/* data is {offset:int, text:string, typography:[], semantics:[]}} */
my.trim = function(data, forwards, height, measure) {
  // console.log("Starting trim function, text has offset " + data.offset + " and
  // length "
  // + data.text.length);
  var trimData = function(length) {
    var amountRemoved = data.text.length - length;
    return {
      text : forwards ? (data.text.substring(0, length)) : (data.text.substring(amountRemoved,
          data.text.length)),
      offset : forwards ? (data.offset) : (data.offset + amountRemoved),
      typography : data.typography,
      semantics : []
    };
  };

  var textLength = data.text.length - (textChunkSize - 1);
  // console.log("Text length starts at " + textLength);
  var i = textChunkSize;
  while (i > 1) {
    i = i / 2;
    var test = trimData(textLength + i);
    // console.log("Trim - end offset of text is " + (test.offset +
    // test.text.length));
    // console.log("Trimmed text : " + test.text.substring(0, 20) + "...");
    var measured = measure(markupStruct(test));
    if (measured <= height) {
      textLength = textLength + i;
      // console.log("Text length is " + textLength + " (+" + i + ")");
    } else {
      // console.log("Text is too high - measured at " + measured + ", maximum is
      // " + height);
    }
  }
  var t = trimData(textLength);
  var annotationFilter = function(a) {
    return a.end >= t.offset && a.start <= (t.offset + t.text.length);
  };
  // console.log("Offset = " + t.offset + " text.length = " + t.text.length);
  /*
   * Handle the special case where we went back and the start offset ended up being
   * zero. In these cases we should re-do the entire call going fowards from zero
   */
  if (!forwards && t.offset == 0) {
    /*
     * Reached the start of the text by going backwards, re-do by running forwards
     * from offset zero
     */
    // TODO: reinstate
    // updateTextAsync(0, true, height, measure);
  } else {
    if (forwards && t.text.length == 0) {
      /*
       * Reached the end of the text, re-do by running backwards from the end to
       * fill the page
       */
      // TODO: reinstate
      // updateTextAsync(textId, t.offset, false, height, measure);
    } else {
      /*
       * Got a sensible location, update the textModel and textLocationModel with
       * the text, offset, typography and semantics.
       */
      return {
        text : t.text,
        offset : t.offset,
        typography : data.typography.filter(annotationFilter),
        semantics : data.semantics.filter(annotationFilter)
      };
    }
  }
};

// ## A selection of Text
my.Selection = Backbone.Model.extend({
  defaults : {
    // The raw text captured by the selection
    text : "",
    // The location within the enclosing text of the
    // selected text.
    start : 0,
    // The location within the enclosing text of the end of
    // the selection (i.e. start + text.length assuming
    // there are no bugs!)
    end : 0
  }
});

var markupStruct = function(struct) {
  return Textus.Util.markupText(struct.text, struct.offset, struct.typography, struct.semantics);
};

}(Textus.Model));

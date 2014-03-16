(function ($) {

module("Model");

var fixtures = {
  textUrl: './fixtures/1-text.txt',
  typographyUrl: './fixtures/1-typography.json',
  annotationsUrl: './fixtures/1-annotations.json'
};

var fixtures3 = {
  text: "First HeadingThis is some text which could be found in a wiki. This bit is bold, this bit is italic and this bit is bold and italicSecond HeadingThis is some paragraph text within the second heading. There's a list next:This is a list itemThis is a nested list itemand a second oneBack to the top level list nowA list item with some markup and emphasisAn ordered list itemAnd a secondNested ordered listUnordered within orderedBack to top level listThird HeadingSomething under the third heading This is text on the next line which should be merged And so is thisThis text is indentedSo is thisSecond indentationThird indentationSomeVeryWidely spaced textFourth HeadingAnd finally some text under the fourth level heading.",
  typography: [
    {
      "start": 0,
      "end": 13,
      "css": "h1"
    },
    {
      "start": 75,
      "end": 79,
      "css": "b"
    },
    {
      "start": 93,
      "end": 99,
      "css": "i"
    },
    {
      "start": 116,
      "end": 131,
      "css": "b"
    },
    {
      "start": 116,
      "end": 131,
      "css": "i"
    },
    {
      "start": 13,
      "end": 131,
      "css": "p"
    },
    {
      "start": 131,
      "end": 145,
      "css": "h2"
    },
    {
      "start": 145,
      "end": 220,
      "css": "p"
    },
    {
      "start": 220,
      "end": 239,
      "css": "li"
    },
    {
      "start": 239,
      "end": 265,
      "css": "li"
    },
    {
      "start": 265,
      "end": 281,
      "css": "li"
    },
    {
      "css": "ul",
      "start": 239,
      "end": 281
    },
    {
      "start": 281,
      "end": 311,
      "css": "li"
    },
    {
      "start": 328,
      "end": 332,
      "css": "b"
    },
    {
      "start": 344,
      "end": 352,
      "css": "i"
    },
    {
      "start": 311,
      "end": 352,
      "css": "li"
    },
    {
      "css": "ul",
      "start": 220,
      "end": 352
    },
    {
      "start": 352,
      "end": 372,
      "css": "li"
    },
    {
      "start": 372,
      "end": 384,
      "css": "li"
    },
    {
      "start": 384,
      "end": 403,
      "css": "li"
    },
    {
      "start": 403,
      "end": 427,
      "css": "li"
    },
    {
      "css": "ul",
      "start": 403,
      "end": 427
    },
    {
      "css": "ol",
      "start": 384,
      "end": 427
    },
    {
      "start": 427,
      "end": 449,
      "css": "li"
    },
    {
      "css": "ol",
      "start": 352,
      "end": 449
    },
    {
      "start": 449,
      "end": 462,
      "css": "h3"
    },
    {
      "start": 462,
      "end": 563,
      "css": "p"
    },
    {
      "start": 563,
      "end": 584,
      "css": "i1"
    },
    {
      "start": 584,
      "end": 594,
      "css": "i1"
    },
    {
      "start": 594,
      "end": 612,
      "css": "i2"
    },
    {
      "start": 612,
      "end": 629,
      "css": "i3"
    },
    {
      "start": 629,
      "end": 633,
      "css": "p"
    },
    {
      "start": 633,
      "end": 637,
      "css": "p"
    },
    {
      "start": 637,
      "end": 655,
      "css": "p"
    },
    {
      "start": 655,
      "end": 669,
      "css": "h4"
    },
    {
      "start": 669,
      "end": 722,
      "css": "p"
    }
  ],
  annotations: []
};

var fixtures2 = {
  offset: 0,
  text: "First HeadingThis is some text which could be found in a wiki. This bit is bold, this bit is italic and this bit is bold and italicSecond HeadingThis is some paragraph text within the second heading. There's a list next:This is a list itemThis is a nested list itemand a second oneBack to the top level list nowA list item with some markup and emphasisAn ordered list itemAnd a secondNested ordered listUnordered within orderedBack to top level listThird HeadingSomething under the third heading This is text on the next line which should be merged And so is thisThis text is indentedSo is thisSecond indentationThird indentationSomeVeryWidely spaced textFourth HeadingAnd finally some text under the fourth level heading.",
  typography:[],
  semantics:[]
}

test('Text', function () {
  var text = new Textus.Model.Text(fixtures);

  equal(text.attributes.textUrl, fixtures.textUrl);
  equal(text.attributes.text, '', 'should have empty text');
});

asyncTest('Text.fetch', function () {
  expect(1);
  var text = new Textus.Model.Text(fixtures);

  text.fetch(function(err) {
    // console.log(err);
    // console.log(text.attributes);
    ok(!err);
    start();
  });
});

test('Text.getPart', function () {
  var text = new Textus.Model.Text(fixtures3);
  text.currentText.bind('change', function() {
    var data = text.currentText.attributes;
    equal(data.text, 'ingThis is some text which could be found in a wik');
    equal(data.typography.length, 2);
  });
  text.getPart(10, 50, true);
});

test('Text.trim', function () {
  var measure = function(html) {
    return 500;
  }
  var height = 600;
  var forwards = true;
  var out = new Textus.Model.trim(fixtures2, forwards, height, measure);
  // console.log(out);
  equal(out.text.length, 722);
});


})(this.jQuery);


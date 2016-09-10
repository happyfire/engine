/*global test, deepEqual, largeModule, strictEqual */

largeModule('HtmlTextParser');

var parser = new cc.HtmlTextParser();

test('Basic Test', function() {

    var testStr1 = "hello world";
    deepEqual(parser.parse(testStr1),
                [{text: "hello world"}],
                'No Html string should be equal to original.');

    var testInvalidStr2 = "<x hello world";
    deepEqual(parser.parse(testInvalidStr2),
              [{text: "x hello world"}],
              'Invalid tag begin.');

    var testInvalidStr1 = "<x>hello world</x>";
    deepEqual(parser.parse(testInvalidStr1),
              [{text: "hello world", style: {}}],
                'Invalid tags');


    var testInvalidStr3 = "</b>hello world";
    deepEqual(parser.parse(testInvalidStr3),
              [{text: "hello world"}],
               "invalid tags end.");

    var testInvalidStr4 = "</>hello world";
    deepEqual(parser.parse(testInvalidStr4),
              [{text: "hello world"}],
             "Empty tags are emitted.");

    var testInvalidStr5 = "<b>hello world";
    deepEqual(parser.parse(testInvalidStr5),
              [{text: "hello world"}],
              "Empty tags are emitted.");
});




test('Color test', function(){
    var colorTestStr1 = "<color=#0xffff00>hello world</color>";
    deepEqual(parser.parse(colorTestStr1),
              [{text: "hello world", style: {color: "#0xffff00"}}],
              "Happy path.");

    var colorTestStr2 = "<color=#0xffff33>hello world</xxx>";
    deepEqual(parser.parse(colorTestStr2),
              [{text: "hello world", style: {color: "#0xffff33"}}],
              "Happy path two.");

    var colorTestStr3 = "<color#0xffff33>hello world</xxx>";
    deepEqual(parser.parse(colorTestStr3),
              [{text: "hello world", style: {}}],
              "Missing the = sign.");

    var colorTestStr4 = "<color=>hello world</xxx>";
    deepEqual(parser.parse(colorTestStr4),
              [{text: "hello world", style: {}}],
              "missing the color value.");

    var colorTestStr5 = "<c=#0xff4400>hello world</xxx>";
    deepEqual(parser.parse(colorTestStr5),
              [{text: "hello world", style: {}}],
              "tag name is invalid");

    var colorTestStr6 = "<color = #0xff4400>hello world";
    deepEqual(parser.parse(colorTestStr6),
              [{text: "hello world"}],
              "The close tag is missing.");


});

test('Size test', function() {
    var sizeTestStr1 = "<size = 20>hello world</size>";
    deepEqual(parser.parse(sizeTestStr1),
              [{text: "hello world", style: {size: 20}}],
              "Happy path 1.");

    var sizeTestStr2 = "<size = 20>hello world</xx>";
    deepEqual(parser.parse(sizeTestStr2),
              [{text: "hello world", style: {size: 20}}],
              "Happy path 2.");

    var sizeTestStr3 = "<size20>hello world</xxx>";
    deepEqual(parser.parse(sizeTestStr3),
              [{text: "hello world", style: {}}],
              "Missing the = sign.");

    var sizeTestStr4 = "<size=>hello world</xxx>";
    deepEqual(parser.parse(sizeTestStr4),
              [{text: "hello world", style: {}}],
              "missing the color value.");

    var sizeTestStr5 = "<s=20>hello world</xxx>";
    deepEqual(parser.parse(sizeTestStr5),
              [{text: "hello world", style: {}}],
              "tag name is invalid");

    var sizeTestStr6 = "<size=20>hello world";
    deepEqual(parser.parse(sizeTestStr6),
              [{text: "hello world"}],
              "The close tag is missing.");


});

test('Event test', function() {
    var eventTestString = "<on click=' event1' hoverin='event2 ' hoverout = 'event3'>hello world</on>";

    deepEqual(parser.parse(eventTestString),
              [{text: "hello world", style: {
                  event: {
                  click : "event1"
                  }}}], "Happy path 1");

    var eventTestStringFail1 = "<on click=' event1' hoverin'event2 ' hoverout=event3>hello world</on>";

    deepEqual(parser.parse(eventTestStringFail1),
              [{text: "hello world", style: {
                  event: {
                      click : "event1",
                  }}}], "Fail path 1");

    var eventTestStringFail2 = "<size=20 click=' event1' hoverin=event2 hoverout:event3>hello world</on>";

    deepEqual(parser.parse(eventTestStringFail2),
              [{text: "hello world", style: {
                  size: 20,
                  event: {
                      click : "event1",
                  }}}], "Fail path 2");

    var eventTestStringFail3 = "<size=20 click=event1 hoverin='event2' hoverout:event3>hello world</on>";

    deepEqual(parser.parse(eventTestStringFail3),
              [{text: "hello world", style: {
                  size: 20,
                  event: {
                  }}}], "Fail path 3");


    var eventTestString2 = "<color=#0xff0000 click=\"event1\">Super weapon</color>";

    deepEqual(parser.parse(eventTestString2),
              [{text: "Super weapon", style: {
                  color: "#0xff0000",
                  event: {
                  click : "event1",
                  }
              }}], "Color with event");

    var eventTestString3 = "<size=20 click='event1' hoverin='event2'>hello world</>";
    deepEqual(parser.parse(eventTestString3),
              [{text: "hello world",
                style: {
                    size: 20,
                    event: {
                        click : "event1",
                    }
                }}], "Size with event");

    var eventTestString4 = "<sie=20 click='event1' hoverin='event2'>hello world</>";
    deepEqual(parser.parse(eventTestString4),
              [{text: "hello world",
                style: {}
               }], "Failed path: Size with event");

    var invalidEventTestString4 = "<size=20 click='event1\">hello world</>";
    deepEqual(parser.parse(invalidEventTestString4),
              [{text: "hello world",
                style: {size: 20,
                        event: {}}
               }], "Failed path: event name quote not match.");

    var invalidEventTestString5 = "<size=20 click=\"event1'>hello world</>";
    deepEqual(parser.parse(invalidEventTestString5),
              [{text: "hello world",
                style: {size: 20,
                        event: {}}
               }], "Failed path: event name quote not match.");


});

test('Test special symbol escape', function() {
    var testLessThan = "<size=20>hello&lt;world</size>";

    deepEqual(parser.parse(testLessThan),
                [ {text: "hello<world",
                   style: {
                       size: 20
                   }
                  }],
                "The &lt; symbol should be correctly escaped.");

    var testGreatThan = "<on click='event1'> hello&gt;world</on>";
    deepEqual(parser.parse(testGreatThan),
                [{text: " hello>world",
                  style: {
                      event: {
                          click: 'event1'
                      }
                  }}],
                "The &gt; symbol should be correctly escaped.");

    var testAmp = "<color=#0xff00>hello&amp;world</>";
    deepEqual(parser.parse(testAmp),
              [{text: "hello&world",
                style: {
                    color: "#0xff00"
                }}],
                "The amp symbol should be correctly escaped.");

    var testQuot = "<on>hello&quot;world</on>";
    deepEqual(parser.parse(testQuot),
              [{text: "hello\"world",
                style: {}}],
                "The quot symbol should be correctly escaped.");

    var testApos = "<color=#0xffee>Hi, <size=20>hello&apos;world</s></c>";
    deepEqual(parser.parse(testApos),
              [{text: "Hi, ",
                style: {
                    color: "#0xffee"
                }},
               {text: "hello'world",
                style: {
                    color: "#0xffee",
                    size: 20
                }}],
                "The apos symbol should be correctly escaped.");
});


test('Integrate test', function() {
    var eventTestString = "hello <b>world</b>, <color=#0xff0000> Ni hao </color>";

    deepEqual(parser.parse(eventTestString),
              [{text: "hello "}, {text: "world", style: {bold: true}},
               {text: ", "},
               {text: " Ni hao ", style : {color: "#0xff0000"}}], "Happy path 1");

    var moreComplexString = "<size=20>大小<size=10>不一</size></size>,<color=#0xffeeaa>颜色</c><color=#0xffaaee>不同</c><on click='event1'>可点击</on>";
    deepEqual(parser.parse(moreComplexString),
              [{text: "大小", style: {size: 20}}, {text: "不一", style: {size: 10}}, {text:","},
               {text: "颜色", style: {color: "#0xffeeaa"}}, {text: "不同", style: {color: "#0xffaaee"}},
               {text: "可点击", style: {event: {click: 'event1'}}}], "more complex test");


});

test('bold/italic/underline test', function () {
    var stringWithBold = "<b></i><b>hello \n world</b>";

    deepEqual(parser.parse(stringWithBold),
              [{text: "hello \n world", style: {bold: true}}], "bold test");

    var stringWithItalic = "<i>hello world</i>";

    deepEqual(parser.parse(stringWithItalic),
              [{text: "hello world", style: {italic: true}}], "italic test");

    var stringWithUnderline = "<u>hello world</u>";

    deepEqual(parser.parse(stringWithUnderline),
              [{text: "hello world", style: {underline: true}}], "underline test");
});

test('test br tag', function () {
    var newlineTest = "<br/>";

    deepEqual(parser.parse(newlineTest),
              [{text: "", style: {newline: true}},], "newline element test");

    var newlineTest2 = "hello <b>a< br  /></b> world";

    deepEqual(parser.parse(newlineTest2),
              [{text: "hello "},
               {text: "a", style: {bold: true}},
               {text: "", style: {newline: true}},
               {text: " world"}
              ], "newline element test");

    var newlineTest3 = "< br />";

    deepEqual(parser.parse(newlineTest3),
              [{text: "", style: {newline: true}},], "newline element test");

    var newlineTest4 = "<br></br>";

    deepEqual(parser.parse(newlineTest4),
              [], "newline element test");

    var newlineTest5 = "hello <b>a<br></></b> world";

    deepEqual(parser.parse(newlineTest5),
              [{text: "hello "},
               {text: "a", style: {bold: true}},
               {text: " world"}
              ], "newline element test");

    var newlineTest6 = "hello <b>a<br /><br/ ></b> world";

    deepEqual(parser.parse(newlineTest6),
              [{text: "hello "},
               {text: "a", style: {bold: true}},
               {text: "", style: {newline: true}},
               {text: "", style: {newline: true}},
               {text: " world"}
              ], "newline element test");

    var newlineTest7 = "hello <b>a</b><br /><br/ >world";

    deepEqual(parser.parse(newlineTest7),
              [{text: "hello "},
               {text: "a", style: {bold: true}},
               {text: "", style: {newline: true}},
               {text: "", style: {newline: true}},
               {text: "world"}
              ], "newline element test");
});

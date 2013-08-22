The Textus viewer application.

The Textus viewer is a pure HTML + Javascript application for viewing [Textus
format texts][format]. It is part of the [Textus project][textus].

[textus]: http://okfnlabs.org/textus/
[format]: http://okfnlabs.org/textus/format/

## Demo

Open `index.html` in your favourite browser.

## Code Organization

```
vendor/       # dev

js/           # js code
  main.js     # require.js kick-off point
  routers.js  # main backbone router

  activity/readTextActivity.js  # core text view activity

templates/    # js HTML templates

css/          # css code 
```

## TODO

* [x] do first pass strip down to essential files
* [ ] Delete more stuff e.g. anything bibjson related (see e.g. js/textus.js)
* [ ] Refactor to have a Text model which rest of code uses and which is async.
  Basically something along these lines:

      var text = Textus.Text(url);
      # text then usable in readTextActivity

* [ ] Move index.html to demo
* [ ] Provide tutorial on how to use the code in your app
* [ ] Tests for markup code
* [ ] Remove require.js dependency and simplify code further
* [ ] Markup code usable as node js lib or just separately


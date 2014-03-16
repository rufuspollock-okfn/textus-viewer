The Textus viewer application.

The Textus viewer is a pure HTML + Javascript application for viewing [Textus
format texts][format]. It is part of the [Textus project][textus].

[textus]: http://okfnlabs.org/textus/
[format]: http://okfnlabs.org/textus/format/

## Demo

Check out:

<http://okfnlabs.org/textus-viewer/>

## Usage

Include all the relevant vendor libraries (see `vendor` directory):

```
<script src="vendor/jquery-1.7.2.js"></script>
<script src="vendor/jquery.ui-1.8.22.js"></script>
<script src="vendor/underscore-1.3.3.js"></script>
<script src="vendor/backbone-0.9.2.js"></script>
<script src="vendor/backbone.forms-0.10.0.js"></script>
<script src="vendor/bootstrap.js"></script>
<script src="vendor/bootstrap.modal-1.4.0.js"></script>
<script src="vendor/jquery.ui.colorPicker.js"></script>
```

Include Textus Viewer JS in your app:

```
<script src="http://okfnlabs.org/textus-viewer/js/textus.js"></script>
<script src="http://okfnlabs.org/textus-viewer/js/model.js"></script>
<script src="http://okfnlabs.org/textus-viewer/js/annotation.js"></script>
<script src="http://okfnlabs.org/textus-viewer/js/viewer.js"></script>
```

Now boot the viewer:

```
jQuery(document).ready(function() {
  // Create a Text object with some fixture data
  var text = new Textus.Model.Text({
    // id is needed if new annotations will be allowed
    id: 'text-1',
    textUrl: # url to your text in textus format
    typographyUrl: # textus typography
    annotationsUrl: # url to load annotations from
  });
  // Load the text
  text.fetch(function(err) {
    // you could check the err if you want to be sure text has loaded ok

    // set up the viewer
    var viewer = new Textus.Viewer({
      el: $('.textus-viewer-here'),
      text: text,
      router: null,
      user: {
        id: 'bob'
      }
    });
    // and now render it
    viewer.render();
  });
});
```

Note: we are in the process of [reinstating support for loading and saving to a
proper Textus compatiable annotations API][ann-issue].

[ann-issue]: https://github.com/okfn/textus-viewer/issues/8

## For Contributors

You can try the app out test it during development by opening index.html in
your browser but note that you will need to have it loaded at a proper http://
url not a file:/// one (with file:/// urls you won't be able to load the
fixture data).

### Code Organization

```
vendor/       # dev
js/           # js code
css/          # css code 
```


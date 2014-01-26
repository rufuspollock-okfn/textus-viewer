define([ 'views/textView', 'views/editSemanticAnnotationView', 'models' ], function(TextView, EditSemanticAnnotationView, models) {

  return function() {
    this.name = "ReadTextActivity";
    this.pageTitle = "Reading...";
    var firingKeyEvents = true;
    this.start = function(location) {
      /*
       * Capture the initial offset and the textId from the URL (in turn derived from the
       * location object)
       */
      models.textLocationModel.set({
        offset : location.offset
      });

      $('body').append("<div id='textViewDiv'></div>");

      /*
       * Create a new textView, render it, append it to the body of the page and hide the
       * normal content panel because we're overriding the bootstrap based layout and going to
       * 'full screen' mode
       */
      var textView = new TextView({
        model: location.text,
        textLocationModel : models.textLocationModel,
        el : $('#textViewDiv')
      });
      textView.render();
      $('body').append(textView.el);
      $('.textus-content').hide();

      /*
       * Set up a listener on selection events on the text selection model.
       */
      var s = models.textSelectionModel;

      s.bind("change", function(event) {
        if (models.loginModel.get("loggedIn")) {
          $('.show-if-login').show();
        } else {
          $('.show-if-login').hide();
        }
        if (s.get("text") != "") {
          $('.show-if-select').show();
        } else {
          $('.show-if-select').hide();
        }
      });

      function buildAnnotationEditorPresenter(closeModal) {
        return {
          createAnnotation : function(newAnnotation) {
            // console.log("Annotation data : " + data);
            newAnnotation.start = s.get("start");
            newAnnotation.end = s.get("end");
            newAnnotation.textId = models.textLocationModel.get("textId");
            $.post("api/semantics", newAnnotation, function(returnedAnnotation) {
              var semanticsArray = models.textModel.get("semantics").slice(0);
              semanticsArray.push(returnedAnnotation);
              models.textModel.set({
                semantics : semanticsArray
              });
              firingKeyEvents = true;
              closeModal();
            });
          }
        };
      }

      $('#annotate-button').click(function(event) {
        var textId = models.textLocationModel.get("textId");
        Textus.Util.showModal({
          constructor : function(container, header, closeModal) {
            var editView = new EditSemanticAnnotationView({
              presenter : buildAnnotationEditorPresenter(closeModal)
            });
            editView.render();
            container.append(editView.el);
            header.append("<h4>Create new annotation</h4>");
            firingKeyEvents = false;
          },
          beforeClose : function() {
            firingKeyEvents = true;
            return true;
          },
          position : "bottom"
        }, event);
        return false;
      });

      if (models.loginModel.get("loggedIn")) {
        $('.show-if-login').show();
      } else {
        $('.show-if-login').hide();
      }

      $('#cite-button').click(function() {
        location.router.navigate("#snippet/" + location.textId + "/" + s.get("start") + "/" + s.get("end"), {
          trigger : true
        });
      });

      /* Set up a key listener on the document to allow arrow key based page navigation */
      $(document.documentElement).keyup(function(event) {
        if (firingKeyEvents) {
          if (event.keyCode == 37) {
            presenter.back();
          } else if (event.keyCode == 39) {
            presenter.forward();
          }
        }
      });

      /*
       * Listen to changes on the offset property and re-write the URL appropriately.
       */
      var t = models.textLocationModel;
      t.bind("change offset", function() {
        location.router.navigate("text/" + location.textId + "/" + t.get("offset"));
      });


      // now boot everything up
      location.text.getPart(0, 400, true);
    };

    /**
     * Called when stopping the activity, removes any event listeners and similar that would
     * cause zombie instances of the text rendered to be left kicking around.
     */
    this.stop = function(callback) {
    };
  };
});

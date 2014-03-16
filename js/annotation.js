var Textus = Textus || {};

/**
 * Mapping for renderers and editors for different annotation types. Add new rendering functions and
 * editor schemas to this file to create new annotation types.
 */

(function(my) {
  my.Annotation = {
    /**
     * A map of type -> function, the function being passed the annotation payload and returning
     * HTML to represent that annotation.
     */
    renderers : {
      'textus:comment' : _.template('<div><%= text %></div>'),
      'textus:tag' : _.template('<div><b><%= name %></b> = <%= value %></div>')
    },

    /**
     * A map of type -> {name, schema} where the name is used in the UI for e.g. selection of
     * which kind of annotation to create and the schema is a schema object used by the Backbone
     * Forms library to create an editor for that annotation type. See
     * https://github.com/powmedia/backbone-forms for more information on the forms schema
     * syntax. The actual form layout is customised to use bootstrap's css in main.js during
     * application startup.
     */
    schemas : {
      "textus:comment" : {
        name : "Comment",
        schema : {
          "text" : "TextArea"
        }
      },
      "textus:tag" : {
        name : "Tag",
        schema : {
          "name" : "Text",
          "value" : "Text"
        }
      }
    }

  };

  // ## Editor
  // 
  // UI Component to edit or create a single semantic annotation payload.
  // Currently just supports free text annotations.

  /**
   * Holds schemas used for backbone-forms and keyed on the 'type' field of the semantic
   * annotations. Provides edit support for the various kinds of semantic annotation payload.
   */
  var schemas = my.Annotation.schemas;

  /**
   * Populate the annotation editor from a given annotation.type, i.e. "textus:comment".
   */
  var populateAnnotationEditor = function(el, annotation, presenter) {
    if (schemas[annotation.type]) {
      var creating = (annotation.payload == null);
      var form = new Backbone.Form({
        data : annotation.payload,
        schema : schemas[annotation.type].schema
      });
      $('#annotationEditor', el).append(form.render().el);

      el.find('#submitAnnotation').bind("click", function() {
        console.log(form.getValue());
        presenter.storeAnnotation({
          type : annotation.type,
          payload : form.getValue()
        });
        return false;
      });
    } else {
      console.log("Unable to find edit schema for annotation " + annotation);
    }
  };

  function createEditor(type, el, value) {
    el.empty();
    var form = new Backbone.Form({
      data : (value ? value.payload : {}),
      schema : schemas[type].schema
    });
    el.append(form.render().el);
    return form;
  }

  my.Annotation.Editor = Backbone.View.extend({
    template: '\
<div class="annotationEditorContents form-horizontal">\
\
	<div class="control-group creating-annotation">\
		<label class="control-label" for="annotationTypeSelect">Type</label>\
		<div class="controls">\
			<select id="typeSelect" name="annotationTypeSelect"></select>\
		</div>\
	</div>\
	<div id="annotationEditor" style="margin-bottom: 40px" />\
	<div\
		style="position: absolute; right: 10px; left: 10px; bottom: 5px; height: 30px;">\
		<div class="creating-annotation" style="position: absolute; right: 0px">\
			<a href="#" id="create" class="btn btn-success">Save</a>\
		</div>\
		<div style="position: absolute; right: 0px"\
			class="editing-annotation inline">\
			<div style="padding-right: 5px">Save as :</div>\
			<div class="btn-group" class="hide-if-final">\
				<a href="#" id="saveAsPrivate" class="btn btn-success">Private</a> <a\
					href="#" id="saveAsProvisional" class="btn btn-success">Provisional</a>\
				\
			</div>\
			<div class="btn-group"><a href="#" id="saveAsFinal" class="btn btn-warning">Final</a></div>\
		</div>\
		<a href="#" id="delete" class="btn btn-danger editing-annotation" style="position:absolute; left:0px">Delete</a>\
	</div>\
</div>\
',

    intialize : function() {
      _.bindAll(this);
    },

    render : function() {
      this.$el.html(this.template);
      var presenter = this.options.presenter;
      var annotation = this.options.annotation;
      var typeSelect = $('#typeSelect', this.$el);
      var editorPanel = $('#annotationEditor', this.$el);
      var form;
      function updatedAnnotation(visibility) {
        return {
          user : annotation.user,
          type : annotation.type,
          id : annotation.id,
          visibility : visibility,
          payload : form.getValue()
        };
      }
      if (annotation != null) {
        /* Existing annotation */
        form = createEditor(annotation.type, editorPanel, annotation);
        $('.creating-annotation', this.$el).hide();

        $('#saveAsPrivate', this.$el).click(function() {
          presenter.updateAnnotation(updatedAnnotation('private'));
          return false;
        });
        $('#saveAsProvisional', this.$el).click(function() {
          presenter.updateAnnotation(updatedAnnotation('provisional'));
          return false;
        });
        $('#saveAsFinal', this.$el).click(function() {
          presenter.updateAnnotation(updatedAnnotation('final'));
          return false;
        });
        $('#delete', this.$el).click(function() {
          presenter.updateAnnotation(updatedAnnotation('delete'));
          return false;
        });
      } else {
        /* Completely new annotation */
        $('.editing-annotation', this.$el).hide();
        for (schemaKey in schemas) {
          if (schemas.hasOwnProperty(schemaKey)) {
            typeSelect.append('<option value="' + schemaKey + '">' + schemas[schemaKey].name
                + '</option>');
          }
        }
        typeSelect.change(function() {
          form = createEditor(typeSelect.val(), editorPanel);
        });
        form = createEditor(typeSelect.val(), editorPanel);
        $('#create', this.$el).click(function() {
          var newAnnotation = {
            payload : form.getValue(),
            type : typeSelect.val(),
            visibility : 'private'
          };
          console.log(newAnnotation);
          presenter.createAnnotation(newAnnotation);
          return false;
        });
      }

      return this;
    }
  });

})(Textus);


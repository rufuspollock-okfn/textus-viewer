var Textus = Textus || {};

(function(my) {
  /* Configure the Form layout to use bootstrap CSS */
  Backbone.Form.setTemplates({
    form : '<form class="form-horizontal">{{fieldsets}}</form>',
    fieldset : '<fieldset><legend>{{legend}}</legend>{{fields}}</fieldset>',
    field : '<div class="control-group"><label class="control-label" for="{{id}}">'
        + '{{title}}</label><div class="controls"><div class="input-xlarge">'
        + '{{editor}}</div></div></div>',
    nestedField : '<div><div title="{{title}}" class="input-xlarge">{{editor}}</div>'
        + '<div class="help-block">{{help}}</div></div>',
    list : '<div class="bbf-list"><ul class="unstyled clearfix">{{items}}</ul>'
        + '<button class="bbf-add" data-action="add">Add</div></div>',
    listItem : '<li class="clearfix"><div class="pull-left">{{editor}}</div>'
        + '<button class="bbf-del" data-action="remove">x</button></li>',
    date : '<div class="bbf-date"><select data-type="date" class="bbf-date">'
        + '{{dates}}</select><select data-type="month" class="bbf-month">'
        + '{{months}}</select><select data-type="year" class="bbf-year">' + '{{years}}</select></div>',
    dateTime : '<div class="bbf-datetime"><p>{{date}}</p>'
        + '<p><select data-type="hour" style="width: 4em">{{hours}}</select>'
        + ':<select data-type="min" style="width: 4em">{{mins}}</select></p></div>',
    'list.Modal' : '<div class="bbf-list-modal">{{summary}}</div>'
  }, {
    error : 'error'
  });


  my.Viewer = Backbone.View.extend({
    initialize: function(options) {
      this.firingKeyEvents = true;
      this.model = options.text;
      this.selection = new Textus.Model.Selection();
      this.user = options.user;
      this.loggedIn = options.user !== null;

      this.$el.append("<div id='textViewDiv'></div>");

      /*
       * Create a new textView, render it, append it to the body of the page and hide the
       * normal content panel because we're overriding the bootstrap based layout and going to
       * 'full screen' mode
       */
      this.textView = new my.TextView({
        model: options.text,
        user: options.user,
        selection: this.selection,
        offset: options.offset, 
        el : $('#textViewDiv')[0]
      });
      this.textView.render();

      this._setupSelection();
      this._bindEvents();

      // Listen to changes on the offset property and re-write the URL appropriately.
      // TODO: 2014-03-16 reinstate (no longer have textLocationModel ...)
      // var t = models.textLocationModel;
      // t.bind("change offset", function() {
      //   options.router.navigate("text/" + options.textId + "/" + t.get("offset"));
      // });

      // now boot everything up
      this.model.getPart(0, 400, true);
    },

    _bindEvents: function() {
      var self = this;
      $('#annotate-button').click(function(event) {
        Textus.Util.showModal({
          constructor : function(container, header, closeModal) {
            var editView = new Textus.Annotation.Editor({
              presenter : self._buildAnnotationEditorPresenter(closeModal)
            });
            editView.render();
            container.append(editView.el);
            header.append("<h4>Create new annotation</h4>");
            firingKeyEvents = false;
          },
          beforeClose : function() {
            self.firingKeyEvents = true;
            return true;
          },
          position : "bottom"
        }, event);
        return false;
      });

      if (self.loggedIn) {
        $('.show-if-login').show();
      } else {
        $('.show-if-login').hide();
      }

      $('#cite-button').click(function() {
        options.router.navigate("#snippet/" + options.textId + "/" + s.get("start") + "/" + s.get("end"), {
          trigger : true
        });
      });
    },

    /*
     * Set up a listener on selection events on the text selection model.
     */
    _setupSelection: function() {
      var self = this;

      this.selection.bind("change", function(event) {
        if (self.loggedIn) {
          $('.show-if-login').show();
        } else {
          $('.show-if-login').hide();
        }
        if (self.selection.get("text") != "") {
          $('.show-if-select').show();
        } else {
          $('.show-if-select').hide();
        }
      });
    },

    _buildAnnotationEditorPresenter: function(closeModal) {
      var self = this;
      return {
        createAnnotation : function(newAnnotation) {
          // console.log("Annotation data : " + data);
          newAnnotation.start = self.selection.get("start");
          newAnnotation.end = self.selection.get("end");
          newAnnotation.textId = self.model.id;
          // TODO: 2014-03-16 move this into an appropriate model object
          $.post("api/semantics", newAnnotation, function(returnedAnnotation) {
            var semanticsArray = self.model.get("semantics").slice(0);
            semanticsArray.push(returnedAnnotation);
            self.model.set({
              semantics : semanticsArray
            });
            self.firingKeyEvents = true;
            closeModal();
          });
        }
      };
    }
  });

  my.TextView = Backbone.View.extend({
    template: '\
<div id="toolbar"> \
	<div class="btn-group pull-left"> \
		<a class="btn" id="index-button" href=""><i class="icon-list-alt"></i> Index</a>\
	</div>\
	<div class="show-if-select pull-left"\
		style="display: none; padding-left: 5px;">\
		<div class="btn-group pull-left">\
			<a class="btn btn-info" id="cite-button"><i class="icon-share-alt icon-white"></i>\
				Cite</a>\
		</div>\
		<div class="btn-group pull-left show-if-login">\
			<a class="btn btn-success" id="annotate-button"><i class="icon-pencil icon-white"></i>\
				Annotate</a> <a class="btn btn-success"><i\
				class="icon-heart icon-white"></i> Save to list</a>\
		</div>\
	</div>\
</div>\
\
<div class="pageContainer">\
	<!-- Groups the canvas and page text together -->\
\
	<canvas id="pageCanvas">\
			<!-- Used to render annotation indicators -->\
			Your browser doesn"t support canvas, this isn"t going to end well...\
			</canvas>\
	<canvas id="linkCanvas">\
			<!-- Used to render the links between annotation blobs and their corresponding DIV elements -->\
			</canvas>\
	<!-- The pageTextMeasure is used to work out how much text to render to fill the pageText div -->\
	<div class="pageTextMeasure"></div>\
	<div class="pageText">\
		<!-- Contains the actual text to be read -->\
	</div>\
	<div class="topMargin"></div>\
	<div class="annotations">\
		<!-- Contains divs for each semantic annotation -->\
	</div>\
	<div class="pageButtons">\
		<a href="#" id="previousPageButton"\
			style="height: 40px; line-height: 40px; width: 80px;"\
			class="btn pull-left">Previous</a> <a href="#" id="nextPageButton"\
			style="height: 40px; line-height: 40px; width: 80px;"\
			class="btn pull-right">Next</a>\
	</div>\
</div>\
',

    initialize : function(options) {
      _.bindAll(this);
      var self = this;
      var model = this.model.currentText;
      var textSize = 350;
      this.textOffset = options.offset || 0;
      this.user = options.user;
      this.loggedIn = options.user !== null;
      this.selection = options.selection;
      // var presenter = this.presenter = this.options.presenter;
      // var presenter = presenter;
      this.$el.html(this.template)
        .unbind("mouseup")
        .bind("mouseup", this.defineSelection);

      var pageCanvas = $('#pageCanvas');
      var linkCanvas = $('#linkCanvas');
      var pageText = $('.pageText');
      var annotations = $('.annotations');

      var resizeTimer = null;

      $(window).resize(function() {
        if (resizeTimer) {
          clearTimeout(resizeTimer);
        }
        resizeTimer = setTimeout(function() {
          self.model.getPart(self.textOffset, textSize, true);
        }, 300);
        renderCanvas(pageCanvas, pageText, model.get('annotations'));
        renderLinks(pageText, linkCanvas, model.get('annotations'), annotations);
      });
      annotations.scroll(function() {
        renderLinks(pageText, linkCanvas, model.get('annotations'), annotations);
      });
      model.bind("change:text", function() {
        pageText.html(model.get("cachedHTML"));
      });
      model.bind("change:annotations", function() {
        console.log("Semantics changed - re-rendering");
        model.set({
          cachedHTML : Textus.Util.markupText(model.get("text"), model.get("offset"), model.get("typography"),
              model.get('annotations'))
        });
        pageText.html(model.get("cachedHTML"));
        self.populateAnnotationContainer(model.get('annotations'), annotations);
        renderCanvas(pageCanvas, pageText, model.get('annotations'));
        renderLinks(pageText, linkCanvas, model.get('annotations'), annotations);
      });
      $('#nextPageButton', this.$el).click(function() {
        self._forward();
        return false;
      });
      $('#previousPageButton', this.$el).click(function() {
        self._back();
        return false;
      });
    },

    _forward: function() {
      this.model.getPart(this.textOffset
            + this.model.currentText.get("text").length, this.textSize, true);
    },

    _back : function() {
      this.model.getPart(
        this.textOffset - this.model.currentText.get("text").length,
        this.textSize, true);
    },

    destroy : function() {
      var model = this.model = this.options.textModel;
      model.unbind("change:text");
      model.unbind("change:annotations");
      $(window).unbind("resize");
    },
    /**
     * Populates the test container with the specified HTML and returns its height in pixels.
     */
    measure : function(html) {
      var targetWidth = $('.pageText').width();
      var testContainer = $('.pageTextMeasure');
      testContainer.width(targetWidth);
      testContainer.html(html);
      var height = testContainer.height();
      testContainer.html("");
      return height;
    },
    pageHeight : function() {
      return $('.pageText').height();
    },
    /**
     * Handle text selection, pulls the current selection out and calls the presenter with it if
     * possible.
     */
    defineSelection : function() {
      /*
       * Calculate the offset of the current node relative to its parent, where the offset is
       * the sum of the lengths of all preceding text nodes not including the current one.
       * This is needed because we want to get the number of characters in text nodes between
       * the selection end points and the start of the child list of the parent to cope with
       * the additional spans inserted to mark semantic annotations.
       */
      var offsetInParent = function(currentNode) {
        var count = 0;
        var node = currentNode.previousSibling;
        while (node != null) {
          if (node.nodeType == 3) {
            count = count + node.length;
          }
          node = node.previousSibling;
        }
        return count;
      };
      /*
       * Only currently supporting the non-IE text range objects, this works fine for the
       * browsers we actually support!
       */
      if (window.getSelection && this.model) {
        var userSelection = window.getSelection();
        var fromNode = userSelection.anchorNode;
        var toNode = userSelection.focusNode;
        if (fromNode != null && toNode != null) {
          var fromChar = parseInt(fromNode.parentNode.getAttribute("offset"))
              + parseInt(userSelection.anchorOffset) + offsetInParent(fromNode)
              - this.model.get("offset");
          var toChar = parseInt(toNode.parentNode.getAttribute("offset"))
              + parseInt(userSelection.focusOffset) + offsetInParent(toNode) - this.model.get("offset");
          this.handleTextSelection(fromChar + this.model.get("offset"), toChar
              + this.model.get("offset"), this.model.get("text").substring(fromChar, toChar));
        }
      } else if (document.selection) {
        console.log("MS Text Range not supported!");
      }
    },

    /**
     * Cnreate DIV elements in the annotation container corresponding to the supplied semantic
     * annotations.
     * 
     * @param semantics
     *            An array of semantic annotation objects to display in the container
     * @param annotationContainer
     *            The div into which annotation object representations are to be injected
     */
    populateAnnotationContainer: function(semantics, annotationContainer) {
      var self = this;
      annotationContainer.empty();
      semantics.sort(function(a, b) {
        if (a.start != b.start) {
          return a.start - b.start;
        } else {
          return a.end - b.end;
        }
      });
      semantics.forEach(function(annotation) {
        var d = $("<div class='annotation' annotation-id=\"" + annotation.id + "\"/>");
        var colour = {
          'private' : 'red',
          'provisional' : '#cc9933',
          'final' : 'black',
          'unknown' : 'pink'
        }[annotation.visibility ? annotation.visibility : 'unknown'];
        var userName = (annotation.dynamic && annotation.dynamic.displayName ? annotation.dynamic.displayName : annotation.user);
        var userDisplay = {
          'private' : userName + " <sup style='color:" + colour + "'>[private]</sup>",
          'provisional' : userName + " <sup style='color:" + colour + "'>[provisional]</sup>",
          'final' : userName,
          'unknown' : userName
        }[annotation.visibility ? annotation.visibility : 'unknown'];
        d.append($("<div style='color:#555; padding-bottom:4px;'>" + userDisplay + "</div>"));
        if (annotationRenderers[annotation.type]) {
          d.append(annotationRenderers[annotation.type](annotation.payload));
        } else {
          d.append(annotation.id);
        }
        console.log(self.user.id);
        if (self.loggedIn && self.user.id === annotation.user
            && annotation.visibility != 'final') {
          var a = $("<a class='btn btn-success edit-annotation-button'>"
              + "<i class='icon-edit icon-white'></i></a>");
          a.click(function(event) {
            self.editAnnotation(event, annotation);
          });
          d.prepend(a);
        }
        annotationContainer.append(d);
      });
    },
    
    // -------------------
    // presenter methods - mediate between user interaction and the result of
    // that interaction

    /**
     * Called by the view when a selection of text has been made, used to set the text
     * selection model.
     * 
     * @param start
     *            The absolute index of the first character in the selected text.
     * @param end
     *            The absolute index of the last character in the selected text, should
     *            be start + text.length assuming all's working.
     * @param text
     *            The text of the selection.
     */
    handleTextSelection: function(start, end, text) {
      if (!isNaN(start) && !isNaN(end)) {
        this.selection.set({
          start : ((start < end) ? start : end),
          end : ((end > start) ? end : start),
          text : text
        });
      }
    },
    editAnnotation : function(event, annotation) {
      Textus.Util.showModal({
        constructor : function(container, header, closeModal) {
          var editView = new Textus.Annotation.Editor({
            presenter : {
              updateAnnotation : function(annotation) {
                $.post("api/semantics/" + annotation.id, annotation, function(response) {
                  if (response.success) {
                    // updateTextAsync(models.textLocationModel.get("textId"), models.textLocationModel.get("offset"), true, textView.pageHeight(), textView.measure);
                    closeModal();
                  } else {
                    window.alert(respose.message);
                    closeModal();
                  }
                });
              }
            },
            annotation : annotation
          });
          editView.render();
          container.append(editView.el);
          header.append("<h4>Edit annotation [" + annotation.visibility + "]</h4>");
          firingKeyEvents = false;
        },
        beforeClose : function() {
          firingKeyEvents = true;
          return true;
        },
        position : "left"
      }, event);
    }
  });

  /**
   * Get the offset of the target in the container's coordinate space.
   */
  function relativeCoords(container, target) {
    return {
      x : target.offset().left - container.offset().left,
      y : target.offset().top - container.offset().top
    };
  }

  var annotationRenderers = Textus.Annotation.renderers;

  /**
   * Resize, clear and re-render the lines linking annotation blocks to their corresponding divs
   * 
   * @param canvas
   *            The CANVAS element to use when drawing in the annotation links
   * @param textContainer
   *            The element containing the entire text area, used to set the canvas size
   *            appropriately.
   * @param semantics
   *            The semantic annotations, which must have been updated with the 'anchor' property
   *            by the renderCanvas method prior to this being called.
   * @param annotationContainer
   *            The DIV containing annotation elements as immediate children.
   */
  function renderLinks(textContainer, canvas, semantics, annotationContainer) {
    var width = textContainer.outerWidth(true);
    var height = textContainer.outerHeight(true);
    var backgroundHeight = annotationContainer.outerHeight(true);
    canvas.get(0).height = height - 20;
    canvas.get(0).width = width;
    var ctx = canvas.get(0).getContext("2d");
    ctx.lineWidth = 2;
    /*
     * Gather up all the annotated and positioned regions on the page ready to then iterate over
     * the elements in the annotation container and draw in the links.
     */
    regions = {};
    semantics.forEach(function(annotation) {
      if (annotation.hasOwnProperty("anchor")) {
        regions[annotation.id] = {
          x : annotation.anchor.x,
          y : annotation.anchor.y,
          colour : (annotation.dynamic && annotation.dynamic.colour ? annotation.dynamic.colour : "rgba(0,0,0,0.2)")
        };
      }
    });

    /*
     * Remove any annotation elements which have somehow managed to get into the panel even
     * though we don't have the corresponding region rendered - this can happen sometimes with
     * annotations which end with certain kinds of block elements. While we're doing this sum up
     * the total height of all annotation divs which are left in order to work out whether we
     * can balance them.
     */
    var space = annotationContainer.height() - 60;
    annotationContainer.children().each(function() {
      var id = $(this).attr("annotation-id");
      if (regions[id]) {
        var height = $(this).outerHeight();
        space = space - height;
      } else {
        $(this).remove();
      }
    });
    $('.annotation-spacer', annotationContainer).remove();
    if (space > 0) {
      annotationContainer.children().each(function() {
        /* Find ideal target offset */
        var child = $(this);
        var id = child.attr("annotation-id");
        var childHeight = child.outerHeight(true);
        var desiredY = Math.max(0, regions[id].y - childHeight / 2) + 20;
        var currentY = relativeCoords(canvas, child).y + childHeight / 2;
        if (currentY < desiredY) {
          var size = Math.min(desiredY - currentY, space);
          child.before("<div class='annotation-spacer' style='height:" + size + "px'></div>");
          space = space - size;
        }
      });
    }
    annotationContainer.children('.annotation').each(function() {
      var child = $(this);
      var margin = 10;
      var childHeight = child.outerHeight(true);
      var id = child.attr("annotation-id");
      var coords = relativeCoords(canvas, child);
      if (coords.y >= (-childHeight) && coords.y <= backgroundHeight) {
        var region = regions[id];
        var anchorY = coords.y + (childHeight / 2);
        if (coords.y + margin < region.y && coords.y - margin + (childHeight) > region.y) {
          anchorY = region.y;
        } else if (coords.y - margin + (childHeight) < region.y) {
          anchorY = coords.y + childHeight - margin;
        } else if (coords.y + margin > region.y) {
          anchorY = coords.y + margin;
        }
        if (anchorY > 0 && anchorY < backgroundHeight) {
          ctx.strokeStyle = region.colour;
          ctx.beginPath();
          ctx.moveTo(region.x, region.y);
          ctx.lineTo(coords.x, anchorY);
          ctx.closePath();
          ctx.stroke();
        }
        ctx.fillStyle = region.colour;
        ctx.fillRect(coords.x, coords.y, 25, Math.min(child.outerHeight(), backgroundHeight - coords.y));
      }
    });
  }

  function getLineHeight(e) {
    while (e != null && e.css("line-height").match(/\d+/) == null) {
      console.log(e);
      e = e.parent();
      console.log(e);
    }
    if (e == null) {
      return 0;
    }
    return parseInt(e.css("line-height").match(/\d+/)[0]);
  }

  /**
   * Resize, clear and re-render the overlay of annotation positions on the canvas. This assumes
   * that textContainer already contains the appropriate markup including the empty span elements
   * indicating annotation start and end points. Updates the 'anchor' property of the annotation
   * elements to be the coordinate to use when drawing lines to the divs.
   * 
   * @param canvas
   *            The CANVAS element to use when drawing the annotation markers
   * @param textContainer
   *            The element containing the entire text area, used to set the canvas size
   *            appropriately.
   * @param semantics
   *            The semantic annotations, calling this will update the 'anchor' property which
   *            then allows the renderLinks method to run correctly.
   */
  var renderCanvas = function(canvas, textContainer, semantics) {
    var width = textContainer.outerWidth(true);
    var height = textContainer.outerHeight(true) - 20;
    canvas.get(0).height = height - 20;
    canvas.get(0).width = width;
    var ctx = canvas.get(0).getContext("2d");
    var leftMargin = 30;
    var rightMargin = textContainer.width() + leftMargin;
    /*
     * Retrieve a list of all the elements corresponding to semantic annotations, pair them up
     * in a map containing all the coordinates and identifiers. Regions are defined as
     * {id:string, startx:int, starty:int, startlh:int, endx:int, endy:int, endlh:int} and keyed
     * on the same id string as held in the record.
     */
    var regions = {};
    var regionList = [];
    $(".textus-annotation-start").each(function() {
      var coords = relativeCoords(canvas, $(this));

      var lineHeight = getLineHeight($(this));
      var id = $(this).attr("annotation-id");
      // If we're right on the end of the line move the start coordinates to the
      // following
      // line
      if (coords.x >= rightMargin) {
        coords.x = leftMargin;
        coords.y = coords.y + lineHeight;
      }
      regions[id] = {
        id : id,
        startx : coords.x,
        starty : coords.y,
        startlh : lineHeight
      };
    });
    $(".textus-annotation-end").each(function() {
      var coords = relativeCoords(canvas, $(this));

      var lineHeight = getLineHeight($(this));
      var id = $(this).attr("annotation-id");
      var struct = regions[id];
      struct.endx = coords.x;
      struct.endy = coords.y;
      struct.endlh = parseInt(lineHeight);
      regionList.push(struct);
    });
    regions = {};
    semantics.forEach(function(annotation) {
      regions[annotation.id] = annotation;
    });

    /*
     * A number of pixels to shift the coloured block down by, helps balance the result
     * visually.
     */
    var colourOffset = 3;
    // Render all the regions...
    regionList.forEach(function(r) {
      /*
       * Retrieve the colour, if specified, for this region. In the full system this will be
       * derived from other properties of the annotation but this will do for now. Defaults to
       * red if colour isn't available.
       */
      var annotation = regions[r.id];
      if (annotation.dynamic && annotation.dynamic.colour) {
        ctx.fillStyle = annotation.dynamic.colour;
      } else {
        ctx.fillStyle = "rgba(255,0,0,0.1)";
      }
      if (r.starty == r.endy) {
        /*
         * Check for a region where the annotation start and end points are on the same
         * line, in which case the rectangle is simple.
         */
        ctx.fillRect(r.startx, colourOffset + r.starty - r.startlh, r.endx - r.startx, r.startlh);
        annotation.anchor = {
          x : r.endx,
          // x : rightMargin,
          y : r.endy - (r.endlh / 2)
        };
      } else {
        /*
         * Otherwise draw rectangles from the start to the right margin and from the left
         * margin to the end.
         */
        ctx.fillRect(leftMargin, colourOffset + r.endy - r.endlh, r.endx - leftMargin, r.endlh);
        ctx.fillRect(r.startx, colourOffset + r.starty - r.startlh, rightMargin - r.startx, r.startlh);
        annotation.anchor = {
          x : rightMargin,
          y : r.starty - (r.startlh / 2)
        };
        /*
         * If there were lines inbetween the two we just drew, draw in a box to completely
         * fill the space.
         */
        if (r.starty < r.endy - r.endlh) {
          ctx.fillRect(leftMargin, colourOffset + r.starty, rightMargin - leftMargin, r.endy
              - (r.starty + r.endlh));
        }
      }
      /*
       * Draw in start and end points for annotations, just to make things more obvious when
       * they're going wrong!
       */
      ctx.fillRect(r.startx, colourOffset + r.starty - r.startlh, (Math.min(6, rightMargin - r.startx)),
          r.startlh);
      ctx.fillRect(r.endx - 6, colourOffset + r.endy - r.endlh, 6, r.endlh);
    });
  };

})(Textus);


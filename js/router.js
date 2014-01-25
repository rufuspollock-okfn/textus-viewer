// Router, loads appropriate pages based on target URL
define(
		[ 'activities/appActivity', 'activities/readTextActivity',
				'models' ], function(AppActivity, ReadTextActivity, models) {

			/**
			 * Router defined here, add client-side routes here to handle additional pages and
			 * manage history sensibly.
			 */
			var appRouter = new (Backbone.Router.extend({

				routes : {
					'text/:textId/:offset' : 'text',
					'texts' : 'texts',
					'meta/:textId' : 'textMeta',
					'*actions' : 'defaultActions'
				},

				texts : function() {
					this.startActivity(new ListTextsActivity());
				},

				text : function(textId, offset) {
					this.startActivity(new ReadTextActivity(), {
						textId : textId,
						offset : parseInt(offset),
						router : appRouter
					});
				},

				textMeta : function(textId) {
					this.startActivity(new EditTextMetadataActivity(textId));
				},

				review : function() {
					this.startActivity(new ReviewTextUploadActivity());
				},

				defaultActions : function() {
					// this.startActivity(new AppActivity());
					this.startActivity(new ReadTextActivity(), {
						textId : 1,
						offset : 0,
						router : appRouter
					});
				}
			}));

			return {
				initialize : function() {
					Backbone.history.start();
				}
			};

		});

var App = Ember.Application.create();

App.slides = Ember.ArrayProxy.create({
	content:[]
});

App.slideshowView = Ember.View.extend({
	contentBinding:"App.slides",
	containerWidth:400,
	multiple:function(){
		return (this.get('content').get('length') > 1) ? true : false;
	}.property('content.length'),
	classNames:['slideshow-container'],
	next:function(){
		var current = App.slides.findProperty('selected', true);
		var ind = App.slides.indexOf(current);
		if(ind !== App.slides.get('content').length-1){
			var next = App.slides.objectAt(ind+1);

			current.set('selected',false);
			next.set('selected', true);

			var displacement = this.get('containerWidth') * (1 + ind);
			this.$('.slideshow').animate({
				left:-displacement
			});
		}
	},
	prev:function(){
		var current = App.slides.findProperty('selected', true);
		var ind = App.slides.indexOf(current);
		if(ind !== 0){
			var prev = App.slides.objectAt(ind-1);

			current.set('selected',false);
			prev.set('selected', true);

			var displacement = this.get('containerWidth') * (1 - ind);
			this.$('.slideshow').animate({
				left:displacement
			});
		}
	}
});

App.slideshowControlsView = Ember.View.extend({
	click:function(){
		this.$().hasClass('next') ? this.get('parentView').next() : this.get('parentView').prev();
	}
});

App.slidesCollectionView = Ember.CollectionView.extend({
	emptyView: Ember.View.extend({
		template: Ember.Handlebars.compile("<div class=\"placeholder\"><div>Upload your images</div></div>")
	}),
	itemViewClass:"App.slideView",
	classNames:["slideshow"],
	didInsertElement:function(){
		if(App.slides.get('content').length){
			var width = this.get('parentView').get('containerWidth');
			$('.slideshow').width(width * App.slides.get('content').length);
		}
	}.observes('App.slides.content.length')
});

App.slideView = Ember.View.extend({
	templateName: 'slide-item',
	tagName:'div',
	isSelected:'content.selected',
	classNames:['slide'],
	classNameBindings:['isSelected:selected']
});

// A file uploader sub-view for each page
App.fileUploader = Ember.View.extend({
	counter:0,
	template:Ember.Handlebars.compile('<input type="file" multiple="multiple" class="files input-file">'),
	change:function(e){
		var files = e.target.files;
		var temp = [];
		var left = files.length;
		var self = this;

		for(i=0,il=files.length;i<il;i++){
			var pr = this.loadImage(files[i]);
			(function(ind){
				pr.done(function(result){
					temp[ind] = Ember.Object.create({
						src:result,
						selected: false
					});
					self.incrementProperty('counter');
					left--;
					if(left === 0){
						App.slides.pushObjects(temp);
						//set 'selected' if this is the very first upload.
						if(self.get('counter') === files.length){
							App.slides.objectAt(0).set('selected', true);
						}
					}
				});
			})(i);
		}
	},
	loadImage:function(file){
		var dfd = $.Deferred();

		//TODO: Tighten the regex
		if (file.type.match(/image\.*/)){
			//console.log(file);
			try{
				var fileReader = new FileReader();
				fileReader.onload = function(e){
					dfd.resolve(e.target.result);
				};

				fileReader.readAsDataURL(file);
			}
			catch(_){
				alert('We use new file uploading technology which your current browser doesn\'t seem to support. Please upgrade your browser. We recommend Chrome/Firefox.');
			}
		}

		return dfd.promise();
	}
});

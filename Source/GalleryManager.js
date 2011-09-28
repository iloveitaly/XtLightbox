var GalleryManager = new Class({
	Implements: Options,
	options: {
		thumbControlsHolder: 'thumbnail_controls',
		thumbPrevButton: 'prev_button',
		thumbNextButton: 'next_button',
		pictureHolder: 'picture_holder',	// holds the clickable picture
		thumbGroupHolder: 'thumbnail_holder',
		thumbHolder: 'infinite_width',
		
		thumbBoxSize: 62,
		customGalleryConfig: null,
		onShow: null,
		lazyLoadThumbnails: true
	},
	
	initialize: function(galleryList, options) {
		this.setOptions(options);
		
		$(this.options.thumbPrevButton).addEvent('click', this.previousThumbs.bind(this));
		$(this.options.thumbNextButton).addEvent('click', this.nextThumbs.bind(this));
		
		this.galleries = {};
		this.lazyLoaders = {};
		
		galleryList.each(function(galleryID) {
			var galleryImages = $$("#" + galleryID + " ." + this.options.thumbGroupHolder + " a");

			this.galleries[galleryID] = new XtLightbox(galleryImages, {
			    loop: true,
				preload: false,
				
		        adaptorOptions: {
		            Image: {
		                lightboxCompat: false
		            }
		        },
				
				onShow: function() {
					this.configureThumbs($(galleryID).getElement('.' + this.options.thumbGroupHolder));
					if(this.options.lazyLoadThumbnails) this.lazyLoaders[galleryID].manualLoad();
					if(this.options.onShow) this.options.onShow(galleryID);
				}.bind(this),
				
				onHide: function() {
					this.hideThumbs();
				}.bind(this)
			});
			
			if(this.options.lazyLoadThumbnails) {
				this.lazyLoaders[galleryID] = new LazyLoad({
					container: $(galleryID),
					elements: '.' + this.options.thumbGroupHolder + ' .' + this.options.thumbHolder + ' a img',
					useScrollLoad: false
				});
			}
			
			// make the first preview image clickable and tie it to the real image
			$$('#' + galleryID + ' .' + this.options.pictureHolder + ' a')[0].addEvent('click', function(ev) {
				(new Event(ev)).preventDefault();

				$(galleryID).
					getElement('.' + this.options.thumbGroupHolder).
					getElement('.infinite_width').
					getFirst('a').
					fireEvent('click', new Event());
			}.bind(this));
			
			if(this.options.customGalleryConfig) {
				this.options.customGalleryConfig(galleryID);
			}
		}, this);		
	},
	
	configureThumbs: function(thumbsHolder) {
		this.viewSize = window.getScrollSize();
		this.thumbSize = thumbsHolder.getElement('.infinite_width').getChildren().length * this.options.thumbBoxSize;
		var shiftSize = Math.floor((this.viewSize.x - 100) / this.options.thumbBoxSize) * this.options.thumbBoxSize - 5 /* padding */;

		if(this.thumbSize > this.viewSize.x) {
			$(this.options.thumbControlsHolder).setStyles({
				'display':'block'
			});

			thumbsHolder.setStyles({
				'display':'block',
				'width':shiftSize,
				'left':Math.round((this.viewSize.x - shiftSize)/2) - 10
			});
		} else {
			thumbsHolder.setStyles({
				'display':'block',
				'width':this.thumbSize,
				'left':Math.round((this.viewSize.x - this.thumbSize)/2)
			});		
		}

		this.currentThumbHolder = thumbsHolder;		
	},
	
	previousThumbs: function() {
		var infiniteHolder = this.currentThumbHolder.getElement('div');
		var currentShift = Math.abs(infiniteHolder.getStyle('margin-left').toInt())
		var nextShift = Math.floor((this.viewSize.x - 100) / this.options.thumbBoxSize) * this.options.thumbBoxSize;

		if(-nextShift + currentShift >= 0) {
			infiniteHolder.tween('margin-left', nextShift - currentShift);
		}	
	},
	
	nextThumbs: function() {
		var infiniteHolder = this.currentThumbHolder.getElement('div');
		var currentShift = Math.abs(infiniteHolder.getStyle('margin-left').toInt())
		var nextShift = Math.floor((this.viewSize.x - 100) / this.options.thumbBoxSize) * this.options.thumbBoxSize;

		if(nextShift + currentShift < this.thumbSize) {
			infiniteHolder.tween('margin-left', -nextShift -currentShift);
		}
	},
	
	hideThumbs: function() {
		this.currentThumbHolder.setStyle('display', 'none');
		$(this.options.thumbControlsHolder).setStyle('display', 'none');
	}
});

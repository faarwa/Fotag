'use strict';

/**
 * A function that creates and returns all of the model classes and constants.
  */
function createViewModule() {

    var LIST_VIEW = 'LIST_VIEW';
    var GRID_VIEW = 'GRID_VIEW';
    var RATING_CHANGE = 'RATING_CHANGE';
    var EDIT_CAPTION = "Double click to edit caption";
    var LAST_MODIFIED = "Last Modified: ";

    /**
     * An object representing a DOM element that will render the given ImageModel object.
     */
    var ImageRenderer = function(imageModel) {
        var self = this; 

        // Get the image template
        var imageTemplate = document.getElementById('image-template');

        // Create a new div for this image model to be rendered in and import content of template
        this.container = document.importNode(imageTemplate.content, true);
        // this.container.appendChild(document.importNode(imageTemplate.content, true));

        // Keep track of the image tag to change the source
        this.image = this.container.querySelector('.image');
        this.setToView(GRID_VIEW);

        // Get the star template for rating an image and add to metadata
        var starRatingTemplate = document.getElementById('star-rating-template');
        var imageMetadata = this.container.querySelector('.img-metadata');
        imageMetadata.appendChild(document.importNode(starRatingTemplate.content, true));

        // Add event listeners for image rating
        var stars = imageMetadata.getElementsByClassName("myrating");
        _.each(stars, function(star) {
            star.addEventListener('click', function() {
                self.imageModel.setRating(parseInt(star.value));
            })
        })

        // This sets the image tag's path
        this.setImageModel(imageModel);

        // Set name of image in div
        var imageName = imageMetadata.querySelector('.image-name');
        imageName.textContent = this.imageModel.getName();

        // Get the overall image view
        var imageView = this.container.querySelector('.image-view');

        // Set caption in div
        var captionInput = imageView.querySelector('.image-caption-editable');
        if (this.imageModel.getCaption() == "") {
            captionInput.textContent = EDIT_CAPTION;
        } else {
            captionInput.textContent = this.imageModel.getCaption();
        }

        // Set event listeners for caption editing
        captionInput.addEventListener('keydown', function(event) {

            // This limits the amount of characters in the caption
            var charCount = captionInput.textContent.length;
            if (charCount >= 30) {
                // Unless the user is backspacing, prevent any key strokes when char limit is reached
                if (event.which != 8) {
                    event.preventDefault();
                }
            }

            // Recognize new line event and set div out of focus (enter)
            var newLine = event.which == 13;
            if (newLine) {
                event.target.blur();
                event.preventDefault();
            }
        }, true);

        // On double click, just erase content of caption
        captionInput.addEventListener('dblclick', function(event) {
            captionInput.textContent = "";
        }, true);

        // When div is out of focus (user clicked outside or hit enter), save the caption
        captionInput.addEventListener('blur', function() {
            if (captionInput.textContent != EDIT_CAPTION) {
                // Save the new caption
                self.imageModel.setCaption(captionInput.textContent);

                // Don't want to show a blank caption, so reset default as image now has no caption
                if (captionInput.textContent == "") {
                    captionInput.textContent = EDIT_CAPTION;
                }
            } 
        }, true);

        // Set image modification date
        var modDate = imageMetadata.querySelector('.image-last-modified');
        var formattedDate = formatDate(this.imageModel.getModificationDate());
        modDate.textContent = LAST_MODIFIED+formattedDate;

        // Add event listener to image to enlarge on click
        var imageSrc = this.image.src;

        this.image.addEventListener('click', function() {
            // Create a new div to overlay on top of whole screen
            var largeImageDiv = document.createElement('div');
            largeImageDiv.classList.add('selected-large-image');

            // Create new image tag with the selected image's path
            var image = document.createElement('img');
            image.src = imageSrc;

            // Add styling and append to div and app container
            image.classList.add('selected-image');
            largeImageDiv.appendChild(image);
            var appContainer = document.getElementById('app-container');
            appContainer.appendChild(largeImageDiv);

            // Add an event listener to remove self from screen when clicked again
            largeImageDiv.addEventListener('click', function(event) {
                appContainer.removeChild(largeImageDiv);
            });
        });
    };

    _.extend(ImageRenderer.prototype, {

        /**
         * Returns an element representing the ImageModel, which can be attached to the DOM
         * to display the ImageModel.
         */
        getElement: function() {
            return this.container;
        },

        /**
         * Returns the ImageModel represented by this ImageRenderer.
         */
        getImageModel: function() {
            return this.imageModel;
        },

        /**
         * Sets the ImageModel represented by this ImageRenderer, changing the element and its
         * contents as necessary.
         */
        setImageModel: function(imageModel) {
            if (this.imageModel == imageModel) {
                return;
            }

            var self = this;

            // Set path
            this.imageModel = imageModel;
            this.image.src = imageModel.path;

            // Show the rating of the image
            if (this.imageModel.rating != 0) {
                var domId = 'rating'+this.imageModel.rating;
                var button = this.container.getElementById(domId);
                button.click();
            }

            var imageMetadata = this.container.querySelector('.img-metadata');
            var modDate = imageMetadata.querySelector('.image-last-modified');

            // If any change happens in image model, need to update the modification date on screen
            this.imageModel.addListener(function(model, date) {
                var formattedDate = formatDate(date);
                modDate.textContent = LAST_MODIFIED+formattedDate;
            })
        },

        /**
         * Changes the rendering of the ImageModel to either list or grid view.
         * @param viewType A string, either LIST_VIEW or GRID_VIEW
         */
        setToView: function(viewType) {
            this.viewType = viewType;

            // Get the image elements
            var imageDom = this.container.querySelector('.image-view');
            var image = this.container.querySelector('.image');
            var imageMetadata = this.container.querySelector('.img-metadata');

            // Set styling of picture according to what view is chosen
            if (this.viewType == GRID_VIEW) {
                imageDom.classList.add('image-view-grid');
                imageDom.classList.remove('image-view-list');
                image.classList.remove('image-list');
                image.classList.add('image-grid');
                imageMetadata.classList.remove('img-metadata-list');

            } else {
                imageDom.classList.add('image-view-list');
                imageDom.classList.remove('image-view-grid');
                image.classList.remove('image-grid');
                image.classList.add('image-list');
                imageMetadata.classList.add('img-metadata-list');
            }
        },

        /**
         * Returns a string of either LIST_VIEW or GRID_VIEW indicating which view type it is
         * currently rendering.
         */
        getCurrentView: function() {
            return this.viewType;
        }
    });

    /**
     * A factory is an object that creates other objects. In this case, this object will create
     * objects that fulfill the ImageRenderer class's contract defined above.
     */
    var ImageRendererFactory = function() {
    };

    _.extend(ImageRendererFactory.prototype, {

        /**
         * Creates a new ImageRenderer object for the given ImageModel
         */
        createImageRenderer: function(imageModel) {
            var imageRenderer = new ImageRenderer(imageModel);
            return imageRenderer;
        }
    });

    /**
     * An object representing a DOM element that will render an ImageCollectionModel.
     * Multiple such objects can be created and added to the DOM (i.e., you shouldn't
     * assume there is only one ImageCollectionView that will ever be created).
     */
    var ImageCollectionView = function() {
        // Get the template for an image collection view
        var imageCollectionTemplate = document.getElementById('image-collection-template');
        this.container = document.createElement('div');
        this.container.appendChild(document.importNode(imageCollectionTemplate.content, true));
        this.imageCollectionDiv = this.container.querySelector('.image-collection');

        // Set default view type to grid and no filter
        this.viewType = GRID_VIEW;
        this.currentRatingFilter = 0;
    };

    _.extend(ImageCollectionView.prototype, {
        /**
         * Returns an element that can be attached to the DOM to display the ImageCollectionModel
         * this object represents.
         */
        getElement: function() {
            return this.container;
        },

        /**
         * Gets the current ImageRendererFactory being used to create new ImageRenderer objects.
         */
        getImageRendererFactory: function() {
            return this.imageRendererFactory;
        },

        /**
         * Sets the ImageRendererFactory to use to render ImageModels. When a *new* factory is provided,
         * the ImageCollectionView should redo its entire presentation, replacing all of the old
         * ImageRenderer objects with new ImageRenderer objects produced by the factory.
         */
        setImageRendererFactory: function(imageRendererFactory) {
            this.imageRendererFactory = imageRendererFactory;

            var self = this;
            var imageModels = this.imageCollectionModel.getImageModels();

            // When a new factory is set, redraw the image models by creating new renderers
            _.each(imageModels, function(model) {
                if (model.rating == self.getCurrentRatingFilter() || self.getCurrentRatingFilter() == 0) {
                    var imageRenderer = imageRendererFactory.createImageRenderer(model);
                    imageRenderer.setToView(self.viewType);
                    self.imageCollectionDiv.appendChild(imageRenderer.getElement());
                }
            })
        },

        /**
         * Returns the ImageCollectionModel represented by this view.
         */
        getImageCollectionModel: function() {
            return this.imageCollectionModel;
        },

        /**
         * Sets the ImageCollectionModel to be represented by this view. When setting the ImageCollectionModel,
         * you should properly register/unregister listeners with the model, so you will be notified of
         * any changes to the given model.
         */
        setImageCollectionModel: function(imageCollectionModel) {
            if (this.imageCollectionModel == imageCollectionModel) {
                return;
            }

            this.imageCollectionModel = imageCollectionModel;
        },

        /**
         * Changes the presentation of the images to either grid view or list view.
         * @param viewType A string of either LIST_VIEW or GRID_VIEW.
         */
        setToView: function(viewType) {
            if (this.viewType == viewType) {
                return;
            }

            // When the view type changes, remove current div and reset factory to redraw
            this.viewType = viewType;
            var imageCollection = document.querySelector('.image-collection');
            imageCollection.innerHTML = "";
            this.setImageRendererFactory(new ImageRendererFactory());
        },

        /**
         * Returns a string of either LIST_VIEW or GRID_VIEW indicating which view type is currently
         * being rendered.
         */
        getCurrentView: function() {
            return this.viewType;
        },

        /**
         * Changes the rating filter of the images to a value [0,5]
         * @param rating A number [0,5]
         */
        setRatingFilter: function(rating) {
            // When there's a new rating filter, reset factory to redraw
            this.currentRatingFilter = rating;
            var imageCollection = document.querySelector('.image-collection');
            imageCollection.innerHTML = "";
            this.setImageRendererFactory(new ImageRendererFactory());
        },

        /**
         * Returns a number [0,5] indicating what the current rating filter is
         */
        getCurrentRatingFilter: function() {
            return this.currentRatingFilter;
        },
    });

    /**
     * An object representing a DOM element that will render the toolbar to the screen.
     */
    var Toolbar = function() {
        // For callback below
        var self = this;

        // Read in toolbar template and instantiate it
        var toolbarTemplate = document.getElementById('toolbar-template');
        this.container = document.createElement('div');
        this.container.appendChild(document.importNode(toolbarTemplate.content, true));
        this.viewType = GRID_VIEW;
        this.listeners = [];
        this.ratingFilter = 0;

        // Read in star filter template and add to toolbar
        var starFilterTemplate = document.getElementById('star-filter-template');
        var navBar = this.container.querySelector('.filter');
        navBar.appendChild(document.importNode(starFilterTemplate.content, true));
    };

    _.extend(Toolbar.prototype, {
        /**
         * Returns an element representing the toolbar, which can be attached to the DOM.
         */
        getElement: function() {
            return this.container;
        },

        /**
         * Registers the given listener to be notified when the toolbar changes from one
         * view type to another.
         * @param listener_fn A function with signature (toolbar, eventType, eventDate), where
         *                    toolbar is a reference to this object, eventType is a string of
         *                    either, LIST_VIEW, GRID_VIEW, or RATING_CHANGE representing how
         *                    the toolbar has changed (specifically, the user has switched to
         *                    a list view, grid view, or changed the star rating filter).
         *                    eventDate is a Date object representing when the event occurred.
         */
        addListener: function(listener_fn) {
            if (!_.isFunction(listener_fn)) {
                throw new Error("Invalid arguments to Toolbar.addListener: " + JSON.stringify(arguments));
            }

            this.listeners.push(listener_fn);
        },

        /**
         * Removes the given listener from the toolbar.
         */
        removeListener: function(listener_fn) {
            if (!_.isFunction(listener_fn)) {
                throw new Error("Invalid arguments to Toolbar.removeListener: " + JSON.stringify(arguments));
            }
            this.listeners = _.without(this.listeners, listener_fn);
        },

        /**
         * Sets the toolbar to either grid view or list view.
         * @param viewType A string of either LIST_VIEW or GRID_VIEW representing the desired view.
         */
        setToView: function(viewType) {
            var self = this;
            this.viewType = viewType;
            var date = new Date();

            // Notify listeners that view type has changed
            _.each(this.listeners, function(listener) {
                listener(self, viewType, date);
            })
        },

        /**
         * Returns the current view selected in the toolbar, a string that is
         * either LIST_VIEW or GRID_VIEW.
         */
        getCurrentView: function() {
            return this.viewType;
        },

        /**
         * Returns the current rating filter. A number in the range [0,5], where 0 indicates no
         * filtering should take place.
         */
        getCurrentRatingFilter: function() {
            return this.ratingFilter;
        },

        /**
         * Sets the rating filter.
         * @param rating An integer in the range [0,5], where 0 indicates no filtering should take place.
         */
        setRatingFilter: function(rating) {
            var self = this;
            this.ratingFilter = rating;
            var date = new Date();

            // Inform the listeners (image renderer objects) when the rating changes
            _.each(this.listeners, function(listener) {
                listener(self, RATING_CHANGE, date);
            })
        }
    });

    /**
     * An object that will allow the user to choose images to display.
     * @constructor
     */
    var FileChooser = function() {
        this.listeners = [];
        this._init();
    };

    _.extend(FileChooser.prototype, {
        // This code partially derived from: http://www.html5rocks.com/en/tutorials/file/dndfiles/
        _init: function() {
            var self = this;
            this.fileChooserDiv = document.createElement('div');
            var fileChooserTemplate = document.getElementById('file-chooser');
            this.fileChooserDiv.appendChild(document.importNode(fileChooserTemplate.content, true));
            var fileChooserInput = this.fileChooserDiv.querySelector('.files-input');
            fileChooserInput.addEventListener('change', function(evt) {
                var files = evt.target.files;
                var eventDate = new Date();
                _.each(
                    self.listeners,
                    function(listener_fn) {
                        listener_fn(self, files, eventDate);
                    }
                );
            });
        },

        /**
         * Returns an element that can be added to the DOM to display the file chooser.
         */
        getElement: function() {
            return this.fileChooserDiv;
        },

        /**
         * Adds a listener to be notified when a new set of files have been chosen.
         * @param listener_fn A function with signature (fileChooser, fileList, eventDate), where
         *                    fileChooser is a reference to this object, fileList is a list of files
         *                    as returned by the File API, and eventDate is when the files were chosen.
         */
        addListener: function(listener_fn) {
            if (!_.isFunction(listener_fn)) {
                throw new Error("Invalid arguments to FileChooser.addListener: " + JSON.stringify(arguments));
            }

            this.listeners.push(listener_fn);
        },

        /**
         * Removes the given listener from this object.
         * @param listener_fn
         */
        removeListener: function(listener_fn) {
            if (!_.isFunction(listener_fn)) {
                throw new Error("Invalid arguments to FileChooser.removeListener: " + JSON.stringify(arguments));
            }
            this.listeners = _.without(this.listeners, listener_fn);
        }
    });

    // Return an object containing all of our classes and constants
    return {
        ImageRenderer: ImageRenderer,
        ImageRendererFactory: ImageRendererFactory,
        ImageCollectionView: ImageCollectionView,
        Toolbar: Toolbar,
        FileChooser: FileChooser,

        LIST_VIEW: LIST_VIEW,
        GRID_VIEW: GRID_VIEW,
        RATING_CHANGE: RATING_CHANGE
    };
}
'use strict';

/**
 * A function that creates and returns all of the model classes and constants.
 */
function createModelModule() {

    var IMAGE_ADDED_TO_COLLECTION_EVENT = 'IMAGE_ADDED_TO_COLLECTION_EVENT';
    var IMAGE_REMOVED_FROM_COLLECTION_EVENT = 'IMAGE_REMOVED_FROM_COLLECTION_EVENT';
    var IMAGE_META_DATA_CHANGED_EVENT = 'IMAGE_META_DATA_CHANGED_EVENT';
    /**
     * An ImageModel represents a reference to an image on the local file system. You should assume
     * that all images are within the ./images directory.
     * @param pathToFile The relative path to the image. A string.
     * @param modificationDate The modification date of the file. A Date.
     * @param caption A user-supplied caption. Users may not provide a caption. A string.
     * @param rating The rating, from 0-5, the user has provided for the image. The rating is an integer.
     *               A rating of 0 indicates that the user has not yet supplied a rating for the image.
     * @constructor
     */
    var ImageModel = function(
        pathToFile,
        modificationDate,
        caption,
        rating
    ) {
        if (!(
                _.isString(pathToFile)
                && _.isString(caption)
                && (modificationDate instanceof Date)
                && (_.isNumber(rating) && rating >= 0 && rating <= 5)
            ))
        {
            throw new Error("Invalid arguments supplied to ImageModel: " + JSON.stringify(arguments));
        }
        this.path = pathToFile;
        this.name = pathToFile.replace("images/", "");
        this.modificationDate = modificationDate;
        this.caption = caption;
        this.rating = rating;
        this.listeners = [];
    };

    _.extend(ImageModel.prototype, {

        /**
         * Adds a listener to be notified of when the model changes.
         * @param listener_fn A function with the signature: (imageModel, eventTime),
         * where imageModel is a reference to this object, and eventTime is a Date
         * object indicating the time of the event.
         */
        addListener: function(listener_fn) {
            if (!_.isFunction(listener_fn)) {
                throw new Error("Invalid arguments to ImageModel.addListener: " + JSON.stringify(arguments));
            }

            this.listeners.push(listener_fn);
        },

        /**
         * Removes the given listener from this object.
         * @param listener_fn
         */
        removeListener: function(listener_fn) {
            if (!_.isFunction(listener_fn)) {
                throw new Error("Invalid arguments to ImageModel.removeListener: " + JSON.stringify(arguments));
            }
            this.listeners = _.without(this.listeners, listener_fn);
        },

        /**
         * Returns a string representing the caption. Must return an empty string if the
         * user has not supplied a caption for the image.
         */
        getCaption: function() {
            return this.caption;
        },

        /**
         * Sets the caption for this image.
         * @param caption A string representing a user caption.
         */
        setCaption: function(caption) {
            var self = this;
            this.caption = caption;
            var eventTime = new Date();
            this.modificationDate = eventTime;
            _.each(this.listeners, function(listener) {
                listener(self, eventTime);
            })
        },

        /**
         * Returns the user-supplied rating of the image. A user can provide a rating between 1-5.
         * If no rating has been given, should return 0.
         */
        getRating: function() {
            return this.rating;
        },

        /**
         * Sets the user-supplied rating of the image.
         * @param rating An integer in the range [0,5] (where a 0 indicates the user is clearing their rating)
         */
        setRating: function(rating) {
            var self = this;
            this.rating = rating;
            var eventTime = new Date();
            this.modificationDate = eventTime;
            _.each(this.listeners, function(listener) {
                listener(self, eventTime);
            })
        },

        /**
         * Returns the file name (not the path).
         */
        getName: function() {
            return this.name;
        },

        /**
         * Returns a complete path to the image suitable for inserting into an img tag.
         */
        getPath: function() {
            return this.path;
        },

        /**
         * Returns the modification date (a Date object) for this image.
         */
        getModificationDate: function() {
            return this.modificationDate;
        }
    });

    /**
     * Manages a collection of ImageModel objects.
     */
    var ImageCollectionModel = function() {
        var self = this;

        this.imageModels = [];
        this.listeners = [];
        this.listener_fn = function(model, date) {
            // Notify own listeners that image model data has changed
            _.each(self.listeners, function(listener) {
                listener(IMAGE_META_DATA_CHANGED_EVENT, self, model, date);
            })

            // Store new state
            storeImageCollectionModel(self);
        }
    };

    _.extend(ImageCollectionModel.prototype, {

        /**
         * Adds a listener to the collection to be notified of when the collection or an image
         * in the collection changes.
         * @param listener_fn A function with the signature (eventType, imageModelCollection, imageModel, eventDate),
         *                    where eventType is a string of either
         *                    - IMAGE_ADDED_TO_COLLECTION_EVENT,
         *                    - IMAGE_REMOVED_FROM_COLLECTION_EVENT, or
         *                    - IMAGE_META_DATA_CHANGED_EVENT.
         *                    imageModelCollection is a reference to this object, imageModel is the imageModel
         *                    that was added, removed, or changed, and eventDate is a Date object representing the
         *                    time when the change occurred.
         */
        addListener: function(listener_fn) {
            if (!_.isFunction(listener_fn)) {
                throw new Error("Invalid arguments to ImageCollectionModel.addListener: " + JSON.stringify(arguments));
            }

            this.listeners.push(listener_fn);
        },

        /**
         * Removes the given listener from the object.
         * @param listener_fn
         */
        removeListener: function(listener_fn) {
            if (!_.isFunction(listener_fn)) {
                throw new Error("Invalid arguments to ImageCollectionModel.removeListener: " + JSON.stringify(arguments));
            }
            this.listeners = _.without(this.listeners, listener_fn);
        },

        /**
         * Adds an ImageModel object to the collection. When adding an ImageModel, this object should
         * register as a listener for that object, and notify its own (i.e., the ImageCollectionModel's listeners)
         * when that ImageModel changes.
         * @param imageModel
         */
        addImageModel: function(imageModel) {
            this.imageModels.push(imageModel);
            var self = this;

            // Add self as a listener for changes in image model
            imageModel.addListener(this.listener_fn);

            // Notify own listeners that an image was added
            var date = new Date();
            _.each(this.listeners, function(listener) {
                listener(IMAGE_ADDED_TO_COLLECTION_EVENT, self, imageModel, date);
            })
        },

        /**
         * Removes the given ImageModel object from the collection and removes any listeners it has
         * registered with the ImageModel.
         * @param imageModel
         */
        removeImageModel: function(imageModel) {
            var self = this; 

            // Remove self as listener
            imageModel.removeListener(this.listener_fn);

            // Remove from array
            this.imageModels = _.without(this.imageModels, imageModel);

            // Notify own listeners that an image was removed
            var date = new Date();

            _.each(this.listeners, function(listener) {
                listener(IMAGE_REMOVED_FROM_COLLECTION_EVENT, self, imageModel, date);
            })

            // Store new state
            storeImageCollectionModel(this);
        },

        /**
         * Returns an array of all ImageModel objects currently in this collection.
         */
        getImageModels: function() {
            return this.imageModels.slice();
        }

    });

    /**
     * Given an ImageCollectionModel, stores all of its contents in localStorage.
     */
    function storeImageCollectionModel(imageCollectionModel) {
        var models = _.map(
            imageCollectionModel.getImageModels(),
            function(imageModel) {
                return {
                    path: imageModel.getPath(),
                    modificationDate: imageModel.getModificationDate(),
                    caption: imageModel.getCaption(),
                    rating: imageModel.getRating()
                };
            }
        );
        localStorage.setItem('imageCollectionModel', JSON.stringify(models));
    }

    /**
     * Returns a new ImageCollectionModel object with contents loaded from localStorage.
     */
    function loadImageCollectionModel() {
        var imageCollectionModel = new ImageCollectionModel();
        var modelsJSON = localStorage.getItem('imageCollectionModel');
        if (modelsJSON) {
            var models = JSON.parse(modelsJSON);
            _.each(
                models,
                function(model) {
                    try {
                        var imageModel = new ImageModel(
                            model.path,
                            new Date(model.modificationDate),
                            model.caption,
                            model.rating
                        );
                        imageCollectionModel.addImageModel(imageModel);
                    } catch (err) {
                        console.log("Error creating ImageModel: " + err);
                    }
                }
            );
        }
        return imageCollectionModel;
    }

    // Return an object containing all of our classes and constants
    return {
        ImageModel: ImageModel,
        ImageCollectionModel: ImageCollectionModel,

        IMAGE_ADDED_TO_COLLECTION_EVENT: IMAGE_ADDED_TO_COLLECTION_EVENT,
        IMAGE_REMOVED_FROM_COLLECTION_EVENT: IMAGE_REMOVED_FROM_COLLECTION_EVENT,
        IMAGE_META_DATA_CHANGED_EVENT: IMAGE_META_DATA_CHANGED_EVENT,

        storeImageCollectionModel: storeImageCollectionModel,
        loadImageCollectionModel: loadImageCollectionModel
    };
}
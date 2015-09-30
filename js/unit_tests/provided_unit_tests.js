'use strict';

var expect = chai.expect;

describe('Provided unit tests', function() {

    it('Test 1: Add listener to image model', function() {
        var modelModule = createModelModule();
        var firstListener = sinon.spy();

        // Create image model
        var date = new Date();
        var imageModel = new modelModule.ImageModel('images/pic.jpg', date, "", 0);
        imageModel.addListener(firstListener);
        imageModel.setRating(4);

        expect(firstListener.called, 'Image model listener should be called').to.be.ok;

        var secondListener = sinon.spy();
        imageModel.addListener(secondListener);
        imageModel.setCaption("sup");

        expect(firstListener.callCount, 'ImageModel first listener should have been called twice').to.equal(2);
        expect(secondListener.called, "ImageModel second listener should have been called").to.be.ok;
        expect(secondListener.callCount, "ImageModel second listener should have been called once").to.equal(1);

        localStorage.clear();
    });

    it('Test 2: Add listener to image collection model', function() {
    	var modelModule = createModelModule();
    	var firstListener = sinon.spy();
    	var secondListener = sinon.spy();

    	// Create image collection model
    	var imageCollectionModel = new modelModule.ImageCollectionModel();
    	imageCollectionModel.addListener(firstListener);

    	// Create image model to add to collection and listener for image
    	var date = new Date();
    	var imageModel = new modelModule.ImageModel('images/pic.jpg', date, "", 0);
    	imageModel.addListener(secondListener);

    	// Add image model to collection
    	imageCollectionModel.addImageModel(imageModel);

    	expect(firstListener.called, "ImageCollectionModel listener should have been called").to.be.ok;

    	// Change image model
    	imageModel.setRating(4);

    	expect(secondListener.called, "ImageModel listener should have been called").to.be.ok;
    	expect(firstListener.callCount, "ImageCollectionModel should be called again").to.equal(2);

    	localStorage.clear();
    });
    
    it('Test 3: Delete image model from image collection', function() {
    	var modelModule = createModelModule();

    	// Create image collection model
    	var imageCollectionModel = new modelModule.ImageCollectionModel();

    	// Create image model to add to collection 
    	var date = new Date();
    	var imageModel = new modelModule.ImageModel('images/pic.jpg', date, "", 0);

    	// Add image model to collection
    	imageCollectionModel.addImageModel(imageModel);

    	var imageModels = imageCollectionModel.getImageModels();

    	expect(imageModels.length, "ImageCollectionModel should have one image model").to.equal(1);

    	// Create listener to also test that it is called when image model is removed
    	var listener = sinon.spy();
    	imageCollectionModel.addListener(listener);

    	imageCollectionModel.removeImageModel(imageModel);
    	imageModels = imageCollectionModel.getImageModels();

    	expect(listener.called, "The listener should have been called").to.be.ok;
    	expect(imageModels.length, "ImageCollectionModel should have no image models").to.equal(0);

    	localStorage.clear();
    });

	it('Test 4: Remove listener from image model', function() {
		var modelModule = createModelModule();
		var listener = sinon.spy();

		// Create image model
		var date = new Date();
		var imageModel = new modelModule.ImageModel('images/pic.jpg', date, "", 0);
		imageModel.addListener(listener);

		// This line will call the listener once
		imageModel.setRating(5);

		expect(listener.called, "Listener should have been called").to.be.ok;

		// Remove the listener and make another change
		imageModel.removeListener(listener);
		imageModel.setCaption("sup");

		expect(listener.callCount, "Listener should only have been called once, not twice").to.equal(1);

		localStorage.clear();
	});

	it('Test 5: Remove listener from image collection model', function() {
		var modelModule = createModelModule();
		var firstListener = sinon.spy();
		var secondListener = sinon.spy();

		// Create image collection model
		var imageCollectionModel = new modelModule.ImageCollectionModel();
		imageCollectionModel.addListener(firstListener);

		// Create image model
		var date = new Date();
		var imageModel = new modelModule.ImageModel('images/pic.jpg', date, "", 0);
		imageModel.addListener(secondListener);

		// This should call the listener
		imageCollectionModel.addImageModel(imageModel);

		expect(firstListener.called, "ImageCollectionModel's listener should have been called").to.be.ok;

		// Remove the listener from image collection model
		imageCollectionModel.removeListener(firstListener);

		// Make a change in the image model - this should call the second listener but not the first
		imageModel.setRating(4);

		expect(firstListener.callCount, "This listener was removed so it shouldn't have been called again").to.equal(1);
		expect(secondListener.called, "This is the image model's listener so it should have been called").to.be.ok;

		localStorage.clear();
	});
});

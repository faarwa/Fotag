'use strict';

// This should be your main point of entry for your app

window.addEventListener('load', function() {
    var modelModule = createModelModule();
    var viewModule = createViewModule();
    var appContainer = document.getElementById('app-container');

    // Add toolbar to view
    var toolbar = new viewModule.Toolbar();
    appContainer.appendChild(toolbar.getElement());

    // Attach the file chooser to the page. You can choose to put this elsewhere, and style as desired
    var fileChooser = new viewModule.FileChooser();
    appContainer.appendChild(fileChooser.getElement());

    var imageCollectionModel = modelModule.loadImageCollectionModel();
    var imageRendererFactory = new viewModule.ImageRendererFactory();
    var imageCollectionView = new viewModule.ImageCollectionView();
    imageCollectionView.setImageCollectionModel(imageCollectionModel);
    imageCollectionView.setImageRendererFactory(imageRendererFactory);

    // Add image collection view to listen to toolbar
    toolbar.addListener(function(toolbar, eventType, eventTime) {
        if (eventType == viewModule.RATING_CHANGE) {
            imageCollectionView.setRatingFilter(toolbar.getCurrentRatingFilter());
        }
    });

    // Add mouse event listeners for toolbar buttons
    var gridButton = document.getElementById('grid-button');
    var listButton = document.getElementById('list-button');

    gridButton.addEventListener('click', function() {
        imageCollectionView.setToView(viewModule.GRID_VIEW);
        gridButton.classList.add('view-button-selected');
        listButton.classList.remove('view-button-selected');
    });

    listButton.addEventListener('click', function() {
        imageCollectionView.setToView(viewModule.LIST_VIEW);
        gridButton.classList.remove('view-button-selected');
        listButton.classList.add('view-button-selected');
    });

    gridButton.click();

    var clearFilterButton = document.getElementById('clear-filter-button');
    clearFilterButton.addEventListener('click', function() {
        var stars = document.getElementsByName("myfilter");
        _.each(stars, function(star) {
            star.checked = false;
        })
        toolbar.setRatingFilter(0);
    })

    // Make image collection view listen to the collection model for changes and events
    imageCollectionModel.addListener(function(eventType, imageCollection, imageModel, eventTime) {
        if (eventType == modelModule.IMAGE_ADDED_TO_COLLECTION_EVENT) {
            if (toolbar.getCurrentRatingFilter() == imageModel.getRating()) {
                var container = imageCollectionView.getElement();
                var imageDiv = container.querySelector('.image-collection');
                var imageRenderer = imageCollectionView.getImageRendererFactory().createImageRenderer(imageModel);
                imageRenderer.setToView(imageCollectionView.getCurrentView());
                imageDiv.appendChild(imageRenderer.getElement());
            }
        }
    });

    // Add event listeners for toolbar filter
    var stars = document.getElementsByName("myfilter");
    _.each(stars, function(star) {
        star.addEventListener('click', function() {
            toolbar.setRatingFilter(star.value);
        })
    })

    // Demo that we can choose files and save to local storage. This can be replaced, later
    fileChooser.addListener(function(fileChooser, files, eventDate) {
        _.each(
            files,
            function(file) {
                var imageModel = new modelModule.ImageModel(
                        'images/' + file.name,
                        file.lastModifiedDate,
                        '',
                        0
                    );
                imageCollectionModel.addImageModel(imageModel);
            }
        );
        modelModule.storeImageCollectionModel(imageCollectionModel);
    });

    appContainer.appendChild(imageCollectionView.getElement());
});


// General function to format a eventDate
function formatDate(date) {
    var months = new Array("January", "February", "March", 
    "April", "May", "June", "July", "August", "September", 
    "October", "November", "December");

    var day = date.getDate();
    var month = date.getMonth();
    var year = date.getFullYear();
    var hour = date.getHours();
    var min = date.getMinutes();

    var formattedDate =  months[month] + " " + day+ ", " + year + " at " + hour + ":" + min;

    return formattedDate;
}
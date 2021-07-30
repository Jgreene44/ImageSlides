
// call in the required classes
var NodeHelper = require("node_helper");
var FileSystemImageSlideshow = require("fs");

// creating the node heler
module.exports = NodeHelper.create({
    // clear the config to nothing
    start: function() {
        this.moduleConfigs = [];
    },
    // randomizes an array
    // adapted from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    randomArray: function(array) {
      var current = array.length, temp, randomIndex;
      while (0 !== current) {
        randomIndex = Math.floor(Math.random() * current);
        current -= 1;
        temp = array[current];
        array[current] = array[randomIndex];
        array[randomIndex] = temp;
      }
      return array;
    },

    // check for valid extension
    checkExtension: function(file, extensions) {
        var extensionList = extensions.split(',');
        for (var i = 0; i < extensionList.length; i++) {
            if (file.toLowerCase().endsWith(extensionList[i]))
                return true;
        }
        return false;
    },

    // get the images from the source
    getImages: function(config) {
        var self = this;
        var imageList = [];
        for (var i = 0; i < config.imagePaths.length; i++) {
            var Path = config.imagePaths[i];
            var pathImages = FileSystemImageSlideshow.readdirSync(path = Path);
            if (pathImages.length > 0) {
                var currentImageList = [];
                for (var j = 0; j < pathImages.length; j++) {
                    // seperate into both the path and then the file name
                    var currentImage = {path: Path, filename: pathImages[j]};
                    // check if file has a valid file extension
                    var isValidImageFileExtension = this.checkExtension(currentImage.filename, config.validImageFileExtensions);
                    //  if file is valid, add it to the list
                    if (isValidImageFileExtension)
                        currentImageList.push(currentImage);
                }
                //randomize the images
                currentImageList = this.randomArray(currentImageList);
                // add randomized list to current list
                imageList = imageList.concat(currentImageList);
            }
        }

        // create a file image list combining paths and filenames
        var imageListFinished = [];
        for (var i = 0; i < imageList.length; i++) {
            imageListFinished.push(imageList[i].path + '/' + imageList[i].filename);
		}
        // return finished list
        return imageListFinished;
    },

    
    // what gets ran when we get a notification
    socketNotificationReceived: function(notification, payload) {
        if (notification === "IMAGESLIDES_UPDATE") {
            // add the current config to an array of all configs used by the helper
            this.moduleConfigs.push(payload);
            var self = this;
            // get the image list
            var imageList = this.getImages(payload);
            // build the return payload
            var returnPayload = { identifier: payload.identifier, imageList: imageList };
            // send the image list back
            self.sendSocketNotification('IMAGESLIDES_FINISHED', returnPayload );
        }
    },     
});

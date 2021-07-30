 //Creating the image slides module
Module.register("ImageSlides", {

	defaults: {
        //path where the images are stored
        imagePaths: [ 'modules/ImageSlides/Images' ],
        fixedImageWidth: 0,
        fixedImageHeight: 0,
        // the speed until the image changes in ms
		updateInterval: 10 * 1000,
        // list of valid file extensions, seperated by commas
        validImageFileExtensions: 'bmp,jpg,gif,png',
	},
    

	start: function () {
        
        this.config.identifier = this.identifier;
        this.config.validImageFileExtensions = this.config.validImageFileExtensions.toLowerCase();
		this.errorMessage = null;
        this.imageList = [];

        // set beginning image index to -1, as it will auto increment on start
        this.imageIndex = -1;

        //pull data from images list
        this.sendSocketNotification('IMAGESLIDES_UPDATE', this.config);

        // update the front end to overwrite HTML
        this.updateDom();

        // set a blank timer
        this.interval = null;
        
	},

	// What we do if we receive a notification
	socketNotificationReceived: function(notification, payload) {
		// if an update was received
		if (notification === "IMAGESLIDES_FINISHED") {
            this.imageList = payload.imageList;
            // if image list actually contains images
            // set loaded flag to true and update frontend
            if (this.imageList.length > 0) {
                this.loaded = true;
                this.updateDom();
                // set the timer schedule to the update interval			
                var self = this;
                this.interval = setInterval(function() {
                    self.updateDom();
                    }, this.config.updateInterval);					
            }
		}
    },    
	//This is how we push to front end
	getDom: function () {
		var wrapper = document.createElement("div");
            // if the image list has been loaded
            if (this.loaded === true) {
				// sometimes this error happens when it restarts in the middle of the update and it will push back the index
				if (this.i == -2) {
					this.i = -1;
					clearInterval(this.interval);
					var self = this;
					this.interval = setInterval(function() {
						self.updateDom(0);
						}, this.config.updateInterval);						
				}				
                // iterate the image list index
                this.i += 1;
                // if exceeded the size of the list, go back to zero
                if (this.i == this.imageList.length) {
                    this.i = 0;
				}
                
                var image = document.createElement("img");
                var styleString = '';
                // if we have a custom w/h then add that to the image
                if (this.config.fixedImageWidth != 0)
                    styleString += 'width:' + this.config.fixedImageWidth + 'px;';
                if (this.config.fixedImageHeight != 0)
                    styleString += 'height:' + this.config.fixedImageHeight + 'px;';
                // if style string has antyhing, set it
                if (styleString != '')
                    image.style = styleString;
                // set the image location
                image.src = encodeURI(this.imageList[this.i]);
                // add the image to the front end
                wrapper.appendChild(image);					
				
            }
            else {
                // if no data loaded yet, empty html
                wrapper.innerHTML = "&nbsp;";
            }
		return wrapper;
	}
});
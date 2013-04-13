'use strict';

angular.module('designmeApp')
    .factory('upload', function () {
        // statically define 4 images

        var uploadedImages = [
            'images/uploaded_images/1.jpg',
            'images/uploaded_images/2.jpg',
            'images/uploaded_images/3.jpg',
            'images/uploaded_images/4.jpg'
        ];

        var userImages = [];
        for( var ii=0; ii<uploadedImages.length; ii++){
            userImages.push({
                serverPath: uploadedImages[ii],
                layer_index: ii,
                posX: 50 + ii * 110,
                posY: 50 + ii * 110,
                scale: 1,
                angle: 0
            });
        }

        var activeUserImage = userImages[0];

        // Public API here
        return {
            userImages: userImages
        };
    });

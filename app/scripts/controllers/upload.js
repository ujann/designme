'use strict';

angular.module('designmeApp')
    .controller('UploadCtrl', function ($scope, upload) {
        $scope.userImages = upload.userImages;
        $scope.resetImage = function(image){
            image.posX = 0;
            image.posY = 0;
            image.angle = 0;
            //image.scale = 1;
        };
        $scope.dummy = function(){ console.log('scopeImages', upload.userImages);};
        $scope.uploadFile = function (content, completed) {
            console.log(content);
            if (completed){
                $scope.uploadResponse = "[Status: Completed] " + content;
            }else{
                $scope.uploadResponse = "[Status: Incomplete] Content ignored.  Check log the actual content.";
            }
        }


    });

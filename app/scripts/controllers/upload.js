'use strict';

angular.module('designmeApp')
    .controller('UploadCtrl', function ($scope, $timeout) {

        function newUploadedImage(serverUrl){
            var nrOfImages = $scope.userImages.length;
            $timeout( function(){
                $scope.userImages.push({
                    serverPath: serverUrl,
                    posX: 50 + nrOfImages * 110,
                    posY: 50 + nrOfImages * 110,
                    scale: 1,
                    angle: 0
                });
            }, 0, true);

        }

        $scope.userImages = [];
        $scope.userImages.marker = "marked!";
        $scope.resetImage = function(image){
            //image.posX = 0;
            //image.posY = 0;
            //image.angle = 0;
            // put it at the last position, so it is drawn last:
            // 1. find the image:
            for( var ii=0; ii<$scope.userImages.length; ii++ ){
                if( $scope.userImages[ii]===image ){
                    $scope.userImages.splice( ii, 1 );
                    $scope.userImages.push(image);
                }
            };
        };
        $scope.removeImage = function(scopeImage){
            for( var ii=0; ii<$scope.userImages.length; ii++ ){
                if( $scope.userImages[ii]===scopeImage ){
                    $scope.userImages.splice(ii,1);
                }
            }
        };
        $scope.uploadFile = function (content, completed) {
            console.log(content);
            if (completed){
                $scope.uploadResponse = "[Status: Completed] " + content;
            }else{
                $scope.uploadResponse = "[Status: Incomplete] Content ignored.  Check log for the actual content.";
            }
        }

        $scope.fileAdded = function(fileUrl, fileName){
            newUploadedImage(fileUrl);
        }


    });

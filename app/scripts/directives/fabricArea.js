'use strict';

angular.module('designmeApp')
    .directive('fabricArea', function () {
        return {
            template: '<canvas></canvas>',
            restrict: 'E',
            replace: true,
            scope: {
                images: '='
            },
            link: function postLink(scope, element, attrs) {
                var directiveImageModel = new ImageModel(),
                    canvas = null;

                function ImageModel() {
                    var scopeImages = [];
                    var canvasImages = [];
                    var watchUnregisterFunctions = [];

                    var indexInArray = function (item, arr) {
                        for (var ii = 0; ii < arr.length; ii++) {
                            if (arr[ii] === item) {
                                return ii;
                            }
                        }
                        return -1;
                    }

                    return{
                        add: function (scopeImage, canvasImage, unregisterFunction) {
                            scopeImages.push(scopeImage);
                            canvasImages.push(canvasImage);
                            watchUnregisterFunctions.push(unregisterFunction);
                        },
                        remove: function (scopeImage) {
                            var idx = indexInArray(scopeImage, scopeImages);
                            if (idx >= 0) {
                                scopeImages.splice(idx, 1);
                                canvasImages.splice(idx, 1);
                                watchUnregisterFunctions.splice(idx, 1);
                            }
                        },
                        findScopeImageForCanvasImage: function (canvasImage) {
                            var idx = indexInArray(canvasImage, canvasImages);
                            if (idx >= 0) {
                                return scopeImages[idx];
                            }
                            return null;
                        },
                        findCanvasImageForScopeImage: function (scopeImage) {
                            var idx = indexInArray(scopeImage, scopeImages);
                            if (idx >= 0) {
                                return canvasImages[idx];
                            }
                            return null;
                        }

                    };


                }

                function initImage(canvasImage, scopeImage) {
                    var originalSize = canvasImage.getOriginalSize();
                    var height = originalSize.height;
                    var width = originalSize.width;

                    // scale it to 100px
                    scopeImage.scale = Math.max(100 / width, 100 / height);

                    canvasImage.setLeft(scopeImage.posX);
                    canvasImage.setTop(scopeImage.posY);
                    canvasImage.setAngle(scopeImage.angle);
                    canvasImage.scale(scopeImage.scale);
                    canvasImage.lockUniScaling = true;
                    canvasImage.perPixelTargetFind = true;
                    canvasImage.targetFindTolerance = 4;
                    canvasImage.hasControls = true;
                    canvasImage.hasBorders = true;
                    canvasImage.transparentCorners = false;
                    canvasImage.borderColor = 'black';
                    canvasImage.cornerColor = 'black';
                    canvasImage.cornerSize = 9;
                    canvasImage.originX = "left";
                    canvasImage.originY = "top";

                    // watch for changes of image properties:
                    var unregisterFunction = scope.$watch(function () {
                        return scopeImage;
                    }, function (imageFromScope) {
                        // check what has changed and then copy the values into canvas:
                        var canvasImage = directiveImageModel.findCanvasImageForScopeImage(imageFromScope);
                        var isXChanged = canvasImage.getLeft() != imageFromScope.posX;
                        var isYChanged = canvasImage.getTop() != imageFromScope.posY;
                        var isScaleChanged = canvasImage.getScaleX() != imageFromScope.scale;
                        var isAngleChanged = canvasImage.getAngle() != imageFromScope.angle;
                        if (isXChanged || isYChanged || isScaleChanged || isAngleChanged) {
                            // this must have been a change from the outside:
                            console.log("IMG changed from outside");
                            canvasImage.setLeft(imageFromScope.posX);
                            canvasImage.setTop(imageFromScope.posY);
                            canvasImage.setScaleX(imageFromScope.scale);
                            canvasImage.setAngle(imageFromScope.angle);
                            // rerender:
                            canvas.renderAll();
                        }
                    }, true);

                    directiveImageModel.add(scopeImage, canvasImage, unregisterFunction);
                    console.log( 'added a new image: ', scopeImage.serverPath);
                    try{
                        canvas.add(canvasImage);
                    }catch(Exception){
                        console.log('ERROR painting image: ', canvasImage._originalImage.src);
                    }
                }

                function registerWatch(scopeImages) {
                    // first watch to check if images array has changed:
                    scope.$watch(function(){
                        return scope.images;
                    }, function (newScopeImages, oldScopeImages) {
                        //console.log("somebody changed image data!");
                        var lostImages = [];
                        angular.forEach( oldScopeImages, function(oldScopeImage){
                            // add it:
                            lostImages.push( oldScopeImage );
                            for( var ii=0; ii<newScopeImages.length; ii++ ){
                                if( oldScopeImage===newScopeImages[ii] ){
                                    // found it!
                                    lostImages.pop();
                                    break;
                                }
                            }
                        });
                        angular.forEach( lostImages, function(lostImage){
                            var canvasImage = directiveImageModel.findCanvasImageForScopeImage(lostImage);
                            canvas.remove(canvasImage);
                        } );
                        angular.forEach( newScopeImages, function(scopeImage){
                            var canvasImage = directiveImageModel.findCanvasImageForScopeImage(scopeImage);
                            if( !canvasImage ){
                                addScopeImage(scopeImage);
                            }else{
                                // bring to front to rearrange order
                                canvasImage.bringToFront();
                            }
                        });
                    }, true);
                }

                function addScopeImage(scopeImage) {
                    fabric.Image.fromURL(scopeImage.serverPath, function (canvasImg) {
                        initImage(canvasImg, scopeImage)
                    });
                }

                element.width = 500;
                element.height = 500;
                canvas = new fabric.Canvas(element.attr('id'), {
                    hoverCursor: 'pointer',
                    selection: false
                });
                canvas.setOverlayImage('images/designs/menschaerger_pers_4personen_trans4.png', function(a,b,c){
                    canvas.renderAll();
                });

                canvas.on({
                    'object:moving': function (e) {
                        e.target.opacity = 0.5;
                    },
                    'object:modified': function (e) {
                        e.target.opacity = 1;
                        // copy all properties back to the model:
                        var affectedScopeImage = directiveImageModel.findScopeImageForCanvasImage(e.target);
                        // communicate the canvas changes back to the scope:
                        scope.$apply(function (x) {
                            affectedScopeImage.posX = e.target.getLeft();
                            affectedScopeImage.posY = e.target.getTop();
                            affectedScopeImage.angle = e.target.getAngle();
                            affectedScopeImage.scale = e.target.getScaleX();
                        });
                    }
                });

                registerWatch(scope.images);
            }
        }
    });

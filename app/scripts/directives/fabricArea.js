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
                // hash from model-image to object { img:canvasObject and unregisterFn }
                var directiveImageModel = new ImageModel();

                var canvas = null;

                function ImageModel() {
                    var scopeImages = [];
                    var canvasImages = [];
                    var watchUnregisterFunctions = [];

                    function indexInArray(item, arr) {
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
                    canvas.add(canvasImage);
                }

                function registerWatches(scopeImages) {
                    // first watch to check if images array has changed:
                    scope.$watch(function () {
                        return scopeImages;
                    }, function () {
                        console.log("somebody changed the array!");
                    }, false);

                    // then watch all current images:
                    angular.forEach(scopeImages, function (scopeImage) {
                        fabric.Image.fromURL(scopeImage.serverPath, function (canvasImg) {
                            initImage(canvasImg, scopeImage)
                        });
                    });
                }

                element.width = 500;
                element.height = 500;
                canvas = new fabric.Canvas(element.attr('id'), {
                    hoverCursor: 'pointer',
                    selection: false,
                    overlayImage: 'images/designs/menschaerger_pers_4personen_trans4.png'
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
                            affectedScopeImage.posX = e.target.getCenterPoint().x;
                            affectedScopeImage.posY = e.target.getCenterPoint().y;
                            affectedScopeImage.angle = e.target.getAngle();
                            affectedScopeImage.scale = e.target.getScaleX();
                        });
                    }
                });

                registerWatches(scope.images);
            }
        }
    });

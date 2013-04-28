'use strict';

angular.module('designmeApp').directive("fileUploader", function() {
    return {
        restrict: 'E',
        template: '<div><input file-uploader="" id="fileupload" type="file" name="files[]" /></div>',
        replace: true,
        scope: {
            files : '=',
            onAdd : '&',
            onRemove : '&'
        },
        link: function(scope, elm, attrs, ngModel) {

            function findFileByUploadId(uploadId){
                for( var ii = 0; ii<scope.files.length; ii++){
                    // intentional '==': server sends as string
                    if(scope.files[ii].uploadId==uploadId){
                        return scope.files[ii];
                    }
                }
                return null;
            }
            /*'http://test.spieltz.de/uploadtest.php',
             onComplete: function(id, fileName, responseJSON){
             ngModel.$modelValue.push(responseJSON);
             }*/
            // http://jsfiddle.net/jasonals/WEvwz/27/
            // https://groups.google.com/forum/#!msg/angular/cvHU-AUOP4U/wDahiSxuljIJ
            scope.files = scope.files || [];

            $(elm[0]).fileupload({
                url: 'upload',
                dataType: 'json',
                done: function (e, data) {
                    console.log("Upload done: ", data.result);
                    scope.$apply( function(){
                        scope.uploadResponse = data.result;
                        if( data.result.full ){
                            var addedFile = findFileByUploadId(data.result.upload_id);
                            addedFile.serverUrl = data.result.full;
                            scope.onAdd({url:addedFile.serverUrl, name:addedFile.name});
                        }
                    });
                },
                fail: function (e, data) {
                    console.log("Upload fail: ", data);
                },
                progress: function (e, data) {
                    var progress = parseInt(data.loaded / data.total * 100, 10);
                    console.log('progress: ', progress);
                },
                add: function(e, data){
                    var file = data.files[0]; // only 1 file allowed
                    // add a unique id for this upload (to find it again)
                    var uploadid = (new Date()).getTime();
                    file.uploadId = uploadid;
                    scope.files.push(file);
                    console.log("File added!", file);
                    data.formData = { upload_id: uploadid};
                    // Begin upload immediately
                    data.submit();
                }

            });
        }
    };
});
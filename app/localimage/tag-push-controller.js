'use strict';

/**
 * @ngdoc function
 * @name docker-registry-frontend.controller:DeleteRepositoryController
 * @description
 * # DeleteRepositoryController
 * Controller of the docker-registry-frontend
 */
angular.module('tag-push-controller', ['registry-services'])
  .controller('TagPushController', ['$scope', '$route', '$modalInstance', '$window',  'ListImage', 'information', 'tag',  
  function( $scope, $route, $modalInstance, $window, ListImage, information, tag){
    $scope.information = information;
    $scope.tag = tag;
    $scope.newTag = tag ;
    //tag a image
    $scope.doTagImage = function () {
          var temp = $scope.newTag.split(":");
          var params = {
            imageName: tag,
            repo: temp.length>2 ? temp[0] + ':' + temp[1] : temp[0],
            tag: temp.length>2 ? temp[2] : temp[1]
          };
          ListImage.tag(params, {},
            //success
            function(value, responseHeaders) {
              toastr.success('Tag image: ' + $scope.newTag + ' success.');
              setTimeout($scope.refresh, 1000 );
              // $rootScope.refreshFlag = true;
            },
            //error
            function(httpResponse) {
              toastr.error('Failed to tag image: ' + $scope.newTag + ' <br/>Response: ' + httpResponse.statusText);
          }
        );
        $modalInstance.close();
      // Go to the localImage page
      };

      //push local image to private registry
    $scope.doPushImage = function () {
      var temp = $scope.newTag.split(":");
      var param = {
        imageName: temp[0] + ':' + temp[1] ,
        tag: temp.length>2 ? temp[2] : 'latest'
      };
      ListImage.push(param, {},
          //success
          function(value, responseHeaders) {
             toastr.success('Push image: ' + $scope.newTag + ' success.');
          },
          //error
          function(httpResponse) {
             // toastr.success('Push image: ' + $scope.newTag + ' success.');
            toastr.error('Failed to push image: ' + $scope.newTag + ' <br/>Response: ' + httpResponse.statusText);
          }
        );
        $modalInstance.close();
      };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
    $scope.refresh = function(){
          $window.location.href = 'localimage';
          $route.reload();
      }
  }]);

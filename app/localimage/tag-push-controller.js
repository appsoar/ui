'use strict';

/**
 * @ngdoc function
 * @name docker-registry-frontend.controller:DeleteRepositoryController
 * @description
 * # DeleteRepositoryController
 * Controller of the docker-registry-frontend
 */
angular.module('tag-push-controller', ['registry-services'])
  .controller('TagPushController', ['$rootScope', '$scope', '$route', '$modalInstance', '$window', '$http', 'ListImage', 'information', 'tag',  'that',
  function( $rootScope, $scope, $route, $modalInstance, $window,$http, ListImage, information, tag, that){
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
               setTimeout(function(){
                  $rootScope.localImages = ListImage.query({});  
               }, 1000 );
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
      that.currentPushing = {
        pushFlag: true,
        pushClass: 'glyphicon glyphicon-repeat state-removing',
        pushTitle: 'pushing'
      };
      var temp = $scope.newTag.split(":");
      var param = {
        imageName: temp[0] + ':' + temp[1] ,
        tag: temp.length>2 ? temp[2] : 'latest'
      };
      ListImage.push(param, {},
          //success
          function(value, responseHeaders) {
              that.currentPushing = {
                pushFlag: false,
                pushClass: 'glyphicon glyphicon-edit',
                pushTitle: ''
              };
             toastr.success('Push image: ' + $scope.newTag + ' success.');
          },
          //error
          function(httpResponse) {
             // toastr.success('Push image: ' + $scope.newTag + ' success.');
            that.currentPushing = {
              pushFlag: false,
              pushClass: 'glyphicon glyphicon-edit',
              pushTitle: ''
            };
            toastr.error('Failed to push image: ' + $scope.newTag + ' <br/>Response: ' + httpResponse.statusText);
          }
        );
        $modalInstance.close();
      };

      $scope.doTarImage = function(){
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

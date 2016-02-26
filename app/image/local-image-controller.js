'use strict';

/**
 * @ngdoc function
 * @name docker-registry-frontend.controller:LocalImageController
 * @description
 * # LocalImageController
 * Controller of the docker-registry-frontend
 */
angular.module('local-image-controller', ['registry-services', 'app-mode-services'])
  .controller('LocalImageController', ['$scope', '$route', '$routeParams', '$location', '$filter', 'ListImage', 'AppMode',
  function($scope, $route, $routeParams, $location, $filter, ListImage, AppMode){
    
    $scope.appMode = AppMode.query();
    $scope.totalImageSize = 0;
    $scope.$route = $route;
    $scope.tag = $route.current.params.tag;
    var params = {
        imageName: $scope.tag
      };
    $scope.imageDetails = ListImage.inspect(params);
  }]);
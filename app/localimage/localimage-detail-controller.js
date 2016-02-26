'use strict';

/**
 * @ngdoc function
 * @name docker-registry-frontend.controller:LocalimageDetailController
 * @description
 * # LocalimageDetailController
 * Controller of the docker-registry-frontend
 */
angular.module('localimage-detail-controller', ['registry-services'])
  .controller('LocalimageDetailController', ['$scope', '$route', '$routeParams', '$location', 
  function($scope, $route, $routeParams, $location){
    $scope.$route = $route;
    $scope.tag = $route.current.params.tag;
  }]);

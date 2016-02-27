'use strict';

/**
 * @ngdoc function
 * @name docker-registry-frontend.controller:LocalimageListController
 * @description
 * # LocalimageListController
 * Controller of the docker-registry-frontend
 */
 angular.module('localimage-list-controller', ['registry-services'])
 .controller('LocalimageListController', ['$rootScope', '$scope', '$modal', '$window','$http', 'ListImage', 
  function($rootScope, $scope, $modal, $window, http, ListImage){
    // $rootScope.refreshFlag = false;
     $scope.currentRemoving = {
      removeFlag: false,
      circleClass: 'glyphicon glyphicon-trash',
      removeTitle: ''
    };
    $scope.currentPushing = {
      pushFlag: false,
      pushClass: 'glyphicon glyphicon-edit',
      pushTitle: ''
    }
    var queryObject = {};
    $rootScope.localImages = ListImage.query(queryObject);
    // $scope.selectedImages = [];

    // helper method to get selected tags
/*    $scope.selectedRepos = function selectedRepos() {
      return filterFilter($scope.repositories.repos, { selected: true });
    };*/

    // Watch repos for changes
    // To watch for changes on a property inside the object "repositories"
    // we first have to make sure the promise is ready.
/*    $scope.localImage.$promise.then(function(data) {
      $scope.$watch('localImage.Id|filter:{selected:true}', function(nv) {
        $scope.selectedImages = nv.map(function (repo) {
          return repo.name;
        });
      }, true);
    });*/
/*    $rootScope.$watch($rootScope.refreshFlag, function(){
      alert($rootScope.refreshFlag);
      if($rootScope.refreshFlag){
          $scope.localImages = ListImage.query(queryObject);
          $rootScope.refreshFlag = false;
      }
    });*/
      // $scope.refreshFlag = function(){
      //     StateTransfer.get('refreshFlag');
      // };
    $scope.tagImage = function(tag) {
      var that = this;
      var modalInstance = $modal.open({
          animation: true,
          templateUrl: '/localimage/tagAndPushImage.html',
          controller: 'TagPushController',
          resolve: {
            information: function() {
              return 'Please input the new tag like "IP:port/username/repository:tag"';
            },
            tag: function() {            
              return tag;
            },
            that: function() {
              return that;
            }
          }
      });
    };

    $scope.buildImage = function(){
        // alert($rootScope.refreshFlag);
        var tarFile = document.getElementById('tarFile').files[0];
        var reader = new FileReader();
        var params = {
          // dockerfile: '/home/dx/ui/app/test.tar',
          t: 'ubuntu:v1.0.0'
        };
        reader.onload = function(){
          // var data = this.result;
          ListImage.build(params,{ data: this.result},
            function(value, responseHeaders) {
              toastr.success(' success.');
            },
            function(httpResponse) {
              toastr.error('Failed ' + httpResponse.statusText);
            }
          );
          
        }
        reader.readAsBinaryString(tarFile);
    };

    $scope.loadImage = function(){
        // alert($rootScope.refreshFlag);
        var tarFile = document.getElementById('tarFile').files[0];
        var reader = new FileReader();
        var params = {
          // dockerfile: '/get.tar',
           // tags: 'ubuntu:v1.0.0'
        };
        reader.onload = function(){
            console.log(this.result);
            // var data = this.result;
          ListImage.load(params,{data : this.result},
            function(value, responseHeaders) {
              toastr.success(' success.');
            },
            function(httpResponse) {
              toastr.error('Failed ' + httpResponse.statusText);
            }
          );
        }
        reader.readAsBinaryString(tarFile);
    };
    // $scope.loadImage = function() {
    //     $http.post()
    // };
    $scope.historyImage = function(tag){
        var params = {
          imageName: tag
        };
        swal("Here's a message!");
        var history = ListImage.history(params,{},
            function(value, responseHeaders) {
              toastr.success('History image: ' + tag + ' success.');
              console.log('value');
              console.log(value);
              // setTimeout($scope.refresh, 3000 );
            },
            function(httpResponse) {
              toastr.error('Failed to history image: ' + tag + ' <br/>Response: ' + httpResponse.statusText);
            }
        );
        console.log('history');
        console.log(history);
    };

/*    $scope.inspectImage = function(tag){
        var params = {
          imageName: tag
        };
        var inspect = ListImage.inspect(params,{},
            function(value, responseHeaders) {
              toastr.success('Inspect image: ' + tag + ' success.');
              // setTimeout($scope.refresh, 3000 );
              console.log('value');
              console.log(value);
            },
            function(httpResponse) {
              toastr.error('Failed to inspect image: ' + tag + ' <br/>Response: ' + httpResponse.statusText);
            }
        );
        console.log('inspect');
        console.log(inspect);
    };*/

    $scope.removeImage = function(tag){
        var that = this;
        var params = {
          imageName: tag
        };
        swal({
          title: "Are you sure?",
          text: "This operation cannot be undone!",
          type: "warning",
          showCancelButton: true,
          cancelButtonText: "No, cancel !",
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, delete it!",
          closeOnConfirm: true,
          closeOnCancel: true
        },
        function(isConfirm){
          if (isConfirm) {
              that.currentRemoving = {
                removeFlag: true,
                circleClass: 'glyphicon glyphicon-repeat state-removing',
                removeTitle: 'removing'
              };
              console.log(that.currentRemoving);
              console.log('that.currentRemoving1');

              ListImage.remove(params,{},
                function(value, responseHeaders) {
                  toastr.success('Delete image: ' + tag + ' success.');
                  setTimeout(function(){
                    $rootScope.localImages = ListImage.query(queryObject);
                    // swal('Deleted!', tag + ' has been deleted.', 'success');
                  }, 1000 );
                },
                function(httpResponse) {
                  that.currentRemoving = {
                    removeFlag: false,
                    circleClass: 'glyphicon glyphicon-trash',
                    removeTitle: ''
                  };
                toastr.error('Failed to delete image: ' + tag + ' <br/>Response: ' + httpResponse.statusText);
              }
             );
           } 
          //  else {
          //     // swal('Cancelled', 'Your image is safe :)', 'error');
          // }
        });
    };
  }])
 .filter("repo_tag",function(){
    return function(input,param){
        var out = "";
        var temp = input.split(":");

        if(param){
            out = temp.length>2 ? temp[0] + ':' + temp[1] : temp[0];
        }
        else{
            out = temp.length>2 ? temp[2] : temp[1];
        }
        return out;
    }
  })
 .filter("calTime", function () {
    return function (input) {
      var time = new Date().getTime();
      var createdTime = Math.round(time/1000 - input);
      if(createdTime < 60){
        return Math.round(createdTime) + " sec ago";
      }else if(createdTime < 3600){
        return Math.round(createdTime/60) + " min ago";
      }else if(createdTime < 86400){
        return Math.round(createdTime/3600) + " hour ago";
      }else{
        return Math.round(createdTime/86400) + " days ago";
      }
    }
 });
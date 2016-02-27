'use strict';

// This is the main entrypoint to interact with the Docker registry.

// Helpful resources
//
// https://docs.angularjs.org/tutorial/step_11
// https://docs.angularjs.org/api/ngResource/service/$resource

angular.module('registry-services', ['ngResource'])
.factory('RegistryHost', ['$resource', function($resource){
  return $resource('registry-host.json', {}, {
    'query': {
      method:'GET',
      isArray: false,
    },
  });
}])
  // Repository returns:
  //
  //   {
  //     repos: [
  //       {username: 'SomeNamespace', name: 'SomeNamespace/SomeRepo1', selected: true|false},
  //       {username: 'SomeOtherNamespace', name: 'SomeOtherNamespace/SomeRepo2', selected: true|false},
  //       {username: 'SomeCompletelyDifferenNamespace', name: 'SomeCompletelyDifferenNamespace/SomeRepo3', selected: true|false}
  //     ],
  //     nextLink: '/v2/_catalog?last=SomeNamespace%F2SomeRepo&n=1'
  //   }
  //
  // The "nextLink" element is a preparation for supporting pagination
  // (see https://github.com/docker/distribution/blob/master/docs/spec/api.md#pagination)
  //
  // On subsequent calls to "Repository()" you may pass in "n" as the number of
  // elements per page as well as "last" which is the "nextLink" from the last
  // call to Repository.
  .factory('Repository', ['$resource', function($resource){
    return $resource('/v2/_catalog?n=:n&last=:last', {}, {
      'query': {
        method:'GET',
        isArray: false,
        transformResponse: function(data, headers){
          //console.log(data);
          var repos = angular.fromJson(data).repositories;
          //console.log(angular.fromJson(data));

          // Extract the "last=" part from Link header:
          //
          //   Link: </v2/_catalog?last=namespace%2repository&n=10>; rel="next"
          //
          // We only want to extrace the "last" part and store it like this
          //
          //   lastNamespace = namespace
          //   lastRepository = repository
          //
          // TODO: Can we clean this up a bit?
          var last = undefined;
          var lastNamespace = undefined;
          var lastRepository = undefined;
          var linkHeader = headers()['link'];
          //console.log('linkHeader='+linkHeader);
	  /*
          for(var i in headers()){
            console.log(i + ':' + headers()[i]);
          }
	  */
          if (linkHeader) {
            var lastUrl = ''+linkHeader.split(';')[0].replace('<','').replace('>','');
            var startPos = lastUrl.search('last=');
            //console.log('startPos=' + startPos);
            if (startPos >= 0) {
              var endPos = lastUrl.substring(startPos).search('&');
              //console.log('endPos=' + endPos);
              if (endPos >= 0) {
                last = lastUrl.substring(startPos+'last='.length, startPos+endPos);
                //console.log('last=' + last);
                var parts = last.split('%2F');
                //console.log('parts=' + parts);
                if (parts.length == 2) {
                  lastNamespace = parts[0];
                  lastRepository = parts[1];
                }
              }
            }
          }

          var ret = {
            repos: [],
            lastNamespace: lastNamespace,
            lastRepository: lastRepository
          };

          angular.forEach(repos, function(value/*, key*/) {
            ret.repos.push({
              username: ''+value.split('/')[0],
              name: value,
              selected: false
            });
          });

          return ret;
        }
      },
      'delete': {
        url: '/v2/repositories/:repoUser/:repoName/',
        method: 'DELETE',
      }
    });
}])
.factory('Tag', ['$resource', function($resource){
    // TODO: rename :repo to repoUser/repoString for convenience.
    // https://github.com/docker/distribution/blob/master/docs/spec/api.md#listing-image-tags
    return $resource('/v2/:repoUser/:repoName/tags/list', {}, {
      // Response example:
      // {"name":"kkleine/docker-registry-frontend","tags":["v2", "v1-deprecated"]}
      'query': {
        method:'GET',
        isArray: true,
        transformResponse: function(data/*, headers*/){
          var res = [];
          console.log(data);
          var resp = angular.fromJson(data);
          for (var idx in resp.tags){
            res.push({
              name: resp.tags[idx],
              imageId: 'ImageIDOf'+resp.tags[idx],
              selected: false
            });
          }
          return res;
        },
      },
      'delete': {
        url: '/v1/repositories/:repoUser/:repoName/tags/:tagName',
        method: 'DELETE',
      },
      'exists': {
        url: '/v1/repositories/:repoUser/:repoName/tags/:tagName',
        method: 'GET',
        transformResponse: function(data/*, headers*/){
          // data will be the image ID if successful or an error object.
          data = angular.isString(angular.fromJson(data));
          return data;
        },
      },
      // Usage: Tag.save({repoUser:'someuser', repoName: 'someRepo', tagName: 'someTagName'}, imageId);
      'save': {
        method:'PUT',
        url: '/v1/repositories/:repoUser/:repoName/tags/:tagName',
      },
    });
  }])
  .factory('Manifest', ['$resource', function($resource){
    return $resource('/v2/:repoUser/:repoName/manifests/:tagName', {}, {
      'query': {
        method:'GET',
        isArray: false,
        transformResponse: function(data, headers){
          var res = {};
          var history = [];
          var tmp;
          var resp = angular.fromJson(data);
          var v1Compatibility = undefined;

          for (var idx in resp.history){

            v1Compatibility = angular.fromJson(resp.history[idx].v1Compatibility);

            if(v1Compatibility !== undefined){
              tmp = {
                id : v1Compatibility.id,
                os : v1Compatibility.os,
                docker_version: v1Compatibility.docker_version,
                created: v1Compatibility.created,
                // parentLayer: v1Compatibility.parent
              };
              if(v1Compatibility.author){
                tmp.author = v1Compatibility.author;
              }
              if(v1Compatibility.config && v1Compatibility.config.Labels){
                tmp.labels = v1Compatibility.config.Labels;
              }
              history.push(tmp);
            }
          }
          if(history.length > 0){
            res = history[0];
            res.history = history;
          }
          res.fsLayers = resp.fsLayers;
          res.digest = headers('docker-content-digest');
          res.architecture = resp.architecture;
          return res;
        },
      }
    });
  }])
  .factory('ListImage', ['$resource', function($resource){

  return $resource('http://192.168.3.147:9001/images/json', {}, {
    'query': { 
      method:'GET', 
      isArray: true,
      transformResponse: function(data /*, headers*/){
        var localImage = [];
        var images = angular.fromJson(data);
        // console.log('dx');
        // console.log(images);
        images.forEach((item) => {
          localImage.push({
            Created: item.Created,
            imageId: item.Id,
            RepoTags: item.RepoTags,
            VirtualSize: item.VirtualSize
          });
        });
        return localImage;
      }
    },
    'tag': {
      method: 'POST',
      url: 'http://192.168.3.147:9001/images/:imageName/tag?repo=:repo&force=0&tag=:tag'
    },
    'push': {
      method: 'POST',
      url: 'http://192.168.3.147:9001/images/:imageName/push?tag=:tag'
    },
    'inspect': {
        method: 'GET',
        isArray: false,
        url: 'http://192.168.3.147:9001/images/:imageName/json',
        transformResponse: function(data) {
          var item = angular.fromJson(data);
          var localImageDetail = {
                author: item.Author,
                comment: item.Comment,
                created: item.Created,
                docker_version: item.DockerVersion,
                os: item.Os,
                architecture: item.Architecture,
                id: item.Id,
                parentLayer: item.Parent,
                virtual_size: item.VirtualSize
          };
          return localImageDetail;
        }
    },
    'history': {
      method: 'GET',
      isArray: true,
      url: 'http://192.168.3.147:9001/images/:imageName/history',
      transformResponse: function (data) {
        return angular.fromJson(data);  
      }
    },
  'remove': {
      method: 'DELETE',
      isArray: true,
      url: 'http://192.168.3.147:9001/images/:imageName?force=true'
    },
    'build': {
      method: 'POST',
      headers: {
          'Content-Type': 'application/tar'
      },
      url: 'http://192.168.3.147:9001/build'
    },
    'load': {
      method: 'POST',
      transformRequest: [],
      headers: {
           'Content-Type': 'application/tar'
      },
      url: 'http://192.168.3.147:9001/images/load'
    }
  });
}]);
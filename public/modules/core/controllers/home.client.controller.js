'use strict';


angular.module('core').controller('HomeController', ['$scope','$http', 'Authentication',
	function($scope, $http, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		$scope.credentials = {};
		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}


]);
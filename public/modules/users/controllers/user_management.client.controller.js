'use strict';

angular.module('users').controller('UserManagementController', ['$scope', '$http','$modal', '$location', 'Authentication', 'Alerts', 'Users',
	function($scope, $http, $modal, $location, Authentication, Alerts, Users) {
		$scope.authentication = Authentication;

		/*Create new user*/
		$scope.create = function() {
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// And redirect to the user management page
				Alerts.success();
				$location.path('/users');
			}).error(function(response) {
				$scope.error = response.message;
				Alerts.fail($scope.error);
			});
		};

	}
]);
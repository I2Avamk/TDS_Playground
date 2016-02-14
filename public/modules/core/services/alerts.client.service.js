'use strict';

//Menu service used for managing  menus
angular.module('core').service('Alerts', ['$timeout','$rootScope','$filter',function($timeout,$rootScope,$filter){
	/*Set listener for alert*/
	this.listen = function($scope){
		$scope.$on('success', function(event){
			$scope.successAlert = true;
			/*Timeout for alert*/
			var timeout = $timeout(function(){
					$scope.successAlert = false;
					$timeout.cancel(timeout);
				},2000);
		});

		$scope.$on('fail', function(event, message){
			$scope.failAlert = true;
			$scope.failReason = $filter('limitTo')(message, 30);
			/*Timeout for alert*/
			var timeout = $timeout(function(){
					$scope.failAlert = false;
					$scope.failReason = undefined;
					$timeout.cancel(timeout);
				},2000);
		});
	};

	this.success = function(){
		$rootScope.$broadcast('success');
	};

	this.fail = function(message){
		$rootScope.$broadcast('fail',message);
	};

}]);
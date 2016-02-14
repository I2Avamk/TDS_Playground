'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'TDS';
	var applicationModuleVendorDependencies = ['ngResource', 'ngCookies',  'ngAnimate',  'ngTouch',  'ngSanitize',  'ui.router', 'ui.bootstrap', 'ui.utils','angularFileUpload'];

	// Add a new vertical module
	var registerModule = function(moduleName, dependencies) {
		// Create angular module
		angular.module(moduleName, dependencies || []);

		// Add the module to the AngularJS configuration file
		angular.module(applicationModuleName).requires.push(moduleName);
	};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};
})();
'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('codes');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('ecustomers');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('groups');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('reasons');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('record-statuses');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');
'use strict';

// Configuring the Articles module
angular.module('codes').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Clients', 'codes', 'dropdown', '/codes(/create)?',false,['superadmin','admin','operator']);
		Menus.addSubMenuItem('topbar', 'codes', 'List Registered Clients by Voyage', 'codes');
		Menus.addSubMenuItem('topbar', 'codes', 'Register Client', 'codes/create');
		Menus.addSubMenuItem('topbar', 'codes', 'List Client', 'ecustomers');
		Menus.addSubMenuItem('topbar', 'codes', 'New Client', 'ecustomers/create');
	}
]);
'use strict';

//Setting up route
angular.module('codes').config(['$stateProvider',
	function($stateProvider) {
		// Codes state routing
		$stateProvider.
		state('listCodes', {
			url: '/codes?group',
			templateUrl: 'modules/codes/views/list-codes.client.view.html'
		}).
		state('createCode', {
			url: '/codes/create',
			templateUrl: 'modules/codes/views/create-code.client.view.html'
		}).
		state('viewCode', {
			url: '/codes/:codeId',
			templateUrl: 'modules/codes/views/view-code.client.view.html'
		}).
		state('editCode', {
			url: '/codes/:codeId/edit',
			templateUrl: 'modules/codes/views/edit-code.client.view.html'
		});
	}
]);
'use strict';

// Codes controller
angular.module('codes').controller('CodesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Codes',
	function($scope, $stateParams, $location, Authentication, Codes) {
		$scope.authentication = Authentication;

		// Create new Code
		$scope.create = function() {
			// Create new Code object
			var code = new Codes ({
				name: this.name
			});

			// Redirect after save
			code.$save(function(response) {
				$location.path('codes/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Code
		$scope.remove = function(code) {
			if ( code ) { 
				code.$remove();

				for (var i in $scope.codes) {
					if ($scope.codes [i] === code) {
						$scope.codes.splice(i, 1);
					}
				}
			} else {
				$scope.code.$remove(function() {
					$location.path('codes');
				});
			}
		};

		// Update existing Code
		$scope.update = function() {
			var code = $scope.code;

			code.$update(function() {
				$location.path('codes/' + code._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Codes
		$scope.find = function() {
			$scope.codes = Codes.query();
		};

		// Find existing Code
		$scope.findOne = function() {
			$scope.code = Codes.get({ 
				codeId: $stateParams.codeId
			});
		};
	}
]);
'use strict';

// Codes controller
angular.module('codes').controller('CodesCreateController', ['$scope', '$stateParams', '$location','$http', 'Authentication', 'Alerts','Codes','Ecustomers',
	function($scope, $stateParams, $location,$http, Authentication, Alerts, Codes, Ecustomers) {
		$scope.authentication = Authentication;

		$scope.addNewEcustomer = false;
		//Init
		$scope.init = function(){
			$scope.fillGroups();
			$scope.fillEcustomers();
			// $scope.fillCodeTypes();
			$scope.selectedMode = 'single';
			$scope.codeType = 'datamatrix';
		};

		$scope.fillEcustomers = function(){
			$http.get('/ecustomers')
			.success(function(items){
				$scope.ecustomers = items;
			})
			.error(function(message){
				console.log(message);
			});
		};

		$scope.addEcustomer = function(){
			$scope.newCode = angular.fromJson($scope.newCode);
		};

		$scope.fillCodeTypes = function(){
			$scope.codeTypes = ['azteccode','datamatrix','qrcode','code128'];
		};

		$scope.fillGroups = function(){
			$http.get('/groups')
			.success(function(items){
				$scope.groups = items;
				$scope.initFirstGroup();
			})
			.error(function(message){
				console.log(message);
			});
		};

		$scope.initFirstGroup = function(){
			if($scope.groups.length>0){
				$scope.selectedGroup = $scope.groups[0];
				$scope.groupChanges();
			}
			
		};

		$scope.groupChanges = function(){
			if($scope.selectedGroup){
				$scope.selectedGroupObject = angular.fromJson($scope.selectedGroup);
				$scope.newCode = {};
			}
		};

		$scope.init_single = function(){
			$scope.newCode = {};
		};

		$scope.init_multiple = function(){
			$scope.amountOfRowCodes = 1;
		};

		$scope.createMultiple = function(){
			/*For showing progress bar*/
			$scope.loadImgs = true;

			$http.put('/codes',{
				group: $scope.selectedGroupObject._id,
				codeType: $scope.codeType,
				amount: $scope.amountOfRowCodes
			})
			.success(function(data){
				Alerts.success();
				$scope.loadImgs = false;
				location.href='data:application/zip;base64,' + data;
			})
			.error(function(err){
				Alerts.fail(err);
				$scope.error = err;
			});

			//Renew the page
			$scope.amountOfRowCodes = 1;
		};

		// Create new Code
		$scope.create = function() {
			//Filter for date
			var regex_date = /^\d{4}\/\d{1,2}\/\d{1,2}$/;
		    if(!regex_date.test($scope.newCode.Date_de_naissance)){
		    	Alerts.fail('Date format error!');
		        return;
		    }
			// var date = new Date($scope.newCode.Date_de_naissance);

			// Create new Code object
			var code = new Codes ({
				codeType: $scope.codeType,
				group: $scope.selectedGroupObject._id,
				data: JSON.stringify($scope.newCode)
			});

			if($scope.addNewEcustomer){
				var ecustomer = new Ecustomers($scope.newCode);
				ecustomer.$save(
					function(response) {
						$scope.fillEcustomers();
				});
			}


			$http.post('/codes',code)
			.success(function(data){
				Alerts.success();
				var anchor = angular.element('<a/>');
			    anchor.attr({
			        href: 'data:image/png;base64,' + encodeURI(data),
			        target: '_blank',
			        download: 'new_'+$scope.selectedGroupObject.name+'.png'
			    })[0].click();

			 //    var blob = new Blob(["Hello, world!"], {type: "text/plain;charset=utf-8"});
			 //    window.saveAs(blob, "hello world.txt");

				$scope.newCode = {};
			})
			.error(function(err){
				Alerts.fail(err);
				$scope.error = err;
			});
						
		};

	}
]);
'use strict';

// Codes controller
angular.module('codes').controller('CodesManagementController', ['$scope', '$stateParams', '$location','$timeout','$http','$filter', '$modal', 'Authentication', 'Alerts','Codes',
	function($scope, $stateParams, $location,$timeout, $http,$filter, $modal,Authentication, Alerts, Codes) {
		var pagingFilter; 
		var searchTimer;
		var calculate = function(partA,partB,opt){
				switch (opt) {
			  	case '+':
			  		return partA+partB;
			  	case '-':
			  		return partA-partB;
			  	case '*':
			  		return partA*partB;
			  	case '/':
			  		return partA / partB;
			  	default:
			    	return '-';
			}
		};
		$scope.authentication = Authentication;

		$scope.jumpCreate=function(){
			$location.path('codes/create');
		};

		/*Calculation*/
		$scope.calculate = function(partA,partB,opt1,partC,opt2){
			//console.log(partA+':'+partB+':'+opt);
			var value;
			partA = partA*1.0;
			partB = partB*1.0;
			value = calculate(partA,partB,opt1);
			if(partC && opt2){
				partC = partC*1.0;
				value = calculate(value,partC,opt2);
			}
				
			return value;
		};

		/*Export*/
		$scope.export = function(){
			$http.post('/codes/manage/export',{
				groupId:$scope.selectedGroupObject._id,
				groupName:$scope.selectedGroupObject.name,
				fields:$scope.selectedGroupObject.fields
			}).then(
				function(data){
					Alerts.success();
					var anchor = angular.element('<a/>');
				    anchor.attr({
				        href: 'data:text/csv,' + encodeURI(data.data),
				        target: '_blank',
				        download: 'Data_'+$scope.selectedGroupObject.name+'.csv'
				    })[0].click();
			},
				function(err){
					Alerts.fail(err);
			});
		};

		/*Initial paging info*/
		$scope.initialPagining = function(){
			/*Inital startIndex for paging*/
			pagingFilter = $filter('PagingFilter');
			// $scope.type = Type.getType($stateParams.type); 
			$scope.startIndex = 1;
			$scope.pagination = {
				initial: false,
				currentOption: 'all',
				count : 1,
				limit : 7,
				page : 1,
				limitOptions : [5,10,20]
			};
		};

		/*private function for rebuilding pagination*/
		var rebuildPagination = function(newCount){
			if($scope.pagination.count === newCount && $scope.pagination.initial){
				$scope.pagination.displayPagings = pagingFilter($scope.pagination.pagings,$scope.pagination.page);
				return;
			}
			else{
				$scope.pagination.initial = true;
				$scope.pagination.count = newCount;
				$scope.pagination.pagings = [];
				for(var i=0; i<newCount; i++){
					$scope.pagination.pagings[i] = i+1;
				}
				$scope.pagination.displayPagings = pagingFilter($scope.pagination.pagings,$scope.pagination.page);
			}

		};

		var convertCodeDate = function(codes){
			for(var i =0; i<codes.length; i++)
				codes[i].data = angular.fromJson(codes[i].data);
			$scope.codes = codes;
		};

		//Init
		$scope.init = function(){
			$scope.initialPagining();
			$scope.fillGroups();
			$scope.fillStatus();
			$scope.currentOption = 'all';
			$scope.codeType = 'datamatrix';
			$scope.searchObj = {};
		};

		$scope.initFirstGroup = function(){
			var id = $stateParams.group;
			if($scope.groups.length>0){
				$scope.selectedGroup = $scope.groups[0];
				for(var i=0; i<$scope.groups.length; i++)
					if($scope.groups[i]._id === id){
						$scope.selectedGroup = $scope.groups[i];
						break;
					}
				
				$scope.groupChanges();
			}
			
		};

		$scope.fillGroups = function(){
			$http.get('/groups')
			.success(function(items){
				$scope.groups = items;
				$scope.initFirstGroup();
			})
			.error(function(message){
				console.log(message);
			});
		};

		$scope.fillCodeTypes = function(){
			$scope.codeTypes = ['azteccode','datamatrix','qrcode','code128'];
		};

		$scope.fillStatus = function(){
	        $http.get('/record-statuses')
	        .success(function(items){
	            var names =[];
	            for(var i=0; i<items.length; i++){
	                names.push(items[i].name);
	            }
	            $scope.statuses = names;
	        })
	        .error(function(message){
	            console.log(message);
	        });
    	};

		$scope.groupChanges = function(){
			// console.log($scope.selectedGroup);
			if($scope.selectedGroup){
				$scope.selectedGroupObject = angular.fromJson($scope.selectedGroup);
				if($scope.selectedGroupObject.calcs)
					$scope.selectedGroupObject.calcs = angular.fromJson($scope.selectedGroupObject.calcs);
				// console.log($scope.selectedGroupObject);
				$scope.count($scope.authentication.user._id, $scope.selectedGroupObject._id);
				$scope.find($scope.currentOption,$scope.startIndex,$scope.pagination.limit);
			}
		};

		$scope.search = function(){
			if(searchTimer)
				$timeout.cancel(searchTimer);
			searchTimer = $timeout(function(){
				$scope.searchObj.raw = $scope.currentOption;
				$scope.find('search',$scope.startIndex,$scope.pagination.limit,$scope.searchObj);
			},150);

			console.log($scope.searchObj);
		};

		/* Get count info*/
		$scope.count = function(user, group){
			// console.log('count');
			$http.post('/codes/manage/count', {
					group : group,
					user : user
			})
			.success(function(response){
				$scope.countInfo = response;
			});

		};

		/*Find a list of Inquiries*/
		$scope.find = function(option,page,limit,searchBody) {
			/*Filter for preventing over paging*/
			if(page > $scope.pagination.count || page < 1)
				return;
			$http.post('/codes/manage/match', searchBody, {
				params : {
					option: option,
					group : $scope.selectedGroupObject._id,
					page : page,
					limit : limit
				}})
			.success(function(codeInfo){
				// console.log(codeInfo);
				convertCodeDate(codeInfo.data);
				$scope.pagination.currentOption = option;
				$scope.pagination.page = codeInfo.currentPage;
				rebuildPagination(codeInfo.count);
			});
		};

		$scope.functionEdit = function(code){
			var originalCode = JSON.stringify(code);

			var modalInstance = $modal.open({
			    	animation: true,
			    	templateUrl: 'modules/codes/views/edit.modal.view.html',
			    	controller: 'EditModalInstanceCtrl',
			    	// size: size,
			    	resolve: {
				    	  code: function () {
						    return angular.fromJson(originalCode);
						  },
						  group: function(){
						  	return $scope.selectedGroupObject; 
						  },
						  statuses: function(){
						  	return $scope.statuses; 
						  }
			    	}
			    });

		    modalInstance.result.then(
		    	/*OK*//*Delegate*/
		    	function (updatedCode) {
		    		updatedCode.data = JSON.stringify(updatedCode.data);
		    		$scope.update(updatedCode);

		    	}, 
		    	/*Dismiss*/
		    	function () {
		    		console.log('dismiss');
		    	}
		    );
		};

		$scope.openFile = function(code){

			var modalInstance = $modal.open({
			    	animation: true,
			    	backdrop:'static',
			    	templateUrl: 'modules/codes/views/file.modal.view.html',
			    	controller: 'FileModalInstanceCtrl',
			    	// size: size,
			    	resolve: {
				    	  code: function () {
						    return code;
						  }
			    	}
			    });

		    modalInstance.result.then(
		    	/*OK*//*Delegate*/
		    	function (updatedCode) {
		    		$scope.find($scope.currentOption,$scope.pagination.page,$scope.pagination.limit);
		    	}, 
		    	/*Dismiss*/
		    	function () {
		    		console.log('dismiss');
		    	}
		    );
		};

		$scope.functionDelete = function(code){
			var modalInstance = $modal.open({
			    	animation: true,
			    	templateUrl: 'modules/groups/views/delete.modal.view.html',
			    	controller: 'DeleteModalInstanceCtrl',
			    	// size: size,
			    	resolve: {
				    	  uid: function () {
						    return 'Code: '+code.UID;
						  },
						  message: function(){
						  	return ''; 
						  }
			    	}
			    });

		    modalInstance.result.then(
		    	/*OK*//*Delegate*/
		    	function () {
					$scope.remove(code);		    		
		    	}, 
		    	/*Dismiss*/
		    	function () {
		    		console.log('dismiss');
		    	}
		    );
		};

		$scope.functionGenerate = function(code){
			$http.post('/generate',{
				type : $scope.codeType,
				text : code.UID,
				scale: 1
			})
			.success(function(response) {
				Alerts.success();
				var anchor = angular.element('<a/>');
			    anchor.attr({
			        href: 'data:image/png;base64,' + encodeURI(response),
			        target: '_blank',
			        download: code.UID+'.png'
			    })[0].click();
			})
			.error(function(response) {
				Alerts.fail(response);
			});
		};

		// Remove existing Code
		$scope.remove = function(code) {
			if ( code ) { 
				$http.delete('/codes/'+code._id)
				.success(function(response){
					Alerts.success();
					for (var i in $scope.codes) {
						if ($scope.codes [i] === code) {
							$scope.codes.splice(i, 1);
						}
					}
				})
				.error(function(response){
					Alerts.fail(response);
				});

			}
		};

		// Update existing Code
		$scope.update = function(code) {
			$http.put('/codes/'+code._id,code)
				.success(function(response){
					$scope.find($scope.currentOption,$scope.pagination.page,$scope.pagination.limit);
					Alerts.success();
				})
				.error(function(response){
					$scope.error = response.data.message;
					Alerts.fail(response);
				});
		};

		// Find existing Code
		$scope.findOne = function() {
			$scope.code = Codes.get({ 
				codeId: $stateParams.codeId
			});
		};
	}
]);
'use strict';

/*Controller for EndDate*/
angular.module('codes').controller('datepickerCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
	/*Initial the date with current date*/
	$scope.date = new Date();//receivedDate
	/*Date Format*/
	$scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
	$scope.format = $scope.formats[0];

	/*Date Options*/
	$scope.dateOptions = {
		formatYear: 'yy',
		startingDay: 1
	};

	$scope.open = function($event) {
		$event.preventDefault();
		$event.stopPropagation();

		$scope.opened = true;
	};

}]);
'use strict';

angular.module('codes').controller('EditModalInstanceCtrl', ["$scope", "$modalInstance", "code", "group", "statuses", function ($scope,$modalInstance,code,group,statuses) {
    
    $scope.init = function(){
        $scope.code = code;
        $scope.group = group;
        $scope.statuses = statuses;
    };

    /*Button functions*/
    $scope.ok = function () {
        $modalInstance.close($scope.code);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);
'use strict';

angular.module('codes').controller('FileModalInstanceCtrl', ["$scope", "$http", "$modalInstance", "FileUploader", "code", function ($scope,$http,$modalInstance,FileUploader,code) {
    
    $scope.init = function(){
        $scope.code = code;
    };

    $scope.delete = function(uid){
        $http.delete('/upload/'+code._id, {
            params : {
                uid:uid
            }})
        .then(
            function(data){
                if(data.data){
                    $scope.code = data.data;
                }
            },
            function(err){
                $scope.result = 'Delete Error';
                console.info('Delete error:',err);
        });
    };

    $scope.download = function(uid){
        window.open('/download?uid='+uid, '_self', '');
    };

    var uploader = $scope.uploader = new FileUploader({
            url: '/upload/'+code._id
        });

    // FILTERS

    uploader.filters.push({
        name: 'lengthFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            return this.queue.length < 1;
        }
    });

    // CALLBACKS

   
    uploader.onSuccessItem = function(fileItem, response, status, headers) {
        //console.info('onSuccessItem', fileItem, response, status, headers);
        $scope.code = response;
        fileItem.remove();

    };
    uploader.onErrorItem = function(fileItem, response, status, headers) {
        $scope.result = 'Upload Fail';
    };
    uploader.onCompleteAll = function() {
        $scope.result = 'Success';
    };

    uploader.onWhenAddingFileFailed = function(item , filter, options) {
        $scope.result = 'Adding Fail';
        uploader.clearQueue();
    };
    uploader.onAfterAddingFile = function(fileItem) {
        $scope.result = 'Adding Success';
    };
    /*uploader.onCancelItem = function(fileItem, response, status, headers) {
        //console.info('onCancelItem', fileItem, response, status, headers);
    };
    uploader.onCompleteItem = function(fileItem, response, status, headers) {
        //console.info('onCompleteItem', fileItem, response, status, headers);
    };

    
    uploader.onBeforeUploadItem = function(item) {
        //console.info('onBeforeUploadItem', item);
    };
    uploader.onProgressItem = function(fileItem, progress) {
        //console.info('onProgressItem', fileItem, progress);
    };
    uploader.onProgressAll = function(progress) {
        //console.info('onProgressAll', progress);
    };*/

    // uploader.onAfterAddingAll = function(addedFileItems) {
    //     console.info('onAfterAddingAll', addedFileItems);
    // };

    // $scope.uploader = new FileUploader({
    //     scope: $scope,
    //     url: '/upload/'+code.UID,
    //     autoUpload: true,   // 自动开始上传
    //     formData: [          // 和文件内容同时上传的form参数
    //       { key: 'value' }
    //     ],
    //     filters: [           // 过滤器，可以对每个文件进行处理
    //       function (item) {
    //         console.info('filter1', item);
    //         return true;
    //       }
    //     ]
    // });

    /*Button functions*/
    $scope.ok = function () {
        $modalInstance.close($scope.code);
    };


    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);
'use strict';
angular.module('codes').filter('PagingFilter',function(){
	return function(input, index){
		// console.log(input);
		// return input;


		/*Length less than 10, skip*/
		if(input.length <= 10)
			return input;

		/*index <=5, show 1~10*/
		if(index <= 5)
			return input.slice(0,10);

		/*index is near the end, show the last 10*/
		if(input.length - index < 5)
			return input.slice(input.length-10);

		/*index is in the middle*/
		return input.slice(index-5,index+5);

	};
});
'use strict';

//Codes service used to communicate Codes REST endpoints
angular.module('codes').factory('Codes', ['$resource',
	function($resource) {
		return $resource('codes/:codeId', { codeId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html'
		});
	}
]);
'use strict';


angular.module('core').controller('AlertsController', ['$scope', 'Alerts',
	function($scope, Alerts) {
		$scope.failReason = '55555555555555555';
		Alerts.listen($scope);

	}
]);
'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus',
	function($scope, Authentication, Menus) {
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});
	}
]);
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
'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

	function() {
		// Define a set of default roles
		this.defaultRoles = ['*'];

		// Define the menus object
		this.menus = {};

		// A private function for rendering decision 
		var shouldRender = function(user) {
			if (user) {
				if (!!~this.roles.indexOf('*')) {
					return true;
				} else {
					for (var userRoleIndex in user.roles) {
						for (var roleIndex in this.roles) {
							if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
								return true;
							}
						}
					}
				}
			} else {
				return this.isPublic;
			}

			return false;
		};

		// Validate menu existance
		this.validateMenuExistance = function(menuId) {
			if (menuId && menuId.length) {
				if (this.menus[menuId]) {
					return true;
				} else {
					throw new Error('Menu does not exists');
				}
			} else {
				throw new Error('MenuId was not provided');
			}

			return false;
		};

		// Get the menu object by menu id
		this.getMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			return this.menus[menuId];
		};

		// Add new menu object by menu id
		this.addMenu = function(menuId, isPublic, roles) {
			// Create the new menu
			this.menus[menuId] = {
				isPublic: isPublic || false,
				roles: roles || this.defaultRoles,
				items: [],
				shouldRender: shouldRender
			};

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			delete this.menus[menuId];
		};

		// Add menu item object
		this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Push new menu item
			this.menus[menuId].items.push({
				title: menuItemTitle,
				link: menuItemURL,
				menuItemType: menuItemType || 'item',
				menuItemClass: menuItemType,
				uiRoute: menuItemUIRoute || ('/' + menuItemURL),
				isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].isPublic : isPublic),
				roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].roles : roles),
				position: position || 0,
				items: [],
				shouldRender: shouldRender
			});

			// Return the menu object
			return this.menus[menuId];
		};

		// Add submenu item object
		this.addSubMenuItem = function(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
					// Push new submenu item
					this.menus[menuId].items[itemIndex].items.push({
						title: menuItemTitle,
						link: menuItemURL,
						uiRoute: menuItemUIRoute || ('/' + menuItemURL),
						isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
						roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : roles),
						position: position || 0,
						shouldRender: shouldRender
					});
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenuItem = function(menuId, menuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
					this.menus[menuId].items.splice(itemIndex, 1);
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeSubMenuItem = function(menuId, submenuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
					if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
						this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
					}
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		//Adding the topbar menu
		this.addMenu('topbar');
	}
]);
'use strict';

// Configuring the Articles module
angular.module('ecustomers').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		// Menus.addMenuItem('topbar', 'Ecustomers', 'ecustomers', 'dropdown', '/ecustomers(/create)?',false,['superadmin','admin','operator']);
		// Menus.addSubMenuItem('topbar', 'ecustomers', 'List Ecustomers', 'ecustomers');
		// Menus.addSubMenuItem('topbar', 'ecustomers', 'New Ecustomer', 'ecustomers/create');
	}
]);
'use strict';

//Setting up route
angular.module('ecustomers').config(['$stateProvider',
	function($stateProvider) {
		// Ecustomers state routing
		$stateProvider.
		state('listEcustomers', {
			url: '/ecustomers',
			templateUrl: 'modules/ecustomers/views/list-ecustomers.client.view.html'
		}).
		state('createEcustomer', {
			url: '/ecustomers/create',
			templateUrl: 'modules/ecustomers/views/create-ecustomer.client.view.html'
		}).
		state('viewEcustomer', {
			url: '/ecustomers/:ecustomerId',
			templateUrl: 'modules/ecustomers/views/view-ecustomer.client.view.html'
		}).
		state('editEcustomer', {
			url: '/ecustomers/:ecustomerId/edit',
			templateUrl: 'modules/ecustomers/views/edit-ecustomer.client.view.html'
		});
	}
]);
'use strict';

// Ecustomers controller
angular.module('ecustomers').controller('EcustomersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Ecustomers','Alerts',
	function($scope, $stateParams, $location, Authentication, Ecustomers,Alerts) {
		$scope.authentication = Authentication;
		$scope.fixFields = ['Nom','Prenom','Date_de_naissance','Lieu_de_naissance','Addressee','Telephone_mobile','Telephone_Fix','Fax','email','facebook','twitter','Autre_1','Autre_2','Observation'];

		$scope.init = function(){
			$scope.ecustomer = {};
		};
		$scope.edit = function(id){
			// "/#!/ecustomers/{{ecustomer._id}}/edit"
			$location.path('ecustomers/'+id+'/edit');
		};

		// Create new Ecustomer
		$scope.create = function() {
			//Filter for empty creation			
			if(!$scope.ecustomer || !$scope.ecustomer.Nom || !$scope.ecustomer.Prenom){
				Alerts.fail('Nom or Prenom can not be empty!');
				return;
			}

			//Filter for date
			var regex_date = /^\d{4}\/\d{1,2}\/\d{1,2}$/;
		    if($scope.ecustomer.Date_de_naissance && !regex_date.test($scope.ecustomer.Date_de_naissance)){
		    	Alerts.fail('Date format yyyy/mm/dd!');
		        return;
		    }


			// Create new Ecustomer object
			var ecustomer = new Ecustomers ($scope.ecustomer);

			// Redirect after save
			ecustomer.$save(function(response) {
				$location.path('ecustomers');

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Ecustomer
		$scope.remove = function(ecustomer) {
			if ( ecustomer ) { 
				ecustomer.$remove();

				for (var i in $scope.ecustomers) {
					if ($scope.ecustomers [i] === ecustomer) {
						$scope.ecustomers.splice(i, 1);
					}
				}
			} else {
				$scope.ecustomer.$remove(function() {
					$location.path('ecustomers');
				});
			}
		};

		// Update existing Ecustomer
		$scope.update = function() {
			var ecustomer = $scope.ecustomer;

			ecustomer.$update(function() {
				$location.path('ecustomers');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Ecustomers
		$scope.find = function() {
			$scope.ecustomers = Ecustomers.query();
		};

		// Find existing Ecustomer
		$scope.findOne = function() {
			$scope.ecustomer = Ecustomers.get({ 
				ecustomerId: $stateParams.ecustomerId
			});
		};
	}
]);
'use strict';

//Ecustomers service used to communicate Ecustomers REST endpoints
angular.module('ecustomers').factory('Ecustomers', ['$resource',
	function($resource) {
		return $resource('ecustomers/:ecustomerId', { ecustomerId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Configuring the Articles module
angular.module('groups').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Voyages', 'groups', 'dropdown', '/groups(/create)?',false,['superadmin','admin','operator']);
		Menus.addSubMenuItem('topbar', 'groups', 'Gestion des Voyages', 'groups');
		Menus.addSubMenuItem('topbar', 'groups', 'Ajouter Voyage', 'groups/create');
	}
]);
'use strict';

//Setting up route
angular.module('groups').config(['$stateProvider',
	function($stateProvider) {
		// Groups state routing
		$stateProvider.
		state('listGroups', {
			url: '/groups',
			templateUrl: 'modules/groups/views/list-groups.client.view.html'
		}).
		state('createGroup', {
			url: '/groups/create',
			templateUrl: 'modules/groups/views/create-group.client.view.html'
		}).
		state('viewGroup', {
			url: '/groups/:groupId',
			templateUrl: 'modules/groups/views/view-group.client.view.html'
		}).
		state('editGroup', {
			url: '/groups/:groupId/edit',
			templateUrl: 'modules/groups/views/edit-group.client.view.html'
		});
	}
]);
'use strict';

angular.module('groups').controller('DeleteModalInstanceCtrl', ["$scope", "$modalInstance", "uid", "message", function ($scope, $modalInstance,uid,message) {
    
    $scope.init = function(){
        $scope.uid = uid;
        $scope.message = message;
    };


    /*Button functions*/
    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);
'use strict';

// Groups controller
angular.module('groups').controller('GroupsController', ['$scope', '$stateParams','$state','$modal', '$location', '$http', 'Authentication', 'Alerts', 'Groups',
	function($scope, $stateParams,$state, $modal, $location, $http, Authentication,Alerts, Groups) {
		$scope.authentication = Authentication;
		$scope.fixFields = [
			{value:'Nom'},
			{value:'Prenom'},
			{value:'Date_de_naissance'},
			{value:'Lieu_de_naissance'},
			{value:'Addressee'},
			{value:'Telephone_mobile'},
			{value:'Telephone_Fix'},
			{value:'Fax'},
			{value:'email'},
			{value:'facebook'},
			{value:'twitter'},
			{value:'Autre_1'},
			{value:'Autre_2'},
			{value:'Observation'}
		];

		$scope.fillFields = function(){
			$scope.fields = [
				{value:'FieldA'},
				{value:'FieldB'}
			];
			$scope.calcs = [];
			$scope.calcs = [];
			$scope.operators = ['+','-','*','/'];
		};

		$scope.addCalc = function(){
			$scope.calcs.push({
				name:'CalcName',
				partA:$scope.fields[0].value,
				partB:$scope.fields[0].value,
				operator1:$scope.operators[0]
			});
		};

		$scope.removeCalc = function(item){
			$scope.calcs.splice($scope.calcs.indexOf(item), 1);
		};

		$scope.addFieled = function(){
			$scope.fields.push({value:'FieldNew'});
		};

		$scope.removeFieled = function(item){
			$scope.fields.splice($scope.fields.indexOf(item), 1);
		};

		/*Jump to edit page*/
		$scope.jump = function(id){
			$location.path('groups/'+id+'/edit');
		};

		/*Jump to create page*/
		$scope.jumpCreate = function(){
			$location.path('groups/create');
		};

		$scope.go = function(group){
			// $location.path('codes?group='+group.name);
			$state.go('listCodes',{group:group._id});
		};

		/*Delete prompt*/
		$scope.deleteConfirm = function (group) {
		    var modalInstance = $modal.open({
			    	animation: true,
			    	templateUrl: 'modules/groups/views/delete.modal.view.html',
			    	controller: 'DeleteModalInstanceCtrl',
			    	// size: size,
			    	resolve: {
				    	  uid: function () {
						    return group.name;
						  },
						  message: function(){
						  	return 'This action will remove also all code recrods related to this group.'; 
						  }
			    	}
			    });

		    modalInstance.result.then(
		    	/*OK*//*Delegate*/
		    	function () {
					$scope.remove(group);		    		
		    	}, 
		    	/*Dismiss*/
		    	function () {
		    		console.log('dismiss');
		    	}
		    );
	  	};

	  	/*Export*/
		$scope.export = function(group){
			$http.post('/codes/manage/export',{
				groupId:group._id,
				groupName:group.name,
				fields:group.fields
			}).then(
				function(data){
					Alerts.success();
					var anchor = angular.element('<a/>');
				    anchor.attr({
				        href: 'data:text/csv,' + encodeURI(data.data),
				        target: '_blank',
				        download: 'Data_'+group.name+'.csv'
				    })[0].click();
			},
				function(err){
					Alerts.fail(err);
			});
		};

		// Create new Group
		$scope.create = function() {
			//JSON.stringify($scope.userinfo)
			//angular.fromJson(sessionStorage.getItem('generation_info'));
			var fields = [];
			var calcs = '';
			for(var i=0; i<$scope.fixFields.length; i++){
				//Filter for duplication
				if(fields.indexOf($scope.fixFields[i].value) === -1)
					fields.push($scope.fixFields[i].value);
			}
			if($scope.fields && $scope.fields.length>0){
				for( i=0; i<$scope.fields.length; i++){
					//Filter for duplication
					if(fields.indexOf($scope.fields[i].value) === -1)
						fields.push($scope.fields[i].value);
				}
			}
			if($scope.calcs.length>0){
				calcs = angular.toJson($scope.calcs);
			}

			// Create new Group object
			var group = new Groups ({
				name: this.name,
				fields: fields,
				calcs:calcs
			}); 

			// Redirect after save
			group.$save(function(response) {
				$location.path('groups');
				Alerts.success();
				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.fail(errorResponse.data.message);
			});
		};
		// $scope.create = function(){
		// 	console.log($scope.calcs);
		// };

		// Remove existing Group
		$scope.remove = function(group) {
			if ( group ) { 
				group.$remove();
				Alerts.success();
				for (var i in $scope.groups) {
					if ($scope.groups [i] === group) {
						$scope.groups.splice(i, 1);
					}
				}
			} else {
				$scope.group.$remove(function() {
					Alerts.success();
					$location.path('groups');
				});
			}
		};

		// Update existing Group
		$scope.update = function() {
			var group = $scope.group;

			group.$update(function() {
				Alerts.success();
				$location.path('groups');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.fail(errorResponse.data.message);
				
			});
		};

		// Find a list of Groups
		$scope.find = function() {
			$scope.groups = Groups.query();
		};

		// Find existing Group
		$scope.findOne = function() {
			$scope.group = Groups.get({ 
				groupId: $stateParams.groupId
			});
		};
	}
]);
'use strict';

//Groups service used to communicate Groups REST endpoints
angular.module('groups').factory('Groups', ['$resource',
	function($resource) {
		return $resource('groups/:groupId', { groupId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

var validRoles = ['admin'];
var isPublic = false;

// Configuring the Articles module
/*angular.module('reasons').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Reasons', 'reasons', 'dropdown', '/reasons(/create)?',isPublic,validRoles);
		Menus.addSubMenuItem('topbar', 'reasons', 'List Reasons', 'reasons');
		Menus.addSubMenuItem('topbar', 'reasons', 'New Reason', 'reasons/create');
	}
]);*/
'use strict';

//Setting up route
angular.module('reasons').config(['$stateProvider',
	function($stateProvider) {
		// Reasons state routing
		$stateProvider.
		state('listReasons', {
			url: '/reasons',
			templateUrl: 'modules/reasons/views/list-reasons.client.view.html'
		}).
		state('createReason', {
			url: '/reasons/create',
			templateUrl: 'modules/reasons/views/create-reason.client.view.html'
		}).
		state('viewReason', {
			url: '/reasons/:reasonId',
			templateUrl: 'modules/reasons/views/view-reason.client.view.html'
		}).
		state('editReason', {
			url: '/reasons/:reasonId/edit',
			templateUrl: 'modules/reasons/views/edit-reason.client.view.html'
		});
	}
]);
'use strict';

// Reasons controller
angular.module('reasons').controller('ReasonsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Reasons',
	function($scope, $stateParams, $location, Authentication, Reasons) {
		$scope.authentication = Authentication;

		// Create new Reason
		$scope.create = function() {
			// Create new Reason object
			var reason = new Reasons ({
				name: this.name
			});

			// Redirect after save
			reason.$save(function(response) {
				$location.path('reasons');

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Reason
		$scope.remove = function(reason) {
			if ( reason ) { 
				reason.$remove();

				for (var i in $scope.reasons) {
					if ($scope.reasons [i] === reason) {
						$scope.reasons.splice(i, 1);
					}
				}
			} else {
				$scope.reason.$remove(function() {
					$location.path('reasons');
				});
			}
		};

		// Update existing Reason
		$scope.update = function() {
			var reason = $scope.reason;

			reason.$update(function() {
				$location.path('reasons/' + reason._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Reasons
		$scope.find = function() {
			$scope.reasons = Reasons.query();
		};

		// Find existing Reason
		$scope.findOne = function() {
			$scope.reason = Reasons.get({ 
				reasonId: $stateParams.reasonId
			});
		};
	}
]);
'use strict';

//Reasons service used to communicate Reasons REST endpoints
angular.module('reasons').factory('Reasons', ['$resource',
	function($resource) {
		return $resource('reasons/:reasonId', { reasonId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Configuring the Articles module
angular.module('record-statuses').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Index', 'record-statuses', 'dropdown', '/record-statuses(/create)?',false,['superadmin','admin','operator']);
		Menus.addSubMenuItem('topbar', 'record-statuses', 'Gestion des Index', 'record-statuses');
		Menus.addSubMenuItem('topbar', 'record-statuses', 'Ajouter Index', 'record-statuses/create');
	}
]);
'use strict';

//Setting up route
angular.module('record-statuses').config(['$stateProvider',
	function($stateProvider) {
		// Record statuses state routing
		$stateProvider.
		state('listRecordStatuses', {
			url: '/record-statuses',
			templateUrl: 'modules/record-statuses/views/list-record-statuses.client.view.html'
		}).
		state('createRecordStatus', {
			url: '/record-statuses/create',
			templateUrl: 'modules/record-statuses/views/create-record-status.client.view.html'
		}).
		state('viewRecordStatus', {
			url: '/record-statuses/:recordStatusId',
			templateUrl: 'modules/record-statuses/views/view-record-status.client.view.html'
		}).
		state('editRecordStatus', {
			url: '/record-statuses/:recordStatusId/edit',
			templateUrl: 'modules/record-statuses/views/edit-record-status.client.view.html'
		});
	}
]);
'use strict';

// Record statuses controller
angular.module('record-statuses').controller('RecordStatusesController', ['$scope', '$stateParams', '$modal','$location', 'Authentication', 'Alerts', 'RecordStatuses',
	function($scope, $stateParams, $modal, $location, Authentication, Alerts, RecordStatuses) {
		$scope.authentication = Authentication;

		/*Jump to edit page*/
		$scope.jump = function(id){
			$location.path('record-statuses/'+id+'/edit');
		};

		/*Jump to create page*/
		$scope.jumpCreate = function(){
			$location.path('record-statuses/create');
		};

		/*Delete prompt*/
		$scope.deleteConfirm = function (entity) {
		    var modalInstance = $modal.open({
			    	animation: true,
			    	templateUrl: 'modules/groups/views/delete.modal.view.html',
			    	controller: 'DeleteModalInstanceCtrl',
			    	// size: size,
			    	resolve: {
			    		uid: function () {
					        	return entity.name;
					    	} ,
					    message: function(){
						  	return ''; 
						  }

			    	}
			    });

		    modalInstance.result.then(
		    	/*OK*//*Delegate*/
		    	function () {
					$scope.remove(entity);		    		
		    	}, 
		    	/*Dismiss*/
		    	function () {
		    		console.log('dismiss');
		    	}
		    );
	  	};

		// Create new Record status
		$scope.create = function() {
			// Create new Record status object
			var recordStatus = new RecordStatuses ({
				name: this.name
			});

			// Redirect after save
			recordStatus.$save(function(response) {
				$location.path('record-statuses');

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Record status
		$scope.remove = function(recordStatus) {
			if ( recordStatus ) { 
				recordStatus.$remove();
				Alerts.success();
				for (var i in $scope.recordStatuses) {
					if ($scope.recordStatuses [i] === recordStatus) {
						$scope.recordStatuses.splice(i, 1);
					}
				}
			} else {
				$scope.recordStatus.$remove(function() {
					Alerts.success();
					$location.path('record-statuses');
				});
			}
		};

		// Update existing Record status
		$scope.update = function() {
			var recordStatus = $scope.recordStatus;

			recordStatus.$update(function() {
				$location.path('record-statuses');
				Alerts.success();
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.fail(errorResponse.data.message);
				// Alerts.success();
				// Alerts.fail(err);
			});
		};

		// Find a list of Record statuses
		$scope.find = function() {
			$scope.recordStatuses = RecordStatuses.query();
		};

		// Find existing Record status
		$scope.findOne = function() {
			$scope.recordStatus = RecordStatuses.get({ 
				recordStatusId: $stateParams.recordStatusId
			});
		};
	}
]);
'use strict';

//Record statuses service used to communicate Record statuses REST endpoints
angular.module('record-statuses').factory('RecordStatuses', ['$resource',
	function($resource) {
		return $resource('record-statuses/:recordStatusId', { recordStatusId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication',
			function($q, $location, Authentication) {
				return {
					responseError: function(rejection) {
						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
								$location.path('signin');
								break;
							case 403:
								// Add unauthorized behaviour 
								break;
						}

						return $q.reject(rejection);
					}
				};
			}
		]);
	}
]);

// Configuring the User management module
angular.module('users').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		/*(menuId, menuItemTitle, menuItemType, menuItemURL, [menuItemUIRoute], [isPublic], [roles], [position]);*/
		Menus.addMenuItem('topbar', 'Utilisateurs', 'users', 'dropdown', '/users(/create)?',false,['superadmin','admin']);
		Menus.addSubMenuItem('topbar', 'users', 'Gestion des Utilisateurs', 'users');
		Menus.addSubMenuItem('topbar', 'users', 'Ajouter Utilisateur', 'users/create');
	}
]);
'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
		state('profile', {
			url: '/settings/profile',
			templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
		}).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).
		state('accounts', {
			url: '/settings/accounts',
			templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
		}).

		state('create', {
			url: '/users/create',
			templateUrl: 'modules/users/views/authentication/create.client.view.html'
		}).
		state('management', {
			url: '/users',
			templateUrl: 'modules/users/views/management-users.client.view.html'
		}).
		// state('signin', {
		// 	url: '/signin',
		// 	templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		// }).
		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
		}).
		state('reset-invalid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html'
		});
	}
]);
'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		$scope.signup = function() {
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;
				// console.log($scope.authentication.user);

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('EditUserModalInstanceCtrl', ["$scope", "$modalInstance", "user", "roles", function ($scope,$modalInstance,user,roles) {
    
    $scope.init = function(){
        $scope.roles = roles;
        $scope.user = user;
        $scope.user.role = $scope.user.roles[0];
        // console.log($scope.user.role);
    };

    /*Button functions*/
    $scope.ok = function () {
        $scope.user.roles = [$scope.user.role];
        $modalInstance.close($scope.user);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);
'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		// Submit forgotten password account id
		$scope.askForPasswordReset = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/forgot', $scope.credentials).success(function(response) {
				// Show user success message and clear form
				$scope.credentials = null;
				$scope.success = response.message;

			}).error(function(response) {
				// Show user error message and clear form
				$scope.credentials = null;
				$scope.error = response.message;
			});
		};

		// Change user password
		$scope.resetUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.passwordDetails = null;

				// Attach user profile
				Authentication.user = response;

				// And redirect to the index page
				$location.path('/password/reset/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Alerts', 'Authentication',
	function($scope, $http, $location, Users, Alerts, Authentication) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid) {
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);

				user.$update(function(response) {
					Alerts.success();
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
					Alerts.fail($scope.error);
				});
			} else {
				$scope.submitted = true;
			}
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				Alerts.success();
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
				Alerts.fail($scope.error);
			});
		};
	}
]);
'use strict';

angular.module('users').controller('UserManagementController', ['$scope', '$http','$modal', '$location', 'Authentication', 'Alerts', 'Users',
	function($scope, $http, $modal, $location, Authentication, Alerts, Users) {
		$scope.authentication = Authentication;
		var fillRoles = function(){
			if(Authentication.user.roles.indexOf('superadmin')!==-1)
				$scope.roles = ['user','admin', 'operator'];
			else
				$scope.roles = ['operator','user'];
		};

		fillRoles();

		

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

		/* List all users */
		$scope.list = function(){
			$scope.users = Users.query();
		};

		/* Delete this user*/
		$scope.delete = function(userId){
			$http.put('/users/delete', {id:userId}).success(function(response) {
				Alerts.success();
				$scope.users = Users.query();
			}).error(function(response) {
				$scope.error = response.message;
				Alerts.fail($scope.error);
			});
		};

		/* Edit user*/
		$scope.functionEdit = function(user){
			// console.log(user);

			var modalInstance = $modal.open({
			    	animation: true,
			    	backdrop:'static',
			    	templateUrl: 'modules/users/views/edit.modal.view.html',
			    	controller: 'EditUserModalInstanceCtrl',
			    	// size: size,
			    	resolve: {
				    	  user: function () {
						    return user;
						  },
						  roles: function(){
						  	return $scope.roles; 
						  }
			    	}
			    });

		    modalInstance.result.then(
		    	/*OK*//*Delegate*/
		    	function (updatedUser) {
		    		$http.put('/users/update',updatedUser).then(
		    			function(data){
		    				Alerts.success();
							$scope.users = Users.query();
		    			},
		    			function(response){
		    				$scope.error = response.message;
							Alerts.fail($scope.error);
		    			});

		    	}, 
		    	/*Dismiss*/
		    	function () {
		    		console.log('dismiss');
		    	}
		    );
		};



	}
]);
'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [
	function() {
		var _this = this;

		_this._data = {
			user: window.user
		};

		// console.log(window.user);

		return _this._data;
	}
]);
'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
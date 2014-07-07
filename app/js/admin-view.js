var StephanoAdmin = angular.module('StephanoAdmin',[
	'ngRoute',
	'StephanoAdminControllers'
]);

StephanoAdmin.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/users', {
        templateUrl: '/partials/user-admin.html',
        controller: 'UserCtrl',
		name : 'Users'
      }).
      when('/datasets', {
        templateUrl: '/partials/dataset_admin.html',
        controller: 'DatasetCtrl',
		name : 'Datasets'
	}).otherwise({
		templateUrl: '/partials/admin-intro.html',
		name: 'index'
	});
  }]);

var StephanoAdminControllers = angular.module('StephanoAdminControllers', []);

StephanoAdminControllers.controller('AdminSections', ['$scope', '$route', function($scope, $route){
	$scope.sections = [{name:'Users'}, {name:'Datasets'}, {name:'Database'}];

	$scope.getDisplayClass = function(name){
		if($route.current)
		{
			var url = $route.current.$$route.name;
			return url == name;
		}
		else
		{
			return false;
		}
	}

}]);

StephanoAdminControllers.controller('DatasetCtrl', ['$scope', '$http', function($scope, $http){
	$scope.datasets = [];
	$scope.current_dataset_name = '';

	$http.get('/api/datasets').success(function(data){
		$scope.datasets = data;
	});

	$scope.getFields = function()
	{
		if($scope.metadata.length)
		{
			return Object.keys($scope.metadata[0]);
		}

	}

	$scope.getDatasetConfig = function()
	{
		$http.get('/api/' + $scope.current_dataset_name + '/config').success(function(data){
				$scope.dataset = data;
		});

		$http.get('/api/' + $scope.current_dataset_name + '/meta').success(function(data){
				console.debug(data[0]);
				$scope.metadata = data;
		});
	}
}]);

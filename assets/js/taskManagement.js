angular
    .module("taskManagement", ['ngRoute'])
    .config(['$routeProvider', function(routeProvider) {
        routeProvider
            .when("/", {
                templateUrl: "assets/js/views/board.html",
                controller: "boardController"
            })

  }]).controller('boardController', ['$scope', '$http', '$rootScope', '$window',
  function($scope, $http, $rootScope, windowObj) {
    $scope.showInputSection=false;
    $scope.taskList=[];

    $scope.updateTasks = function(){
      $http.get('/api/getTasks').success(function(response) {

          $scope.taskList = response;
      });
    }
    $scope.updateTasks();
    $scope.updateBoard=function(){
      $http.get('/api/getTasks').success(function(response) {
            $scope.taskList = response;
            console.log(response);
      });
    };
    $scope.saveTask = function(){

            var task = {
              title : $scope.titleList,
              cardList:[]
            }
            $http.post('/api/addTask', task)
                .success(function(response) {
                    if (response) {
                      $scope.taskList = response;
                      console.log("task added in board");
                      $scope.showInputSection = false;
                    }
            });

    };
    $scope.addTaskList = function(){
          $scope.titleList = "";
          $scope.showInputSection=true;
    };
    $scope.hideInputSection = function(){
         $scope.showInputSection=false;
    };


}]).directive('myTask',function () {
    return {
        restrict: 'E',
        scope: {
          taskTitle: '@'
        },
         templateUrl: 'assets/js/views/task.html',
         controller: ['$scope', '$http',function MyTabsController($scope,$http) {
           $scope.showInputSection=false;
           $scope.id = 0;
              $http.get('/api/getCardList/'+$scope.taskTitle).success(function(response) {
                $scope.id = response.length
                $scope.cardList = response;
            });
          $scope.addCard = function(){
                var card = {
                    cardId : $scope.taskTitle+$scope.id,
                    detail : $scope.cardDetail,
                    taskTitle : $scope.taskTitle
                  }
                  $http.post('/api/addCard', card)
                      .success(function(response) {
                          if (response) {
                            $scope.cardList = response.cardList;
                            console.log("card added in board");
                            $scope.showInputSection = false;
                          }
                  });
          };
          $scope.addCardList = function(){
                $scope.cardDetail = "";
                $scope.showInputSection=true;
          };
          $scope.hideInputSection = function(){
               $scope.showInputSection=false;
          };

        } ]//DOM manipulation
    }
}).directive('cardItem',["$http",function ($http) {
    return {
        restrict: 'E',
        scope: {
          card: "="
        },
        templateUrl: 'assets/js/views/card.html',
         require: '^^myTask',

        link: function ($scope, element, attrs,myTaskCtrl) {
          $scope.showEditingSection = false;
           $scope.taskList = [];
          $scope.editOptions = {
            editLabelBox :false,
            editMemberBox :false,
            selectTaskBox : false
          };
          $http.get('/api/getTasks').success(function(response) {
            $scope.taskList = response;
            $scope.selectedTask = response[0];
              //$scope.$apply($scope.taskList);
          });
          $scope.editCard=function(card){
            $scope.showEditingSection = true;
          }
          $scope.closeEditCard =function(){
              $scope.showEditingSection = false;
          }
          $scope.showMoveCard=function(){
           $scope.editOptions.selectTaskBox = true;
           $scope.editOptions.editMemberBox = false;
           $scope.editOptions.editLabelBox = false;
         }
         $scope.moveCard=function(card){

           var moveCardData ={
             card:card,
             newTask : $scope.selectedTask
           }
           $http.post('/api/moveCard',moveCardData).success(function(response) {
               $scope.cardList = response;
               $scope.$parent.$parent.$parent.$parent.updateTasks();
            });
          }


        } //DOM manipulation
    }
}]);

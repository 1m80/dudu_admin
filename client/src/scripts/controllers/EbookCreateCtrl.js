app.controller('EbookCreateCtrl', function($scope ) {
    var vm = this;

    $scope.test = 'asdf';

    // function assignment
    vm.onSubmit = onSubmit;

    //variable assignment
    vm.model = {
        awesome: true
    };
    vm.options = {
        formState: {
            awesomeIsForced: false
        }
    };
    vm.fields = [
        {
            key: 'title',
            type: 'input',
            templateOptions: {
                label: '书名',
                placeholder: '在此填写汉文书名'
            }
        },
        {
            key: 'lang',
            type: 'checkbox',
            templateOptions: {
                label: '语种'
            },
            watcher: {
                listener: function(field, newValue, oldValue, formScope, stopWatching) {
                    if (newValue) {
                        stopWatching();
                        formScope.model.desc = 'adsfasdf';
                        formState.options.formState.awesomeIsForced = true;
                    }
                }
            }
        },
        {
            key: 'title_plus',
            key: 'input',
            templateOptions: {
                label: '书名+'
            },
            expressionProperties: {
                'templateOptions.disabled':'formState.awesomeIsForced',
                'templateOptions.label': function(viewValue, modelValue, scope) {
                    if (scope.formState.awesomeIsForced) {
                        return '维文书名';
                    } else {
                        return '哈文书名';
                    }
                }
            }
        },
        {
            key: 'desc',
            type: 'textarea',
            templateOptions: {
                label: '简介',
                placeholder: '此处输入汉语简介',
                description: '这是description'
            },
            expressionProperties: {
                'templateOptions.focus': 'formState.awesomeIsForced',
                'templateOptions.descriptin': function(viewValue, modelValue, scope) {
                    if (scope.formstate.awesomeIsForced) {
                        return 'its get focus';
                    }
                }
            }
        }
    ];

    function onSubmit() {
        alert(JSON.stringify(vm.model), null, 2);
    }
});

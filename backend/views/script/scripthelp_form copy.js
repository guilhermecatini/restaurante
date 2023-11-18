angular.module("scriptform", [])
    .controller("scriptformcontroller", scriptformcontroller);
    
scriptformcontroller.$inject = ["$scope", "$window"];

function scriptformcontroller($scope, $window) {

    $scope.fd = {};

    $scope.saveRecord = () => {
        const editor_value = window.editor.getValue();
        $scope.fd.script = editor_value;
    }

    $scope.onInit = () => {
        require.config({ paths: { "vs": "https://unpkg.com/monaco-editor@latest/min/vs" } });
        window.MonacoEnvironment = { getWorkerUrl: () => proxy };

        let proxy = URL.createObjectURL(new Blob([`
                            self.MonacoEnvironment = {
                                baseUrl: "https://unpkg.com/monaco-editor@latest/min/"
                            };
                            importScripts("https://unpkg.com/monaco-editor@latest/min/vs/base/worker/workerMain.js");
                        `], { type: "text/javascript" }));

        require(["vs/editor/editor.main"], function () {
            window.editor = monaco.editor.create(document.getElementById("containereditor"), {
                value: [
                    `var nome = "Guilherme";`
                ].join("\n"),
                language: "javascript",
                theme: "vs-dark"
            });
        });
    }
    $scope.onInit();
}
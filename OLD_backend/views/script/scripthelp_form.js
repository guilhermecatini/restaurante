function onSubmit() {
    document.querySelector("#script").value = window.editor.getValue();
}

window.onload = function () {
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
            // value: [
            //     `var nome = "Guilherme";`
            // ].join("\n"),
            value: document.querySelector("#script").value,
            language: "javascript",
            theme: "vs-dark"
        });
    });
}
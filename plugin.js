define(function(require, exports, module) {
    "use strict";
    
    main.consumes = [
        "Plugin", "commands", "proc", "dialog.alert", "util"
    ];

    main.provides = ["command.pipe"];
    return main;

    function main(options, imports, register) {
        var Plugin = imports.Plugin;

        var plugin = new Plugin("Ajax.org", main.consumes);
        var Range = require("ace/range").Range;
        var commands = imports.commands;
        var execFile = imports.proc.execFile;
        var Alert = imports["dialog.alert"];
        var format = require("util").format;
        var loaded = false;

        function formatCode(editor) {
            var ace = editor.ace;
            var sel = ace.selection;
            var session = ace.session;
            var range = sel.getRange();

            var value = session.getTextRange(range);
            var cmd = prompt("enter a command");
            
            if(!cmd) return;

            function handleError(err) {
                Alert.show("Command execution failed",
                    format("Could not execute '%s'", cmd)
                );
                console.error(err);
            }
            
            execFile("~/.c9/plugins/c9.command.pipe/exec.js", {
                args: [cmd, value]
            }, function(err, stdout, stderr) {
                if (err) return handleError(err);
                if (stderr) return handleError(stderr);

                value = stdout;
                var end = session.diffAndReplace(range, value);
                sel.setSelectionRange(Range.fromPoints(range.start, end));
            });

            return true;
        }


        function load() {
            loaded = true;

            commands.addCommand({
                name: "pipe_format",
                bindKey: {
                    mac: "Command-Shift-\\",
                    win: "Ctrl-Shift-\\"
                },
                isAvailable: function(editor) {
                    return loaded;
                },
                exec: function(editor) {
                    formatCode(editor);
                }
            }, plugin);
        }

        plugin.on("load", load);

        plugin.on("unload", function() {
            loaded = false;
        });

        register(null, {
            "command.pipe": plugin
        });
    }
});
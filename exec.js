#!/usr/bin/env node

var spawn = require("child_process").spawn;
var exec = require("child_process").execFile;
var args = process.argv.slice(2);

run(args[0], args[1]);


function exit(err) {
    if (err) console.error(err);
    if (err) process.exit(1);
    process.exit();
}

function output(str){
    if (str["toString"]) console.info(str.toString().trim());
    else console.info(str);
}

function parseCommand(cmd) {
    cmd = cmd.split(/\s+/);
    return [cmd.shift(), cmd];
}

function parseValue(value){
    return value.split("\\n").join("\n");
}

function run(cmd, value) {
    cmd = parseCommand(cmd);

    if (value) {
        var proc = spawn(cmd[0], cmd[1], { timeout: 100 });

        proc.on("error", exit);
        proc.stdout.on("data", output);
        proc.stderr.on("data", exit);
        
        proc.stdin.on("close", exit);
        proc.stdin.on("error", exit);
        
        proc.stdin.write(parseValue(value));
        proc.stdin.end();

        return;
    }
    
    exec(cmd[0], cmd[1], {
        timeout: 100
    }, function(err, stdout, stderr) {
        if (err) return exit(err);
        if (stderr) return exit(stderr);
        output(stdout);
        exit();
    });
}
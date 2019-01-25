// greeter.js
    const helloWorld = function (name) {
        process.stdout.write(`hello ${name}!\n`)
    };
    const internal = function (name) {
        process.stdout.write('This is a private function')
    };
    exports.sayHello = helloWorld;
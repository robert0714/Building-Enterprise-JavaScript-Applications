// greeter.js
    
    const helloWorld = function (name) {
        process.stdout.write(`hello ${name}!\n`)
    };
    /**
     *
     *
     * @param {*} name
     */
    const internal = function (name) {
        process.stdout.write('This is a private function')
    };
    exports.sayHello = helloWorld;      
// greeter.js
    const helloWorld = function (name) {
        process.stdout.write(`hello ${name}!\n`)
    };
    const privateHellowWorld = function (name) {
        process.stdout.write('This is a private function')
    };
    export default helloWorld;
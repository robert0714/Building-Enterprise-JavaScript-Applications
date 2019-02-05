# Building-Enterprise-JavaScript-Applications
published date: 2018.09.29

Building Enterprise JavaScript Applications, published by Packt

<a href="https://www.packtpub.com/web-development/building-enterprise-javascript-applications"><img src="https://www.packtpub.com/sites/default/files/cover%20-%20Copy_8514.png" alt="Book Name" height="256px" align="right"></a>

This is the code repository for [Building Enterprise JavaScript Applications](https://www.packtpub.com/web-development/building-enterprise-javascript-applications), published by Packt.

**Learn to build and deploy robust JavaScript applications using Cucumber, Mocha, Jenkins, Docker, and Kubernetes**

## About original github:
* server-side sample
https://github.com/d4nyll/hobnob
* client-side sample
https://github.com/d4nyll/hobnob-client

## What is this book about?

With the over-abundance of tools in the JavaScript ecosystem, it's easy to feel lost. Build tools, package managers, loaders, bundlers, linters, compilers, transpilers, typecheckers - how do you make sense of it all?

This book covers the following exciting features: 

* Practice Test-Driven Development (TDD) throughout the entire book
* Use Cucumber, Mocha and Selenium to write E2E, integration, unit and UI tests
* Build stateless APIs using Express and Elasticsearch
* Document your API using OpenAPI and Swagger
* Build and bundle front-end applications using React, Redux and Webpack



## Instructions and Navigations

All of the code is organized into folders. For example, Chapter02.

The code will look like the following:

```javascript
function errorHandler(err, req, res, next) {
  ...
}

export default errorHandler;
```

**Following is what you need for this book:**
Copy and paste the Audience section from the EPIC.

With the following software and hardware list you can run all code files present in the book (Chapter 1-20).

### Software and Hardware List

| Chapter  | Software required                                                        | OS required                        |
| -------- | -------------------------------------------------------------------------| -----------------------------------|
| 3        | Node.js® (Any, preferably latest LTS, which is currently 8.11.4)         | Linux (preferably Ubuntu)          |
| 4        | Node.js® (Any, preferably latest LTS, which is currently 8.11.4)         | Linux (preferably Ubuntu)          |
| 5        | Git (Any, preferably 2.18.0+)                                            | Linux (preferably Ubuntu)          |
| 6        | Various NPM packages                                                     | Linux (preferably Ubuntu)          |
| 7        | Cucumber.js (4.2.1+)Google Chrome Browser(latest,currently 68.0.3440.106)|                                    |
|          | Visual Studio Code(latest, currently 1.26) Java(latest, currently 10.0.2)|                                    |
|          |Elasticsearch (latest, currently 6.4.0) Bash (shell) (latest v4 and above,|                                    |
|          |currently 4.4.19. DO NOT USE v3) Various NPM packages                     | Linux (preferably Ubuntu)          |
| 8        | Various NPM packages Mocha (latest, currently 5.2.0)                     | Linux (preferably Ubuntu)          |
| 9        | DigitalOcean account (N/A) Namecheap(N/A) NGINX(latest, currently 1.15.2)|                                    |
| 10       | Travis CI (N/A) GitHub (N/A) Jenkins (latest v2+, currently 2.121.3)     | Linux (preferably Ubuntu)          |
| 12       | Swagger Node NPM package (latest, currently 0.7.5)                       | Linux (preferably Ubuntu)          |
| 13       |React(latest,atleast 15+,currently 16.4.2)Webpack(latest,currently,4.17.1)| Linux (preferably Ubuntu)         |
| 14       | Selenium (v4+) React Router (v4+, currently 4.3.1)                       | Linux (preferably Ubuntu)          |
| 15       | Redux (v4+, currently 4.0.0)                                             | Linux (preferably Ubuntu)          |
| 16       | Docker (latest, currently 18.03)                                         | Linux (preferably Ubuntu)          |
| 17       |DigitalOcean Kubernetes Minikube (latest, currently 0.28.2)               | Linux (preferably Ubuntu)          |


### Related products <Other books you may enjoy>
* Full-Stack React Projects [[Packt]](https://www.packtpub.com/web-development/full-stack-react-projects?utm_source=github&utm_medium=repository&utm_campaign=9781788835534) [[Amazon]](https://www.amazon.com/dp/1788835530)

* React Cookbook [[Packt]](https://www.packtpub.com/web-development/react-cookbook?utm_source=github&utm_medium=repository&utm_campaign=9781783980727) [[Amazon]](https://www.amazon.com/dp/1783980729)

## Get to Know the Author
**Daniel Li**
is a full-stack JavaScript developer at Nexmo. Previously, he was also the Managing Director of Brew, a digital agency in Hong Kong that specializes in MeteorJS.

A proponent of knowledge-sharing and open source, Daniel has written over 100 blog posts and in-depth tutorials, helping hundreds of thousands of readers navigate the world of JavaScript and the web.


### Suggestions and Feedback
[Click here](https://docs.google.com/forms/d/e/1FAIpQLSdy7dATC6QmEL81FIUuymZ0Wy9vH1jHkvpY57OiMeKGqib_Ow/viewform) if you have any feedback or suggestions.

##  Chapter 19 Important Concepts in JavaScript 
[Click here](https://www.packtpub.com/sites/default/files/downloads/ImportantConceptsinJavaScript.pdf) 

Our application is going to be written in JavaScript, but there are many versions of JavaScript. These versions are formalized by Ecma International (formerly the European Computer Manufacturers Association (ECMA)), and are actually
called ECMAScript. So the term "JavaScript" is a collective term for all of these different ECMAScript versions. Below, you'll find a table enumerating each version,alongside its release date:

| ECMAScript version        | Release year   |
| --------------------------| ---------------|
| 1                         | 1997           |
| 2                         | 1998           |
| 3                         | 1999           |
| 4                         |(never released)|
| 5                         | 2009           |
| 6                         | 2015           |
| 7                         | 2016           |
| 8                         | 2017           |
| 9                         | 2018           |

In other words, from 1999 to 2009, when developers were writing JavaScript they were actually writing in ECMAScript 3.

JavaScript was originally developed by Brendan Eich in 10 days! He wrote it for the Netscape Navigator browser. It was originally called Mocha, and this was changed to LiveScript, before finally settling on JavaScript. In 1996, Netscape submitted JavaScript to ECMA to be standardized as ECMAScript. 

Other companies created similar languages; Microsoft created VBSCript and JScript, while Macromedia (now Adobe) created ActionScript.

In this book, we will be using features up to ECMAScript 2018 (a.k.a. ES9). These newer standards introduced new concepts, such as classes, and provided a cleaner syntax, such as arrow functions. Many developers use these features without understanding what they are or how they work. This chapter will explain in depth some of the most important concepts in JavaScript.

We will focus on three topics:

* Clarifying different data types in JavaScript.
* How inheritance works in JavaScript.
* Determining the current context in any piece of code.

### Clarifying data types

In JavaScript, there are six primitive data types and one object type. The six primitive types are null, undefined, Boolean (true/false), number, string, and symbol. The object type is simply a key-value store:

```javascript
const object = {
 key: "value"
}
```

To look at this from another angle, everything that is not a primitive type is an object.
This means functions and arrays are both special types of object:

```javascript
// Primitive types
true instanceof Object; // false
null instanceof Object; // false
undefined instanceof Object; // false
0 instanceof Object; // false
'bar' instanceof Object; // false
Symbol('foo') instanceof Object; // false

// Non-primitive types
(function () {}) instanceof Object; // true
[] instanceof Object; // true
({}) instanceof Object // true
```

If you are not familiar with JavaScript's data types, take a look at the MDN Web Docs on JavaScript data types and data structures(developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures ).

#### Primitives versus objects

So, what are the differences between primitives and objects? There are three main
differences:
* Primitives are stored and compared by value; objects are stored and compared by reference:

```javascript
42 === 42; // true
"foo" === "foo"; // true
{} === {}; // false
[] === []; // false
(function () {}) === (function () {}); // false
```
Here, the value of the number 42 is simply 42. However, the value of {} is actually a reference to the object, not the object itself. When we create two empty object literals, they are considered as two different objects, both with
their own unique reference.

* Primitives cannot not have methods or properties, whereas objects can:

```javascript
const answer = 42
answer.foo = "bar";
answer.foo; // undefined
```

* As an extension of these points, objects are mutable, so you can add,
change, or remove properties and methods from them.

```javascript
const foo = {};
foo.bar = "baz";
foo; // { bar: "baz" }
```

* On the contrary, primitives are immutable; you cannot change the number 42 to anything else without it being a different number. When you do perform an operation on a primitive (multiplying a number or adding characters to a string), a new primitive value is created; the original value remains unchanged.

Under the hood, when you instantiate a new primitive, a section of memory is allocated to the primitive. For example, when we define the string "foo", a small portion of the memory with the address A is allocated to store the string. When we perform an operation on it, appending "bar" to it, for example, a new string, "foobar", is created with a different address, B. The original "foo" is not altered.



## Chapter 20 JavaScript Syntax
[Click here](https://www.packtpub.com/sites/default/files/downloads/WritinginECMAScript2015.pdf) 


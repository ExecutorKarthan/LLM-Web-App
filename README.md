# LLM-Web-App
This is an educational tool designed to support students from 6th grade and older to demonstrate the benefits, drawbacks, and ethical issues surrounding using large language models (LLMs). It is strictly for educational use, specifically as a demonstration of AI's capabilities. This app is deployed via Render and can be viewed here [https://llm-web-app-4970.onrender.com/] (https://llm-web-app-4970.onrender.com/)

## Table of Contents
1. [Description](#description)
    - [Language and Library Rational](#language-and-library-rational)
    - [Frontend Design and Orientation](#app-orientation)
    - [Backend Design and Orientation](#django-server)
2. [Installation](#installation)
5. [License](#license)
6. [Contributing](#contributing)
7. [Tests](#tests)
8. [Questions](#questions)

## Description
### Language and Library Rational
This particular application has several moving parts to its operation. We will begin with its base structure: a React page written in TypeScript. I chose to use React as it is a modern framework that is well supported with documentation and numerous libraries. React is written in JavaScript and its variations, such as TypeScript in this case, allowing for an app that would easy to update as the State variables changed. React also allows the app to be scalable and be device-responsive without a heavy reliance on Cascading Style Sheets (CSS). Documentation on React and how it works can be found here: [https://react.dev/](https://react.dev/).

The app is written in TypeScript as a way for me to impose more strict typing requirements on JavaScript - a non-type safe language. TypeScript requires any variable declaration to have a type associated with, much like Java or C-based languages require type prefixes. This would allow me to be aware of variable type conflicts prior to running and deployment, resulting in more intentional code design. More on TypScript can be found here: [https://www.typescriptlang.org/](https://www.typescriptlang.org/).

The app utilizes Google's Gemini API to send queries to and receive replies from Gemini. The app needed access to some style of LLM and Gemini was chosen due to its easy access to a free tier operations. There are numerous models of Gemini, each with their own limits in terms of character count and number of requests per day, so the app will change which model it queries depending on model availability and if its limits are exceeded. The Gemini API documentation can be found here: [https://ai.google.dev/gemini-api/docs] (https://ai.google.dev/gemini-api/docs)

 Due to its reliance on Gemini, the app requires the user to have a valid Gemini API key. These can be gotten free of charge here: ["https://makersuite.google.com/app/apikey"] (https://makersuite.google.com/app/apikey)  

 The app also needs to allow the user to write and execute code in Python. This is done through the use of the Monaco Editor [https://microsoft.github.io/monaco-editor/] (https://microsoft.github.io/monaco-editor/) and a Skulpt Display [https://skulpt.org/] (https://skulpt.org/). Monaco is a module that will create editor objects in React that serves as an IDE-like text environment, making it user friendly to use. Skulpt is a module that compiles Python into Javascript, thus taking the inputted Python code into a Javascript form that can be run in the web-browser. 

### App Orientation
The first page of the app is a "splashgate" that prevents users from interacting with the main page until two points of data are collected. Firstly, the terms and conditions of the app must be agreed to. This app is meant for educational use only, with the intention that the educator will use it as a demonstration for their class to be guided through. At this time, many LLMs require their users to be 18 years old or older to use them. As a result, the user needs to agree that they meet and will follow the Gemini agreement criteria or they cannot use the app.

Secondly, any interaction with an LLM in this app requires an API key. This API key is also required for access beyond the splashgate. This key is not as required as the agreement to the terms and conditions, since a non-functional key will result in an LLM return error - so access to the LLM would still be barred. **Please Note - ** The API key is currently saved in a state variable in the React frontend. This posses somewhat of a security risk on unsecured networks as the API key can detected 

### Django Server





## Installation
This project require no installation. It is a webpage that is deployed to Netlify and be located online. It just needs to be viewed on the web.

## License
This product is protected by a [MIT License](http://choosealicense.com/licenses/mit), specifically:
MIT License

Copyright (c) [2025] [Joseph Alexander Messina]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Contributing
I, Alex Messina, am the primary author of this code. Its layout and interface was designed by me with suggestions and feedback provided by the members of the Washington University - ADD LAB. The interface is supported by Ant Design [https://ant.design/](https://ant.design/) and its LLm interactions are handled by Google's large language Gemini models through their API [https://ai.google.dev/gemini-api/docs](https://ai.google.dev/gemini-api/docs). 
 

## Tests
No tests were prepared for this project. Errant behavior can be seen in console and visibly since it is a front-end application.

## Questions
My GitHub username is [ExecutorKarthan](https://github.com/ExecutorKarthan) and this project can be found at [https://llm-web-app-4970.onrender.com/] (https://llm-web-app-4970.onrender.com/)

If you have questions or concerns about this project, please email me at me@alexmessina.dev
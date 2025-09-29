# Node.js + NextJS + React + TypeScript example project

## How to develop

1. Run `npm install`, which installs the necessary npm libraries
2. Run `npm run dev`, which run the app
3. You'll find the app running in `http://localhost:3000`

## What to do

Basically there is a large number of sentiment answers from six large publicly listed companies in Finland. The answers were given between November 2018 and January 2021. Also the project has a simple NextJS server setup, which consists of a frontend app and some initial backend routes. The backend routes implemented in the pages/api folder are:

- `http://localhost:3000/api/answers` (Please note that there is a total of 47502 answers, opening that with a browser can be problematic, when going through the data, please use a subset instead: `http://localhost:3000/api/answers?start=2021-01-15`)
- `http://localhost:3000/api/companies`
- `http://localhost:3000/api/users`
- `http://localhost:3000/api/score/[companyIsin]` it also takes an optional parameter with the date like: `http://localhost:3000/api/score/FI0009005987?date=2021-01-01`

There's also a quick example in the `pages/index.tsx` file how to use some of those routes.

### The task

Basically you can do anything you want around the given dataset of the sentiment answers. We hope that you can develop a solution, that would be valuable to users. End-users of this solution could for example be investors, who’d like to understand better how a company / companies are seen by others.

Some ideas:

- Dashboard that shows sentiment score of all the six companies by given date.
- Dashboard that dives deeper in the sentiment score of a single company. For instance you can plot the sentiment score of a company to a graph of some sort. Please note that there is a simple example how the score can be calculated at a given date in /pages/api/score. You do not need to use that algorithm or endpoint, but it's an example worth checking out
- Dashboard that dives deeper in the answers per user.
- Something completely different

If you find the actual answers too hard to use, you can just mock data or use your own data and build some sort of dashboard with imaginary data.

Basically, you can do anything and change everything in this repo. Every line of code is an initial suggestion – as in real life, some suggestions might be bad.

Suggested maximum time for this task is 4 hours, but you can do less as well. What we appreciate is reflection on your solution: Are there some shortcuts or issues you noticed but didn’t fix? Or what would be your suggested improvements if you spent more time on it?

## Few words about NextJS

NextJS is basically an alternative for using create-react-app. But it does a few extra things that come in handy when developing web apps.

For instance, routing of the app is super simple. Just add a react component in the /pages folder and it will serve it. For instance, if you create pages/about.tsx that exports a React component, it will be accessible at /about. Also you can have the backend implemented in the /pages/api folder. Please see the /pages folder in this project to see a real-word example.

### How to start a NextJS project app

Basic NextJS app (like this project) can be created like this:

1. Initialize npm by running `npm init`. This basically creates a package.json file.
2. Install the necessary packages by running `npm install --save next react react-dom`
3. Add the `pages` folder and add an index.js or index.tsx (for TypeScript) file.
4. Add these scripts to the `package.json`:

```
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start"
}
```

5. If you use TypeScript, you should also add TS related packages by running `npm install --save-dev typescript @types/react @types/node`

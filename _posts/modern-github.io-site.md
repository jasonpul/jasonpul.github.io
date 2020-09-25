---
title: 'Build a Modern GitHub Page Site Using Next.js'
description: 'A guide to build a GitHub Page blog using Next.js, complete with markdown and code block highlighting'
date: 2020-09-25
---

## Background

I recently decided to start a tech blog that would be hosted as a static site using GitHub Pages. I had previously seen that these static sites could be generated with Jekyll. But I don’t know Jekyll and don’t have any experience with Ruby. So I did some research into if React could be used and that's how I found [Next.js](https://nextjs.org/). I read through a lot of Next.js tutorials but couldn't find exactly what I was looking for. I wanted a site that could render GitHub style markdown as well as highlight code blocks. It took me a day to figure out how to implement everything and I thought other people might be interested in the same features. So I put together this guide that is a combination of what I learned and the tutorials from [CSS-Tricks](https://css-tricks.com/building-a-blog-with-next-js/), [Perry Raskin](https://raskin.me/blog/beautify-code-in-your-next-js-blog), and [Jose Felix] (https://dev.to/jfelx/how-to-make-a-static-blog-with-next-js-2bd6). This guide will be for a very basic site. I'll add another post that will address more features such as SEO at a later time.

## Initial Setup

To start off, we’ll use Next.js’s app boilerplate to generate an initial project

```sh
npx create-next-app <blog name> --use-npm
```

Once the script is complete, _cd_ into the project directory. You'll be able to see the boilerplate app at [http://localhost:3000](http://localhost:3000) after running

```sh
npm run dev
```

We'll need a few packages for the features we want so go ahead and install the required dependencies using

```sh
npm install --save-dev raw-loader gray-matter react-markdown react-syntax-highlighter
```

### raw-loader

[raw-loader](https://www.npmjs.com/package/raw-loader) allows us to import text files as if they were a module using the ES6 import statement

### gray-matter

[gray-matter](https://www.npmjs.com/package/gray-matter) is used to parse the front-matter information in your markdown files

### react-markdown

[react-markdown](https://www.npmjs.com/package/react-markdown) converts markdown files into html

### react-syntax-highlighter

[react-syntax-highlighter](https://www.npmjs.com/package/react-syntax-highlighter) is used as a code block renderer within react-markdown to highlight code blocks

## Create the Static Site

Next.js uses React behind the scenes to render pages. Each React file inside the _/pages_ folder will be rendered as a static page. For example, _/pages/about.js_ will be rendered at _/about_ and _/pages/blog/first-post.js_ at _/blog/first-post_. The only exception is _index.js_, which will be rendered at _/_. Next.js can also handle dynamic routing using slugs and a _\[slug\].js_ component. It will also route you to a default 404 page for non-existent components.

The entry point for Next.js is _/pages/index.js_. You can modify the JSX within it and you'll see Next.js takes care of hot reloading the page with updates. Let's start by deleting _/pages/api_ and simpliflying _Home_ with a placeholder:

#### /pages/index.js

```jsx
// import Head from 'next/head'
// import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div>
      <h1>hello</h1>
    </div>
  )
}
```

next let's create two blog posts and place them inside of _\_posts_ at your project's root directory

#### /\_posts/first-post.md

```md
---
title: First Post
description: Sample First Post
date: 2020-09-24
---

# Header 1

## Header 2

### Header 3

#### header 4

## Table of Contents

- Implements [GitHub Flavored Markdown](https://github.github.com/gfm/)
- Renders actual, "native" React DOM elements
- Allows you to escape or skip HTML (try toggling the checkboxes above)
- If you escape or skip the HTML, no `dangerouslySetInnerHTML` is used! Yay!

## HTML block below

> This blockquote will change based on the HTML settings above.

## Tables?

| Feature   | Support |
| --------- | ------- |
| tables    | ✔       |
| alignment | ✔       |
| wewt      | ✔       |
```

#### /\_posts/second-post.md

````md
---
title: Second Post
description: Sample Second Post
date: 2020-09-25
---

## Python code block

```python
import numpy as np

def hello():
    print('this is working')
```

## JS code block

```js
import React from 'react'
console.log('this is working')
```
````

We'll create two api functions for our app. The first function will find all markdown files in _\_posts_ and return an object with its front-matter information. The second function will return the contents of a markdown file given its file slug.

#### /api.js

```js
import matter from 'gray-matter'

export const getAllPosts = async () => {
  const context = require.context('./_posts', false, /\.md$/)
  const posts = []
  for (const path of context.keys()) {
    const fileName = path.slice(2)
    const post = await import(`./_posts/${fileName}`)
    const content = matter(post.default)
    posts.push({
      slug: fileName.replace('.md', ''),
      title: content.data.title,
      description: content.data.description,
    })
  }
  return posts
}

export const getPostBySlug = async (slug) => {
  const post = await import(`./_posts/${slug}.md`)
  const content = matter(post.default)
  content.data.date = content.data.date.toString()
  return {
    data: content.data,
    content: content.content,
  }
}
```

Both functions will import the markdown files using the ES6 import style. For this to work correctly, we'll need to tell Next.js to use raw-loader on the files. This is done with a configuration file. You may need to restart your Next.js development server to ensure this configuration is set. Just to be safe, ctrl+c and restart your dev server.

#### /next.config.js

```js
module.exports = {
  target: 'serverless',
  webpack: function (config) {
    config.module.rules.push({test: /\.md$/, use: 'raw-loader'})
    return config
  },
}
```

We want an array of all posts every time _index.js_ is loaded in order to list them. We can get this by adding the below code to _index.js_. Next.js runs it every time _index.js_ is loaded and passes props to _index.js_'s default function.

#### /pages/index.js

```js
export const getStaticProps = async (context) => {
  const posts = await getAllPosts()
  return {
    props: {
      posts: posts,
    },
  }
}
```

Let's go back to _Home_ and modify it now that we're getting an array of all available posts. We'll display each post's title as a link in an unordered list:

#### /pages/index.js

```
import Link from 'next/link'
import {getAllPosts} from '../api'

export default function Home({posts}) {
  return (
    <div>
      <ul>
        {posts.map((post, i) => {
          return (
            <li key={i}>
              <Link href={'/blog/[slug]'} as={`/blog/${post.slug}`}>
                <a>{post.title}</a>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export const getStaticProps = async (context) => {
  const posts = await getAllPosts()
  return {
    props: {
      posts: posts,
    },
  }
}

```

With this you should see a list of your two posts now. They might not look like a typical link though. This is because of Next.js's default css. You can either turn off the entire css by commenting out the import in _/pages/\_app.js_ or commenting out the _a_ tag css in _/styles/globals.css_.

Clicking on the link will result in a 404 route. Let's fix that with dynamic routing. Create a dynamic component with the following code

#### pages/blog/\[slug\].js

```jsx
import {getPostBySlug, getAllPosts} from '../../api'
import ReactMarkdown from 'react-markdown'

const Post = ({data, content}) => {
  return (
    <div className="container">
      <div className="Post">
        <ReactMarkdown source={content} />
      </div>
    </div>
  )
}

export const getStaticProps = async (context) => {
  return {
    props: await getPostBySlug(context.params.slug),
  }
}

export const getStaticPaths = async () => {
  let paths = await getAllPosts()
  paths = paths.map((post) => ({
    params: {slug: post.slug},
  }))
  return {
    paths: paths,
    fallback: false,
  }
}

export default Post
```

_getStaticPaths_ is run first by Next.js and it uses _getAllPosts_ to define a list of paths that have to be rendered to HTML at build time. _getStaticProps_ is then run by Next.js to generate dynamic props that are passed to the file's default component. It find's the dynamic route's slug, and executes _getPostBySlug_ to pass _Post_ the post's data as a prop. That data is the raw post file in string form. Within _Post_ that raw markdown is converted into nicely formatted HTML using _react-markdown_. With the _\[slug\].js_ file created, you should be able to click each link and see your sample posts rendered with HTML.

If you take a look at _post-one_ you'll notice that it's now rendered in HTML but it's not nicely styled the way GitHub handles markdown. If you want the styling to be similar to GitHub, you'll need to install _github-markdown.css_

```sh
npm install github-markdown-css
```

Next you'll need to import the stylesheet globally. This is done in _/pages/\_app.js_.

#### /pages/\_app.js

```jsx
import 'github-markdown-css/github-markdown.css'

function MyApp({Component, pageProps}) {
  return <Component {...pageProps} />
}

export default MyApp
```

And one last thing. The styles provided by _github-markdown-css_ target only elements within a _markdown-body_ class. So go back to _\[slug\].js_ and add a classname to the _Reactmarkdown_ component

```jsx
<ReactMarkdown source={content} className="markdown-body" />
```

Now if you refresh the page, you'll notice a nicely rendered, GitHub style page. However, if you check out _second-post_, you'll see that the codeblocks don't look great. The blocks aren't highlighting the code. Let's take care of that.

Back in _\[slug\].js_, we'll need to do a few imports. I'll be using [highlight.js](https://www.npmjs.com/package/highlight.js) but you can use [Prism](https://www.npmjs.com/package/prismjs) if you like. You'll also have to decide on a styling theme. Thankfully, the _react-syntax-highlighter_ team have created a awesome [demo site](https://react-syntax-highlighter.github.io/react-syntax-highlighter/demo/) where you can try out different themes to see what you like. Just select your desired syntax highlighter (_highlight.js_ or _Prism_) then scroll through the different themes until you find something you like. I'll go with the _github_ style for this guide:

```jsx
//using highlight.js
import {Light as SyntaxHighlighter} from 'react-syntax-highlighter'
const github = require('react-syntax-highlighter/dist/cjs/styles/hljs/github')
  .default

//using Prism
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
const github = require('react-syntax-highlighter/dist/cjs/styles/prism/github')
  .default
```

After importing those libraries, you'll need to make a code block component and pass that to _ReactMarkdown_ as a renderers prop. You're final _\[slug\].js_ should look like this

#### /pages/blog/\[slug\].js

```jsx
import {getPostBySlug, getAllPosts} from '../../api'
import ReactMarkdown from 'react-markdown'
import {Light as SyntaxHighlighter} from 'react-syntax-highlighter'
const github = require('react-syntax-highlighter/dist/cjs/styles/hljs/github')
  .default

const CodeBlock = ({language, value}) => {
  return (
    <SyntaxHighlighter language={language} style={github}>
      {value}
    </SyntaxHighlighter>
  )
}

const Post = ({data, content}) => {
  return (
    <div className="container">
      <div className="Post">
        <ReactMarkdown
          source={content}
          className="markdown-body"
          renderers={{code: CodeBlock}}
        />
      </div>
    </div>
  )
}

export const getStaticProps = async (context) => {
  console.log('generate static props')
  console.log(context)
  return {
    props: await getPostBySlug(context.params.slug),
  }
}

export const getStaticPaths = async () => {
  console.log('generate static paths')
  let paths = await getAllPosts()
  paths = paths.map((post) => ({
    params: {slug: post.slug},
  }))
  console.log(paths)
  return {
    paths: paths,
    fallback: false,
  }
}

export default Post
```

With that update, we've completed writing the static site. You can now add posts in markdown format to _/\_posts_ and your site will dynamically generate links as well as render them into great looking HTML pages. Now we just need to deploy the necessary files to GitHub.

## Deploying to GitHub

I'm assuming you're familiar with how to push repositories to GitHub. So I won't be going over that. There are requirements on repository names, so please checkout[ GitHub Pages](https://pages.github.com/) if you don't already have one setup. The following steps assume that you have set up a GitHub Page repo and have added its link as a remote repository to your local project.

Open up _package.json_ and add _"export": "next export -o docs"_ to the _scripts_ object. This will tell Next.js to export your project into static files within the _/docs_ directory. Now, run the following commands

```sh
npm run build
npm run export
```

After the export is complete, you'll need to add a blank _.nojekyll_ file within the _/docs_ directory. This is because by default _Jekyll_ ignores any folder with a leading underscore. But we're not using _Jekyll_ here and we'll need those leading underscore directories. Finally you'll need to add, commit and push changes to your GitHub repository. With the push finished, you can go to GitHub and change the _Source_ directory of your GitHub Page to _docs_ using this [guide](https://docs.github.com/en/github/working-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site). And that's it. It might take a minute for your page to go live, but you have a framework for a blog now.

## Non-Personal GitHub Page

If you're building a GitHub Page for one of your repos, you'll probably run into problems with page dependencies. Check out this guide by [Mikhail Bashurov](https://itnext.io/next-js-app-on-github-pages-768020f2b65e) to see how to solve that.

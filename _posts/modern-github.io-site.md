---
title: 'Build a Modern Github Page Site Using Next.js'
description: 'A guide to build a GitHub Page blog using Next.js, complete with markdown and code block highlighting'
date: 2020-06-25
---

## Background

I recently decided to start a tech blog that would be hosted as a static site using GitHub Pages. I had previously seen that these static sites could be generated with Jekyll. But I don’t know Jekyll and don’t have any experience with Ruby. So I did some research into if React could be used and that's how I found [Next.js](https://nextjs.org/). I read through a lot of Next.js tutorials but couldn't find exactly what I was looking for. I wanted a site that could render GitHub style markdown as well as highlight code blocks. It took me a day to figure out how to implement everything and I thought other people might be interested in the same features. So I put together this guide that is a combination of what I learned and the tutorials from [CSS-Tricks](https://css-tricks.com/building-a-blog-with-next-js/), [Perry Raskin](https://raskin.me/blog/beautify-code-in-your-next-js-blog), and [Jose Felix] (https://dev.to/jfelx/how-to-make-a-static-blog-with-next-js-2bd6). This guide will be for a very basic site. I'll add another post for that will address more features such as SEO at a later time.

## Initial Setup

To start off, we’ll use Next.js’s boiler app boilerplate to generate an initial project

```sh
npx create-next-app <blog name> --use-npm
```

Once the script is complete, `cd` into the project directory. You'll be able to see the boilerplate app at [http://localhost:3000](http://localhost:3000) after running

```sh
npm run dev
```

We'll need a few packages for the features we want so go ahead and install the required dependencies using

```sh
npm install --save-dev raw-loader gray-matter react-markdown react-syntax-highlighter
```

### raw-loader

[raw-loader](https://www.npmjs.com/package/raw-loader) allows for importing files as a string (like importing a library) using the ES6 import statement

### gray-matter

[gray-matter](https://www.npmjs.com/package/gray-matter) is used to parse the front-matter information in your markdown files

### react-markdown

[react-markdown](https://www.npmjs.com/package/react-markdown) converts markdown files into html

### react-syntax-highlighter

[react-syntax-highlighter](https://www.npmjs.com/package/react-syntax-highlighter) is used as a code renderer within react-markdown to highlight code blocks

## Start Customizing

Next.js uses React behind the scenes to render pages. Each React file inside the `pages` folder will be rendered as a static page. For example, `pages/about.js` will be rendered at `/about` and `pages/blog/first-post.js` at `/blog/first-post`. The only exception is `index.js`, which will be rendered at `/`. Next.js can also handle dynamic routing using slugs and a `\[slug\].js` component. It will also route you to a default 404 page for non-existant components.

The entry point for Next.js is `pages/index.js`. You can modify the JSX within it and you'll see Next.js takes care of hot reloading the page with updates. Let's start by deleting `pages/api` and simpliflying `Home` with a placeholder:

#### `pages/index.js`

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

next let's create two blog posts and place them inside of `_posts` at your project's root directory

#### `_posts/first-post.md`

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

<blockquote>
  This blockquote will change based on the HTML settings above.
</blockquote>

## Tables?

| Feature   | Support |
| --------- | ------- |
| tables    | ✔       |
| alignment | ✔       |
| wewt      | ✔       |
```

#### `_posts/second-post.md`

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

### API

We'll create api functions for our app. The first will find all markdown files in `_posts` and return an object with it's front-matter information. The second will return the contents of a markdown file given it's file slug.

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

Both funcitons will import the markdown files ES6 import style. For this to work correctly, we'll need to tell Next.js to use raw-loader on the files. This is done using a configuration file. You made need to restart your Next development server to ensure this configuraiton is set. Just to make sure, ctrl+c and restart your dev server.

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

We want an array of all posts everytime `index.js` is loaded. We can get this by adding the below code to `index.js`. Next.js runs it every time `index.js` is loaded and passes props to `index.js`'s default function.

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

Let's go back to `Home` and modify it now that we're getting an array of all available posts. We'll display each post's title as a link in an unordered list:

#### pages/index.js

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

With this you should see a list of your two posts now. They might not look like a typical link though. This is because of Next.js's default css. You can either turn off the entire css by commenting out the import in `/pages/_app.js` of commenting out the a tag css in `styles/globals.css`.

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

`getStaticPaths` is run first by Next.js and it uses `getAllPosts` to define a list of paths that have to be rendered to HTML at build time. `getStaticProps` is then run by Next.js to generate dynamic props that are passed to the file's default component. It find's the dynamic route's slug, and executes `getPostBySlug` to pass `Post` the post's data as a prop. That data is the raw post file in string form. Within `Post` that raw markdown is converted into nicely formated HTML using `react-markdown`. With the `\[slug\].js` file create, you should be able to click each link and see your sample posts rendered with HTML.

If you take a look at `post-one` you'll notice that it's now rendered in HTML but it's not nicely styled the way GitHub handles markdown. If you want the styling to be similar to GitHub, you'll need to install `github-markdown.css`

```sh
npm install github-markdown-css
```

Next you'll need to import the stylesheet globally. This is done in `_app.js`.

```jsx
import 'github-markdown-css/github-markdown.css'

function MyApp({Component, pageProps}) {
  return <Component {...pageProps} />
}

export default MyApp
```

And one last thing. The styles provided by `github-markdown-css` target only elements within a `markdown-body` class. So go back to `\[slug\].js` and add a classname to the `Reactmarkdown` component

```jsx
<ReactMarkdown source={content} className="markdown-body" />
```

Now if you refresh the page, you'll notice a nicely rendered, GitHub style page. However, if you check out `second-post`, you'll see that the codeblocks don't look great. The blocks are highlighting the code. Let's take care of that.

Back in `\[slug\].js`, we'll need to do a few imports. I'll be using [highlight.js](https://www.npmjs.com/package/highlight.js) but you can use [Prism](https://www.npmjs.com/package/prismjs) if you'd like. After that, you'll have to decide on a styling theme. Thankfully, the `react-syntax-highlighter` team have created a awesome (demo site)[https://react-syntax-highlighter.github.io/react-syntax-highlighter/demo/prism.html] where you can try out different themes to see what you like. Just select your desired syntax highliter (`highlight.js` or `Prism`) then scroll through the different themes until you find something you like. I'll go with the `github` style for this guide:

```jsx
//using highlight.js
import {Light as SyntaxHighlighter} from 'react-syntax-highlighter'
import {github} from 'react-syntax-highlighter/dist/cjs/styles/hljs'

//using Prism
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {github} from 'react-syntax-highlighter/dist/cjs/styles/prism'
```

After importing those libraries, you'll need to make a code block component and pass that to `ReactMarkdown` as a runderers prop. You're final \'[slu\g].js' should look like this

#### \[slug\].js

```jsx
import {getPostBySlug, getAllPosts} from '../../api'
import ReactMarkdown from 'react-markdown'
import {Light as SyntaxHighlighter} from 'react-syntax-highlighter'
import {github} from 'react-syntax-highlighter/dist/cjs/styles/hljs'

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

With that update, we've completed writing the static site. You can now add posts in markdown format to `_posts` and your site will dynamically generate links as well as render them into great looking HTML pages. Now we just need to deploy the necessary files to GitHub.

## Deploying to GitHub

I'm assuming you're fimilar with how to push repositories to GitHub. So I won't be going over that. There are requirements on repositiory names, so please checkout[ GitHub Pages](https://pages.github.com/) if you don't already have one setup. The following steps assume that you have setup a GitHub Page repo and have add it's link as a remote repository to your local project.

Open up `package.json` and add `"export": "next export -o docs"` to the `scripts` object. This will tell Next.js to export your project into static files within the `\docs` directory.

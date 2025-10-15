# Ahead of Time Fetch Demo for SPAs

This repo has a few ways to speed up the cold start of SPAs.

## Background

Most Single Page Applications (SPAs) initiate all backend requests from a
static JavaScript file. In those cases, that static file needs to be downloaded
before making API requests. 

But that chain doesn’t have to be sequential. We can concurrently
request static assets and dynamic APIs without server side rendering
(SSR). In this repository we discuss two techniques: Option 1 is
client-initiated, while Option 2 is similar to a server side include (SSI).

- Option 1 is about indicating which APIs we want to preload. 
- Option 2 streams a chunk with only the API data, so there’s no rendering overhead.

<details>
<summary>More details</summary>

By _cold start_ I mean either the initial load, or a version update.

Since static assets can be fully cached, on subsequent (warm) loads this technique
it’s not really needed, but it doesn’t hurt. For long-term caching, the quick
win is versioning static filenames (e.g., `script-<hash>.js`) and serving
them with a cache header with an `immutable` flag, which avoids revalidation:

```
Cache-Control: public,max-age=31536000,immutable
```
</details>

## Option 1
Here we have three alternatives for preloading APIs with
[Links](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/link).
Their performance difference is negligible &mdash; they all start right after
downloading the HTML document. On the other hand, Option 2 has a potential, but
slight, advantage because it can initiate the API call before the HTML is sent. At
any rate, it’s pretty negligible as well because these HTML files are like 1.5 kB.


### Option 1-A: Link Header
Add a `Link` header when sending the HTML document. For example,
if you use Nginx to serve your `index.html`, you can:
```nginx
add_header Link '</api/colors>; rel=preload; as=fetch; crossorigin=use-credentials';
```

### Option 1-B: Add a &lt;link> to your `index.html`
Add a link tag:
```html

<head>
  <link rel="preload" href="/api/colors" as="fetch" crossorigin="use-credentials">
  …
</head>
```

### Option 1-C: Dynamic Inject a &lt;link>
This is similar to 1-B, but it’s injected with an inline script. I use
this option in [my project](https://uxtly.com) because I conditionally
prefetch APIs based on a value in the user’s `localStorage`.

```html
<html>
<head>
  <script>
    preload('/api/colors')

    function preload(url) {
      const link = document.createElement('link')
      link.as = 'fetch'
      link.rel = 'preload'
      link.href = url
      link.crossOrigin = 'use-credentials'
      document.head.appendChild(link)
    }
  </script>
  <link rel="stylesheet" href="goes-after-aot-fetch.css" />
</head>
<body>
</body>
</html>
```


#### Demo

```shell
git clone https://github.com/ericfortis/aot-fetch-demo.git
cd aot-fetch-demo
npm install 

npm run backend
npm run dev # in another terminal 
```

The following screenshots are from a built SPA
because the graphs are cleaner. If you prefer this approach, you can:
```sh
npm run build
npm run backend
```
Then, open http://localhost:2345


#### Without AOT
In this screenshot, we haven’t injected the [inline script](./index-aot-fetch.js), so
you can see that `GET /api/colors` starts only after the SPA is ready.

![](./docs/no-aot.png)

---
<br/>

#### With AOT
![](./docs/aot.png)


---
<br/>

#### Setup (Vite)
Our [vite.config.js](./vite.config.js) has an `htmlPlugin` function
that injects `index-aot-fetch.js` into `index.html`.


#### Setup (Webpack)
This repo doesn’t include a Webpack setup, but you could do it like this:
```js
import HtmlWebpackPlugin from 'html-webpack-plugin'

// config
plugins: [
  new HtmlWebpackPlugin({ templateContent: htmlTemplate() })
]
```

```js
import { readFileSync } from 'node:fs'

export const htmlTemplate = () => `<!DOCTYPE html>
<html>
<head>
  <script>${readAotFetch()}</script>
  <link rel="stylesheet" … />
</head>
<body>
…
</body>
</html>`

function readAotFetch() {
  return readFileSync('./index-aot-fetch.js', 'utf8').trim()
}
```

<hr/>   
<br/>


## Option 2: Data-only Server Side Includes (SSI)

This technique is similar to SSR, but it avoids the rendering overhead.
It just streams the API data, commonly as JSON but not limited to it.

In this demo we stream the `index.html` document it in two parts.
The document as is, and a second chunk with the API response
in a script tag. Then, on the client ([option2/spa.js](option2/spa.js)), we
subscribe to an event that is triggered when the data is loaded.

See the [option2/](./option2) directory, you can run the demo by typing:

```sh
cd option2
./server.js
```

![](docs/streamed-ssi.png)


<br/>


## License

[MIT](LICENSE) © 2025 Eric Fortis



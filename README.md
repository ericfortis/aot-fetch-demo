# Ahead of Time Fetch Demo for SPAs

This repo has a few ways to speed up the cold start of SPAs.

## Background

Single Page Applications (SPAs) initiate backend requests from a static JavaScript file.
Therefore, on the initial load, that file needs to be downloaded before making API requests.

But that chain doesn’t have to be sequential. There are two main options for requesting
static assets and dynamic APIs concurrently on SPAs, without server-side rendering.

Option 1 is browser-based, while Option 2 is server side. Option 1 is about indicating
which APIs we could preload. Option 2 streams a chunk with the critical API data.
We stream a JSON chunk, but any other format would work as well.


## Option 1-A: Link Header
Add a `Link` header when sending the HTML document. For example,
if you use Nginx to serve your `index.html`, you can:
```nginx
add_header Link '</api/colors>; rel=preload; as=fetch; crossorigin=use-credentials';
```

## Option 1-B: Add a  &lt;link> to your `index.html`
Hardcode a link tag: 
```html
<head>
  <link rel="preload" href="/api/colors" as="fetch" crossorigin="use-credentials">
  …
</head>
```

## Option 1-C: Dynamic Inject a &lt;link>
This is similar to 1-B, but it’s injected with inline JavaScript. I use
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


### Demo

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


### Without AOT
In this screenshot, we haven’t injected the [inline script](./index-aot-fetch.js), so
you can see that `GET /api/colors` starts only after the SPA is ready.

![](./docs/no-aot.png)

---
<br/>

### With AOT
![](./docs/aot.png)


---
<br/>

### Setup (Vite)
Our [vite.config.js](./vite.config.js) has an `htmlPlugin` function
that injects `index-aot-fetch.js` into `index.html`.


### Setup (Webpack)
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

## Option 2: Server-Side Include (SSI)
When serving the HTML document, you could stream it in two parts.
The document as is, and a second chunk with e.g., the JSON payload 
in a script tag. Then, on the client, [option2/spa.js](option2/spa.js), we
subscribe to an event that is triggered when the data is loaded.

See [option2/](./option2) directory:

```sh
cd option2
./server.js
```

![](docs/streamed-ssi.png)


<br/>


## License

[MIT](LICENSE) © 2025 Eric Fortis



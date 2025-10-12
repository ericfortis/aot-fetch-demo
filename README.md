# Ahead of Time Fetch Demo for SPAs

Single Page Applications (SPAs) have a reputation for being slow. On the first load
(or when there’s a new version), since the static assets are not cached, the
browser has to download them before they can start fetching data from the backend.

This repo shows a few ways to initiate backend API requests before the static
JavaScript executes, so we can speed up rendering. The three Option 1 variants use
[rel=preload](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/preload),
while Option 2 is similar to SSR but instead of rendering HTML, or serializing the UI, it streams
a second chunk with the JSON from API response.


## Option 1-A: Link Header
Add a `Link` header when sending the HTML document, e.g.:
```
Link: </api/colors>; rel=preload; as=fetch; crossorigin=use-credentials
```

## Option 1-B: &lt;link> in HTML
Add a link tag in the HTML:
```html
<head>
  <link rel="preload" href="/api/colors" as="fetch" crossorigin="use-credentials">
  …
</head>
```

## Option 1-C: Dynamic &lt;link> in HTML
For instance, in [my project](https://uxtly.com) I conditionally
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


[src/App.jsx](./src/App.jsx) has a nicer example with a helper function.


## Background

`<script type="module">` or `<script defer>` don’t block the inline `<script>`.

On the other hand, `<link rel="stylesheet" …>` do block, so they need
to be placed after the AOT inline script.



## Demo

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

## Setup (Vite)
Our [vite.config.js](./vite.config.js) has an `htmlPlugin` function
that injects `index-aot-fetch.js` into `index.html`.


## Setup (Webpack)
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



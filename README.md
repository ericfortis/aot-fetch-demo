# Ahead of Time Fetch Demo

Single page applications (SPAs) have a reputation for being slow.
Particularly on the first load, because they have to download
static assets before they can start fetching data from the backend.

This demo explores a way to initiate backend requests before the static assets are ready.


## TL;DR

Hold a reference to the fetch promises you need in `index.html`
```html
<html>
<head>
  <script type="module" src="index-XcdbPu.js"></script>
</head>
<body>
<script>
  window._aotFetch = {
    '/api/colors': fetch('/api/colors')
  }
</script>
</body>
</html>
```

Then, await that promise in your SPA.

```js
const response = await window._aotFetch['/api/colors']
if (response.ok) 
  setColors(await response.json())
```


[src/App.jsx](./src/App.jsx) has a nicer example with a helper function.


## Background

`<script type="module">` or `<script defer>` don’t block, so the inline
`<script>` we added executes right away.


## Demo

```shell
git clone https://github.com/ericfortis/aot-fetch-demo.git
cd aot-fetch-demo
npm install 

npm run backend
npm run dev # in another terminal 
```

The following screenshots are from a built SPA
because the graphs are cleaner. If you prefer this way you could:
```sh
npm run build
npm run backend
```
Then open http://localhost:2345


### Without AOT
In this screenshot we haven’t injected the [inline script](./index-aot-fetch.js), so
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
This repo doesn’t include a Webpack setup, but you could do it this:
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
<head> … </head>
<body>
  <script>${readAotFetch()}</script>
</body>
</html>`

function readAotFetch() {
  return readFileSync('./index-aof-fetch.js', 'utf8').trim()
}
```


## License

[MIT](LICENSE) © 2025 Eric Fortis



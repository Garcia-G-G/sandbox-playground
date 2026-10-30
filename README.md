# sandbox-playground

## Usage

This repository is a scratch space for trying out ideas. It includes a small Node.js health-check service that you can run and test.

1. Clone it and create a branch for your experiment:

   ```sh
   git clone <repo-url> sandbox-playground
   cd sandbox-playground
   git checkout -b my-experiment
   ```

2. Add your files, commit and open a pull request for review.

Keep each experiment small and self-contained. If one needs setup steps, document them in this README.

## Requirements

Node.js 24+. There are no dependencies to install.

## Run and test

```sh
npm start   # listens on $PORT, or 3000 if PORT is unset or invalid
npm test
```

## API

`GET /health` returns `200` when the service is running:

```sh
curl -i http://localhost:3000/health
```

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"status":"ok"}
```

`GET /panel` returns a self-contained HTML status page (`200`, `Content-Type: text/html; charset=utf-8`). Its CSS and JavaScript are inline and it loads no other assets. In the browser it calls `/health` and shows `ok` or an error in the `#status` element. If the script has not run yet, or JavaScript is disabled, the page shows fallback text instead.

| Method on `/panel` | Response |
| --- | --- |
| `GET` | `200`, the HTML page |
| `HEAD` | `200`, same headers, empty body |
| Any other | `405`, JSON `{"error":"Method Not Allowed"}`, header `Allow: GET, HEAD` |

Open `http://localhost:3000/panel` in a browser to view it.

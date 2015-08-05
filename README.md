# node 版本 web socket server

### 安裝

```sh
$ git clone "http://rde-tech.vir888.com/gogs/rde-tech/js-websocket-server.git"
$ cd js-websocket-server
$ npm install
```

### 啟動 server

```sh
# 唯一參數為埠號
$ ./app.js 8000
```

### Debug

#### 進入 node cli,並取得 debug 實體
```sh
$ node

> var debug = require('debug')
undefined

> debug.listen(8000)
{...
...}

```

#### 對單一 socket 連線傳訊

'xx' 為 sec-websocket-key 轉 sha1 前 2 碼
```sh
> debug.sockets['xx'].sendText('.....')
true
```

#### 廣播

n 為廣播 socket 計數
```sh
> debug.broadcast('...')
broadcast n
```

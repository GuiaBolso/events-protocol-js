# Events Protocol JS

## Como usar

A forma mais simples é atraves do generator `generateFetchEventByName`

```
import client from "@guiabolsobr/events-protocol/client";

const generateEvent = client.generateFetchEventByName({ // configuraçÕes
  hostname: "https://minha-url.com/comparador"
});
const base = generateEvent("test:event", {}, false, {}, "teste");
```

As configurações mais úteis são

```
    hostname = string // no default
    noauthURL = string // default /others
```

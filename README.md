# Events Protocol JS

Esta é uma implementação em javascript que atende aos requisitos do
[Protocolo de eventos](https://github.com/GuiaBolso/events-protocol)

## Como usar

### Client

Basta apenas intanciar um EventClient e enviar um evento.

```ts
import EventsClient from "@guiabolsobr/events-protocol/lib/client";
import { isSuccess } from "src/client/response";

const event = {
    name: "test:event",
    version: 1,
    id: "some-id",
    flowId: "some-flow-id",
    payload: { data: "some data here" },
    identity: {},
    auth: {},
    metadata: {}
};

const client = new EventsClient("https://some.url", {
    defaultTimeout: 5000
});

const response = await client.sendEvent(event);
if (isSuccess(response)) {
    const responseEvent = response.event;
    // faça o que quiser com a resposta do evento aqui
}
```

As configurações mais úteis são

```js
defaultTimeout = 30000;
fetchHandler = fetch;
```

### Servidor

Para utilizar do lado do servidor é necessário dois passos:

O primeiro é registrar a função que deve ser chamada quando receber determinado evento, toda função deve receber e retornar um evento de resposta:
Exemplo:

```js
EventProcessor.addHandler("teste:event", 1, async (event: Event) => {
    return Promise.resolve(buildResponseEventFor(event));
});
```

Para processar o evento, após adicionar o handler basta apenas chamar o processador de evento.
Exemplo:

```js
EventProcessor.processEvent(event);
```

A seguir um exemplo completo de uma Aws Lambda Handler completo:

```js
EventProcessor.addHandler("teste:event", 1, async (event: Event) => {
    //seu codigo aqui
    return Promise.resolve(buildResponseEventFor(event));
});

exports.handler = (event: any): Promise<Event> => {
    return EventProcessor.processEvent(event);
};
```

### Monitoração

A lib já está pronta para usar o _Aws Xray_, basta apenas adicionar uma layer com esta dependência.
Com isso a lib irá gerar esta entrada em cada execução:

```json
"subsegments": [
{
	"id": "891e5565511668ef",
	"name": "NOME_DO_EVENTO:VERSAO_EVENTO",
	"start_time": 1584764490.606,
	"end_time": 1584764490.866,
	"annotations": {
		"Origin": "ORIGIN DO METADATA",
		"FlowID": "FlowID",
		"UserID": "USER_ID do Identity",
		"EventID": "ID"
	}
}]
```

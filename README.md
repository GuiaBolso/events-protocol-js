  

# Events Protocol JS
Esta é uma implementação em javascript que atende aos requisitos do 
[Protocolo de eventos](https://github.com/GuiaBolso/events-protocol)

## Como usar

### Client
A forma mais simples é através do generator `generateFetchEventByName`
```js
import  client  from  "@guiabolsobr/events-protocol/client";

const  generateEvent = client.generateFetchEventByName({ // configuraçÕes
	hostname:  "https://minha-url.com/comparador",
});

const  base = generateEvent("test:event", {}, { isAuthorized:  true, auth: { token:  "my-token" } });
```

As configurações mais úteis são
```js
hostname = string  // no default
noauthURL = string  // default /others
```

### Servidor
Para utilizar do lado do servidor é necessário dois passos:

O primeiro é registrar a função que deve ser chamada quando receber determinado evento, toda função deve receber e retornar um evento de resposta:
Exemplo:
```js
EventProcessor.addHandler("teste:event", 1, async (event: Event) => {
	return  Promise.resolve(buildResponseEventFor(event));
});
```
Para processar o evento, após adicionar o handler basta apenas chamar o processador de evento.
Exemplo:

```js
EventProcessor.processEvent(event)
```

A seguir um exemplo completo de uma Aws Lambda Handler completo:
```js
EventProcessor.addHandler("teste:event", 1, async (event: Event) => {
	//seu codigo aqui
	return  Promise.resolve(buildResponseEventFor(event));
});

exports.handler = (event: any) : Promise<Event> => {
	return  EventProcessor.processEvent(event);
};
```

### Monitoração
A lib já está pronta para usar o *Aws Xray*, basta apenas adicionar uma layer com esta dependência.
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
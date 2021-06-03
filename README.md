# An example Cosmos DB Emulator on Docker on GitHub Codespaces

This is an example of an environment to develop Azure Functions with Cosmos DB Emulator on Docker on GitHub Codespaces.

You can set up the environment on GitHub Codespaces easily by forking this repository and using it.

## How to run the example code

When you open this environment on GitHub Codespaces, you will logged in the `functions` container instance.

Execute commands below, you can run the Azure Functions locally (on GitHub Codespaces).

```bash
cd src/functions
cp local.settings.example.json local.settings.jspn
npm run start
```

Now, you can access to `http://<generated endpoint by GitHub Codespaces>:7071/api/write`. (If you open GitHub Codespaces on Visual Studio Code on your local machine, replace the endpoint to `localhost`.)

Post a request body with a construct like the following to the function endpoint `/api/write`.

```json
{
	"user": {
		"id": "dz"
	},
	"message": "Hooray!"
}
```

Then open Cosmos DB emulator with `http://<generated endpoint by GitHub Codespaces or localhost>:8081/_explorer/index.html`, and you can see the data under `Items` database > `messages` container on the Cosmos DB emulator.

Also, you can start debugging by pressing `F5` button such as Visual Studio Code.

## How it works

There are 2 container instances in this environment.

| Container instances | Description |
|----|----|
| `functions` | An instance to develop Azure Functions with Node.js. This includes Azure Functions Core Tools and Azure Static Web Apps CLI. |
| `cosmos-db-emulator` | An instance of Azure Cosmos DB Emulator on Docker |

From the inside container instance, The Azure Functions Core Tools cannot see the emulator on `localhost`. So it accesses to the emulator using the container name `cosmos-db-emulator` (Docker resolves the name to IP address).

Setting the static IP address by [docker-compose's networks configuration](https://docs.docker.com/compose/compose-file/compose-file-v3/#networks) and specifying the container's IP address to `AZURE_COSMOS_EMULATOR_IP_ADDRESS_OVERRIDE` may be able to solve the problem. But insides GitHub Codespaces, it may not work because the specified address is in use sometimes. (Perhaps, when `AZURE_COSMOS_EMULATOR_ENABLE_DATA_PERSISTENCE` does not set true, the address duplication may not occur. I don't confirm it so far.)

### About accessing via TLS

Cosmos DB Emulator wants to be accessed via TLS, so provide a self-signed certificate.

But we cannot use the certificate from code in this environment due to the reason above. (The certificate seems to be signed as `localhost` by default, so when access using the container name instead of `localhost` code cannot verify with the certificate.)

So in this environment, set `NODE_TLS_REJECT_UNAUTHORIZED=0` and ignore the TLS unauthorized error. (Do not use the setting for production.)

For details, see thse documents.

- https://docs.microsoft.com/en-us/azure/cosmos-db/linux-emulator#my-nodejs-app-is-reporting-a-self-signed-certificate-error
- https://docs.microsoft.com/en-us/azure/cosmos-db/local-emulator?tabs=ssl-nodejs#disable-ssl-validation

### Using Cosmos DB SDK for Node.js instead of binding

If using binding to connect the Cosmos DB Emulator, you might get the following error. This causes by the same reason above. Also, because the binding is written by C#, the `NODE_TLS_REJECT_UNAUTHORIZED` flag cannot help to ignore the unauthorized error.

```
[2021-06-02T04:09:57.022Z] Executed 'Functions.write' (Failed, Id=1c0860fc-94bb-4f6b-b485-17856eb873e6, Duration=253ms)
[2021-06-02T04:09:57.022Z] System.Private.CoreLib: Exception while executing function: Functions.write. System.Net.Http: The SSL connection could not be established, see inner exception. System.Private.CoreLib: The remote certificate is invalid according to the validation procedure.
```

So in this environment, to access from Azure Functions code to Cosmos DB emulator needs using SDK for Node.js instead of binding.

For details of Cosmos DB SDK for Node.js, See below.

- https://www.npmjs.com/package/@azure/cosmos
- https://docs.microsoft.com/en-us/azure/cosmos-db/sql-api-sdk-node

import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { CosmosClient } from "@azure/cosmos"

class Message {
    user: User;
    message: string;
    id?: string;

    constructor(raw: Message) {
        this.user = raw.user;
        this.message = raw.message;
    }
}

interface User {
    id: string;
}

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const client = new CosmosClient({
        endpoint: process.env.COSMOSDB_ENDPOINT,
        key: process.env.COSMOSDB_KEY
    });

    const { database } = await client.databases.createIfNotExists({ id: process.env.COSMOSDB_DATABASE });
    const { container } = await database.containers.createIfNotExists({ id: process.env.COSMOSDB_CONTAINER, partitionKey: process.env.COSMOSDB_PARTITION_KEY })

    const message = new Message(req.body);
    const result = await container.items.create(message);

    context.res = {
        status: result.statusCode,
        body: {
            requestCharge: result.requestCharge,
            savedBody: result.resource
        },
    };
};

export default httpTrigger;
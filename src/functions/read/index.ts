import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { CosmosClient, ItemDefinition } from "@azure/cosmos"
import { Message } from "../core/types/Message"

interface ReadContext extends Context {
    bindingData: ReadContextBindingData;
}

interface ReadContextBindingData {
    partitionKey: string;
    id: string;
}


const httpTrigger: AzureFunction = async function (context: ReadContext, req: HttpRequest): Promise<void> {
    const client = new CosmosClient({
        endpoint: process.env.COSMOSDB_ENDPOINT,
        key: process.env.COSMOSDB_KEY
    });

    const { database } = await client.databases.createIfNotExists({ id: process.env.COSMOSDB_DATABASE });
    const { container } = await database.containers.createIfNotExists({ id: process.env.COSMOSDB_CONTAINER, partitionKey: process.env.COSMOSDB_PARTITION_KEY })

    const data = await container.item(context.bindingData.id, context.bindingData.partitionKey).read();

    context.res = {
        status: data.statusCode,
        body: {
            raw: data.resource,
        },
    };

};

export default httpTrigger;

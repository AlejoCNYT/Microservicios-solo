// serverless/streams/index.js
import { DynamoDBClient, PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuid } from "uuid";
const ddb = new DynamoDBClient({});

export const handler = async (event) => {
  const method = event.requestContext?.http?.method;
  const path = event.requestContext?.http?.path || "";
  const body = event.body ? JSON.parse(event.body) : {};

  if (method === "POST" && path.endsWith("/streams")) {
    const id = uuid();
    await ddb.send(new PutItemCommand({
      TableName: process.env.STREAMS_TABLE,
      Item: { id:{S:id}, name:{S: body.name || ("stream-"+id.slice(0,5)) } }
    }));
    return res(201, {id});
  }

  if (method === "GET" && path.endsWith("/streams")) {
    const out = await ddb.send(new ScanCommand({ TableName: process.env.STREAMS_TABLE, Limit: 50 }));
    return res(200, (out.Items||[]).map(x => ({id:x.id.S, name:x.name.S})));
  }

  return res(404, {error:"not found"});
};

function res(code, body) {
  return { statusCode: code, headers: {"content-type":"application/json"}, body: JSON.stringify(body) };
}

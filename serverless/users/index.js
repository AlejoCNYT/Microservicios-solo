// serverless/users/index.js
import { DynamoDBClient, PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuid } from "uuid";
const ddb = new DynamoDBClient({});

export const handler = async (event) => {
  const method = event.requestContext?.http?.method;
  const path = event.requestContext?.http?.path || "";
  const body = event.body ? JSON.parse(event.body) : {};

  if (method === "POST" && path.endsWith("/users")) {
    const id = uuid();
    await ddb.send(new PutItemCommand({
      TableName: process.env.USERS_TABLE,
      Item: { id:{S:id}, username:{S: body.username || ("user-"+id.slice(0,5)) }, email:{S: body.email || ""} }
    }));
    return res(201, {id});
  }

  if (method === "GET" && path.endsWith("/users")) {
    const out = await ddb.send(new ScanCommand({ TableName: process.env.USERS_TABLE, Limit: 50 }));
    return res(200, (out.Items||[]).map(x => ({id:x.id.S, username:x.username.S, email:x.email.S})));
  }

  return res(404, {error:"not found"});
};

function res(code, body) {
  return { statusCode: code, headers: {"content-type":"application/json"}, body: JSON.stringify(body) };
}

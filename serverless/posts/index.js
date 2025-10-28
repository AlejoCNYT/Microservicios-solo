// serverless/posts/index.js
// Minimal Lambda for Posts (Node.js 18)
import { DynamoDBClient, PutItemCommand, QueryCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuid } from "uuid";

const ddb = new DynamoDBClient({});

export const handler = async (event) => {
  const method = event.requestContext?.http?.method;
  const path = event.requestContext?.http?.path || "";
  const body = event.body ? JSON.parse(event.body) : {};

  if (method === "POST" && path.endsWith("/posts")) {
    if (!body.content || body.content.length > 140) {
      return res(400, {error: "content must be ≤140"});
    }
    const id = uuid();
    await ddb.send(new PutItemCommand({
      TableName: process.env.POSTS_TABLE,
      Item: {
        id: {S:id},
        userId: {S:String(body.userId)},
        streamId:{S:String(body.streamId)},
        content:{S:body.content},
        createdAt:{S:new Date().toISOString()}
      }
    }));
    return res(201, {id});
  }

  if (method === "GET" && /\/streams\/([^/]+)\/posts$/.test(path)) {
    const streamId = path.match(/\/streams\/([^/]+)\/posts$/)[1];
    // simple scan by streamId using a GSI "byStream"
    const out = await ddb.send(new QueryCommand({
      TableName: process.env.POSTS_TABLE,
      IndexName: "byStream",
      KeyConditionExpression: "streamId = :s",
      ExpressionAttributeValues: {":s": {S:String(streamId)} },
      ScanIndexForward: false, Limit: 20
    }));
    return res(200, out.Items?.map(x => ({
      id: x.id.S, streamId: x.streamId.S, userId: x.userId.S, content: x.content.S, createdAt: x.createdAt.S
    })));
  }

  if (method === "GET" && /\/users\/([^/]+)\/posts$/.test(path)) {
    const userId = path.match(/\/users\/([^/]+)\/posts$/)[1];
    const out = await ddb.send(new QueryCommand({
      TableName: process.env.POSTS_TABLE,
      IndexName: "byUser",
      KeyConditionExpression: "userId = :u",
      ExpressionAttributeValues: {":u": {S:String(userId)} },
      ScanIndexForward: false, Limit: 20
    }));
    return res(200, out.Items?.map(x => ({
      id: x.id.S, streamId: x.streamId.S, userId: x.userId.S, content: x.content.S, createdAt: x.createdAt.S
    })));
  }

  return res(404, {error:"not found"});
};

function res(code, body) {
  return { statusCode: code, headers: {"content-type":"application/json"}, body: JSON.stringify(body) };
}

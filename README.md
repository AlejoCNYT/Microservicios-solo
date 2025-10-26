# Microservices Lab – Twitter‑like Stream (Spring Boot → AWS Lambda + API Gateway + Cognito + S3)

> **ES/EN Bilingual README** — Single file you can paste in your repo.

## 🚀 Overview / Resumen
**Goal:** Start with a Spring Boot monolith that lets users publish posts (≤140 chars) in a stream (like Twitter) and then split it into **3 microservices on AWS Lambda** (`users`, `streams`, `posts`) secured with **Cognito (JWT)**. A tiny **JS frontend** is deployed to **S3 Static Website**.

**Deliverables:** GitHub repo, architecture report, test report, and short demo video (everything referenced from this README).

---

## 🧩 Architecture / Arquitectura

**Phase A – Monolith (Spring Boot, H2):**
- Entities: `User`, `StreamTopic`, `Post`.
- Endpoints: 
  - `POST /api/users` (dev helper)
  - `POST /api/streams` (dev helper)
  - `POST /api/posts` (create 140‑char post)
  - `GET  /api/users/{id}/posts`
  - `GET  /api/streams/{id}/posts`

**Phase B – Microservices (AWS Lambda + API Gateway + DynamoDB + Cognito):**
- 3 Lambdas: `users`, `streams`, `posts`. 
- `HTTP API` routes under `/users`, `/streams`, `/posts`.
- Authorizer: **Cognito User Pool** (JWT).
- Persistence: **DynamoDB** tables: `Users`, `Streams`, `Posts` (GSI on `streamId` and `userId`).

```
[Browser (S3 static)] --(JWT)--> [API Gateway + Cognito Authorizer] ---> [Lambda: users|streams|posts] ---> [DynamoDB]
```

---

## 🗂 Repo Layout / Estructura
```
monolith/        # Spring Boot app (H2 for quick dev)
frontend/        # S3 static site (vanilla JS)
serverless/      # 3 Lambda microservices (Node.js 18) + SAM template
README.md
```

---

## 🔧 Local Quickstart (Monolith)
### Windows/macOS/Linux
```bash
# Java 21 + Maven required
cd monolith
mvn spring-boot:run

# Test (Monolith)
# Create user
curl -X POST http://localhost:8080/api/users -H "Content-Type: application/json" -d '{"username":"dan","email":"d@e.com"}'
# Create stream
curl -X POST http://localhost:8080/api/streams -H "Content-Type: application/json" -d '{"name":"general"}'
# Create post (replace ids as returned)
curl -X POST http://localhost:8080/api/posts -H "Content-Type: application/json" -d '{"userId":1,"streamId":1,"content":"hola mundo!"}'
# Read
curl http://localhost:8080/api/streams/1/posts
curl http://localhost:8080/api/users/1/posts
```

---

## 🖥 Frontend (S3 Static Website)
Buildless vanilla JS living in `frontend/`. You can open `index.html` locally against `localhost:8080` or deploy to S3 and point it to the API Gateway URL.

```bash
# Create bucket (replace globally-unique name)
aws s3api create-bucket --bucket <YOUR_S3_BUCKET> --region <REGION> --create-bucket-configuration LocationConstraint=<REGION>
aws s3 website s3://<YOUR_S3_BUCKET>/ --index-document index.html --error-document index.html
aws s3 sync frontend/ s3://<YOUR_S3_BUCKET>/
aws s3api put-bucket-policy --bucket <YOUR_S3_BUCKET> --policy file://serverless/s3-public-policy.json
```

---

## 🔐 Cognito (JWT)
```bash
# User Pool
aws cognito-idp create-user-pool --pool-name stream-pool > serverless/out-user-pool.json
# Fetch IDs
USER_POOL_ID=$(jq -r '.UserPool.Id' serverless/out-user-pool.json)

# App client (no secret, allow USER_PASSWORD_AUTH and implicit code flow for hosted UI)
aws cognito-idp create-user-pool-client \
  --user-pool-id $USER_POOL_ID \
  --client-name stream-client \
  --generate-secret false \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
  --callback-urls "https://<YOUR_S3_WEBSITE_DOMAIN>" \
  --logout-urls "https://<YOUR_S3_WEBSITE_DOMAIN>" \
  > serverless/out-app-client.json

APP_CLIENT_ID=$(jq -r '.UserPoolClient.ClientId' serverless/out-app-client.json)

# Domain for hosted UI (pick a unique prefix)
aws cognito-idp create-user-pool-domain --domain <unique-prefix-stream> --user-pool-id $USER_POOL_ID
```

---

## ☁️ Microservices on Lambda (SAM minimal)
```bash
cd serverless
# (Optional) create DynamoDB tables
aws dynamodb create-table --table-name Users   --attribute-definitions AttributeName=id,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --billing-mode PAY_PER_REQUEST
aws dynamodb create-table --table-name Streams --attribute-definitions AttributeName=id,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --billing-mode PAY_PER_REQUEST
aws dynamodb create-table --table-name Posts   --attribute-definitions AttributeName=id,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --billing-mode PAY_PER_REQUEST

# Build & deploy (SAM)
sam build
sam deploy --guided   # fill: region, stack name, confirm capabilities
```

After deploy, set `API_BASE` in `frontend/app.js` to your API Gateway URL and reload the S3 website.

---

## ✅ Tests / Pruebas (Monolith)
```bash
cd monolith
mvn -q -Dtest=PostControllerTest test
```

---

## 📹 Demo Video Script


---

## 🗓 Suggested Timeline (3 Days)
- **Day 1:** Monolith + frontend working locally; basic tests; README baseline.  
- **Day 2:** Cognito + DynamoDB + Lambdas via SAM; API routes; secure with Authorizer.  
- **Day 3:** Polish UI; video; write architecture & test reports; final README polish.

/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "pictionary",
      removal: "remove",
      home: "aws",
    };
  },
  async run() {
    const stage = $app.stage;
    const appName = $app.name;

    // OpenAI API key
    const openaiApiKey = new sst.Secret("OpenAIApiKey", "sk-proj-1234567890");

    // DynamoDB table for game state
    const gameTable = new sst.aws.Dynamo("GameTable", {
      fields: {
        gameId: "string",
      },
      primaryIndex: { hashKey: "gameId" },
      transform: {
        table: (args) => {
          args.name = `${appName}-${stage}-games`;
        },
      },
    });

    // FastAPI Lambda function
    const apiHandler = new sst.aws.Function("ApiHandler", {
      handler: "functions/src/functions/api.handler",
      runtime: "python3.12",
      link: [openaiApiKey, gameTable],
      timeout: "30 seconds",
      memory: "512 MB",
    });

    // API Gateway for REST endpoints
    const api = new sst.aws.ApiGatewayV2("Api", {
      cors: {
        allowCredentials: false,
        allowHeaders: ["content-type"],
        allowMethods: ["GET", "POST", "PUT", "DELETE"],
        allowOrigins: ["*"],
      },
      transform: {
        api: (args) => {
          args.name = `${appName}-${stage}-api`;
        },
      },
    });

    // Connect API routes to FastAPI Lambda handler
    api.route("GET /api/{proxy+}", apiHandler.arn);
    api.route("POST /api/{proxy+}", apiHandler.arn);
    api.route("PUT /api/{proxy+}", apiHandler.arn);
    api.route("DELETE /api/{proxy+}", apiHandler.arn);

    // Next.js web app
    const web = new sst.aws.Nextjs("Web", {
      path: "./web",
      link: [api],
      environment: {
        NEXT_PUBLIC_API_URL: api.url,
      },
    });

    return {
      WebApp: web.url,
      API: api.url,
      GameTable: gameTable.name,
    };
  },
});

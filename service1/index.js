const fs = require("fs");
const amqp = require("amqplib");

const express = require("express");
const app = express();
app.keepAliveTimeout = 30_000;
app.headersTimeout = 35_000;

const writeLog = (msg) => {
  fs.appendFileSync(
    "./log/service.log",
    `[service1 :${new Date().toLocaleTimeString()}] ${msg}\n`
  );
};

(async () => {
  const connect = await amqp.connect(
    `amqp://user:password@${process.env.RABBITMQ_DEFAULT_HOST}`
  );
  app.all("*", async (req, res, next) => {
    const channel = await connect.createChannel();
    req.on("error", () => channel.close());

    await channel.assertQueue("PROCESS");
    await channel.assertQueue("PROCESSED");

    channel.prefetch(1);

    channel.consume("PROCESSED", (msg) => {
      writeLog("Получен ответ из очереди");
      res.status(200).json(msg.content.toString());
      channel.ack(msg);
      channel.close();
    });
    channel.sendToQueue(
      "PROCESS",
      req.body ? Buffer.from(req.body) : Buffer.from("")
    );
    writeLog("Запрос отправлен в очередь");
  });
  app.listen(process.env.APIPORT, () =>
    console.log(`Server started on port ${process.env.APIPORT}`)
  );
})();

const fs = require("fs");
const amqp = require("amqplib");

const writeLog = (msg) => {
  fs.appendFileSync(
    "./log/service.log",
    `[service2 :${new Date().toLocaleTimeString()}] ${msg}\n`
  );
};

(async () => {
  const connect = await amqp.connect(
    `amqp://user:password@${process.env.RABBITMQ_DEFAULT_HOST}`
  );
  const channel = await connect.createChannel();
  await channel.assertQueue("PROCESS");
  await channel.assertQueue("PROCESSED");
  channel.consume("PROCESS", (msg) => {
    channel.ack(msg);
    channel.sendToQueue(
      "PROCESSED",
      Buffer.from(
        JSON.stringify({
          message: `request processed by service 2 ${new Date()}`,
        })
      )
    );
    writeLog("Обработано сообщение из очереди");
  });
})();

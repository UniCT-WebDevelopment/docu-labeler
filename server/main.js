const allowedOrigins = ['http://localhost:3000', 'http://192.168.230.235:3000', 'host.docker.internal', 'http://localhost:3001'];

const express = require("express");
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser");
const cors = require('cors'); 

const authenticationRoutes = require("./routes/authenticationRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const annotationRoutes = require("./routes/annotationsRoutes");

const mongoose = require("mongoose");

connection_string_local = 'mongodb://127.0.0.1:27017/DocuLabeler'
connection_string_docker = 'mongodb://host.docker.internal:27017/DocuLabeler'

mongoose.connect(connection_string_local)
.then(console.log("Mongoose: connesso al server"));

const express_server = express();

express_server.use(express.json({limit: "1024mb"}));
express_server.use(bodyParser.urlencoded({extended: false, limit: "1024mb"}));
express_server.use(cookieParser());
express_server.use(
    cors({
      origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.log("Origine:", origin)
          callback(new Error('Not allowed by CORS'));
        }
      },
    })
  );

express_server.use("/auth", authenticationRoutes);
express_server.use(registrationRoutes);
express_server.use("/project", projectRoutes);
express_server.use("/task", taskRoutes);
express_server.use("/annotation", annotationRoutes);

http_expr_serv = express_server.listen(8080);


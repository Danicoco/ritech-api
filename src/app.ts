/** @format */

import httpServer from "./server"
import db from "./database/postgres/models"

const { PORT, NODE_ENV } = process.env

// Start the server
db.sequelize
    .authenticate()
    .then(() => {
        if (NODE_ENV !== "test") {
            console.log(`Environment is ${NODE_ENV}`)
            console.log(`Connected to database: ${process.env.DB_NAME}`)
            httpServer.listen(PORT, () => {
                console.log(`Server started on port: ${PORT}`)
            })
        }
    })
    .catch((err: Error) => console.log(err))

import express from "express"
const app = express()
import {findImages} from "./controllers/allControllers.js"

app.use(express.json())
app.use(express.urlencoded({extended:true}))


app.post("/images" , findImages)

app.get("/" , (req,res) => {
  res.send("sucessful")
})


app.listen(4000,() => {
  console.log("app connected")
})
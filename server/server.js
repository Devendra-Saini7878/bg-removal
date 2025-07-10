import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './configs/mongodb.js'
import userRouter from './routes/userRoutes.js'
import imageRouter from './routes/imageRoutes.js'



//App.config

const PORT = process.env.PORT || 4000
const app = express()
await connectDB()

//Intialize
app.use(express.json())
app.use(cors({
  origin: 'http://localhost:5173', // or '*' for all origins (not recommended for production)
  credentials: true, // if you use cookies or authentication
}));

//API Route
app.get('/',(req,res)=> res.send("API working"))
app.use('/api/user',userRouter)
app.use('/api/image',imageRouter)

app.listen(PORT,()=>console.log("Server Running on port"+PORT))








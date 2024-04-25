import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import process from "process";
import cors from "cors";
import path from "path";
import ejs from 'ejs';
//routers
import userRouter from "./routes/userRouter.js"

//port
const PORT=process.env.PORT || 8080;

//rest object
const app=express();



// const __dirname = path.dirname(new URL(import.meta.url).pathname);

// const app = express();
// console.log("*****************************",__dirname);

// app.use(express.static(path.join(__dirname, 'views')));


//middleware
// app.set('view engine','ejs');
// app.use(express.static(path.join(__dirname,'serverPages')));
app.use(helmet());

app.use(morgan('dev'));
app.use(express.json());
app.use(cors());
// app.use(cookie)


//route
app.use("/api/v1/user",userRouter);
// app.get('/setpassword', (req, res) => {
//   res.render(path.join(__dirname,'views','setpassword'));
// });
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const originalname=__dirname.slice(1);
console.log("original",originalname);
app.set('views', path.join(originalname, 'views'));
// const cleanedPath = path.replace(/^\\/, '');
console.log(path.join(originalname, 'views'));
app.set('view engine', 'ejs'); // Assuming you are using EJS as the view engine

app.get('/setpassword', (req, res) => {
    res.render('setpassword'); // Express will look for 'setpassword.ejs' in the 'views' directory
});
app.post('/set',(req,res)=>{
 console.log(req);
})






app.listen(PORT,()=>{
  console.log(`server Running on ${PORT}`);
});
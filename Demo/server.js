const express=require('express');
const cors =require('cors');
const app=express()
app.use(cors())

//saving our data.jason to (data)
const data=require ('./data.json')

app.get('/',handlerHomePage);
app.get('/favorite',handlerFavouritPage);
app.get('*',handlerNotFound);
app.use(errorHandler);


//constructor to format the data
function Favourit(title,poster_path,overview){
this.title=title;
this.poster_path=poster_path;
this.overview=overview
}


function handlerNotFound(req,res){
    return res.status(404).send("Huh !? SORRY NOT FOUND")
}


function handlerFavouritPage(req,res){
    return res.status(200).send("Welcome to Favorite Page");

}

function handlerHomePage(req,res){
    let obj=new Favourit(data.title,data.poster_path,data.overview)
    return res.status(200).json(obj)

}

function errorHandler(error,req,res){
    const err={
        status:500,
        message:error
    }
     res.status(500).send("Sorry, something went wrong")
}

app.listen(7000,()=>{
console.log("listen to port 7000") }
    )
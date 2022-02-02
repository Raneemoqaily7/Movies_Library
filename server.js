require('dotenv').config();
const express=require('express');
const cors =require('cors');
const axios =require('axios');
const PORT=process.env.PORT;
const server=express()
server.use(cors())



//saving our data.jason to (data)
const mydata=require ('./data.json')

server.get('/',handlerHomePage);
server.get('/favorite',handlerFavouritPage);
server.get('/searchmovie' ,searchHandler)
server.get('/trending' ,trendinghHandler)
server.get('/review',reviewHandler)
server.use('*',handlerNotFound); //client error ,path is not exist
server.use(errorHandler); //server error

let url=`https://api.themoviedb.org/3/trending/movie/day?api_key=${process.env.APIKEY}`;
//constructor to format the data
function Favourit(title,poster_path,overview){
this.title=title;
this.poster_path=poster_path;
this.overview=overview
}

function Movie(id,title, release_date,poster_path,overview){
    this.id=id;
    this.title=title;
    this.release_date=release_date;
    this.poster_path=poster_path;
    this.overview=overview
}


let  usersearch="The Hobbit: The Battle of the Five Armies";

function searchHandler(req,res){
let url=`https://api.themoviedb.org/3/search/movie?api_key=${process.env.APIKEY}&language=en-US&query=The&page=2&query=${usersearch}`;

axios.get(url).then((data)=>{
            // console.log(data.data.results)

let movies=data.data.results.map(result=>{
    return new Movie(result.id,result.title,result.release_date,result.poster_path,result.overview)

})
res.status(200).json(movies)

}).catch(err=>{
    errorHandler(err,req,res)
}

)}

function trendinghHandler(req,res){
    let url=`https://api.themoviedb.org/3/trending/movie/day?api_key=${process.env.APIKEY}`;

    axios.get(url).then((data)=>{
        // console.log(data.data.results)
        let movies =data.data.results.map(result=>{
            return new Movie(result.id,result.title,result.release_date,result.poster_path,result.overview)
        })
        res.status(200).json(movies)
    }).catch((err)=>{
        errorHandler(err,req,res)
    })

}

function networkHandler(req,res){
    let url=`https://api.themoviedb.org/3/network/{network_678}?api_key=${process.env.APIKEY}`
    axios.get(url).then((data)=>{
        // console.log(data.data.results)
        let movies =data.data.results.map(result=>{
            return new Movie(result.id,result.title,result.release_date,result.poster_path,result.overview)
        })
        res.status(200).json(movies)
    }).catch((err)=>{
        errorHandler(err,req,res)
    })

}



function reviewHandler(req,res) {
let url=`https://api.themoviedb.org/3/review/{18785}?api_key=${process.env.APIKEY}`;
axios.get(url).then((data)=>{
    let movies =data.data.results.map(result=>{
        return new Movie(result.id,result.title,result.release_date,result.poster_path,result.overview)
    })
    res.status(200).json(movies)
}).catch((err)=>{
    errorHandler(err,req,res)
})

}

}
function handlerNotFound(req,res){
    return res.status(404).send("SORRY  THIS PAGE NOT FOUND")
}


function handlerFavouritPage(req,res){
    return res.status(200).send("Welcome to Favorite Page");

}

function handlerHomePage(req,res){
    let obj=new Favourit(mydata.title,mydata.poster_path,mydata.overview)
    return res.status(200).json(obj)

}

function errorHandler(error,req,res){
    const err={
        status:500,
        message:error
    }
     res.status(500).send("Sorry, something went wrong")
}

server.listen(PORT,()=>{
console.log(`listining to ${PORT}`)
 })
require('dotenv').config();
const express=require('express');
const cors =require('cors');
const axios =require('axios');
const PORT=process.env.PORT;
const server=express();
const pg =require('pg');
//create client with database url
// const client =new pg.Client(process.env.DATABASE_URL);
const client = new pg.Client({

    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})

// 5ccf75088cf2cb9dc0801bc19f16f285

//saving our data.jason to (data)
const mydata=require ('./data.json');

server.use(cors());
server.use(express.json());

server.get('/',handlerHomePage);
server.get('/favorite',handlerFavouritPage);
server.get('/search' ,searchHandler)

server.get('/trending' ,trendinghHandler)
server.get('/translation',translationsHandler)
server.get('/list',listMoviesHandler)
server.post('/addMovie',addMovieHandler)

server.get('/getMovies',handlerGetMovies)
server.put('/UPDATE/:id',handlerupdateMovie)
server.delete('/DELETE/:id',handlerDeleteMovie)
server.get('/getMovie/:id',handlerGetMovieID);

server.use('*',handlerNotFound); //client error ,path is not exist
server.use(errorHandler); //server error

//constructor to format the data
function Favourit(title,poster_path,overview){
this.title=title;
this.poster_path=poster_path;
this.overview=overview
}

function Movie(id,title, release_date,poster_path,overview,comment){
    this.id=id;
    this.title=title;
    this.release_date=release_date;
    this.poster_path=poster_path;
    this.overview=overview;
    this.comment=comment
}


function searchHandler(req,res){
    let usersearch=req.query.usersearch;
    console.log(usersearch)
let url=`https://api.themoviedb.org/3/search/movie?api_key=${process.env.APIKEY}&language=en-US&query=${usersearch}&page=1`;

axios.get(url)
.then((data)=>{
            // console.log(data.data.results)

let movies=data.data.results.map(result=>{
    return new Movie(result.id,result.title,result.release_date,result.poster_path,result.overview)

})
res.status(200).json(movies)

}).catch((err)=>{
    errorHandler(err,req,res)
}

)}

function handlerGetMovies(req,res){
let sql =`SELECT * FROM myMovie;`;
client.query(sql).then(data=>{
    res.status(200).json(data.rows)
}
    ).catch(error=>{
        errorHandler(err,req,res)
    })
}


function trendinghHandler(req,res){
    let url=`https://api.themoviedb.org/3/trending/movie/day?api_key=${process.env.APIKEY}`;

    axios.get(url).then(data=>{
        // console.log(data.data.results)
        let movies =data.data.results.map(result=>{
            return new Movie(result.id,result.title,result.release_date,result.poster_path,result.overview)
        })
        res.status(200).json(movies)
    }).catch(err=>{
        errorHandler(err,req,res)
    })

}

function listMoviesHandler(req,res){
    let url=`https://api.themoviedb.org/3/movie/347201/lists?api_key=${process.env.APIKEY}&language=en-US&page=1`;
    axios.get(url).then((data)=>{
        // console.log(data.data.results)
        let movies =data.data.results.map(result=>{
            return new Movie(result.id,result.title,0,result.poster_path,result.overview)
        })
        res.status(200).json(movies)
    }).catch((err)=>{
        errorHandler(err,req,res)
    })

}



function translationsHandler(req,res) {

    const id=req.params.id;

let url=`https://api.themoviedb.org/3/movie/${id}/translations?api_key=${process.env.APIKEY}`;
axios.get(url)
.then((data)=>{
    console.log(data.data)
    let movies =data.data.translations.map(result=>{
        console.log(result, "suraaa")
        return new Movie(result.id,result.title,result.release_date,result.poster_path,result.overview)
    })
    res.status(200).json(movies)
}).catch((err)=>{
console.log(err)
    errorHandler(err,req,res)
})
}

function addMovieHandler(req,res){
    const movie=req.body;
    let sql = 'INSERT INTO myMovie (title,release_date,poster_path,overview,comment) VALUES ($1,$2,$3,$4,$5) RETURNING *;'
    let values=[movie.title,movie.release_date,movie.poster_path,movie.overview,movie.comment]
    client.query(sql,values).then((data)=>{
      res.status(200).json(data.rows)
    }).catch((error)=>{
 
        errorHandler(error,req,res)
    })
}

function handlerupdateMovie(req,res){
    const id=req.params.id;
    const movie=req.body;
    const sql=`UPDATE myMovie SET title=$1, release_date=$2,poster_path=$3,overview=$4,comment=$5 WHERE id=$6 RETURNING *;`
    let values=[movie.title,movie.release_date,movie.poster_path,movie.overview,movie.comment,id]
    client.query(sql,values).then(data=>{
        res.status(200).json(data.rows)

    }).catch((error)=>{
 
        errorHandler(error,req,res)
    })

}

function handlerDeleteMovie(req,res){
    const id =req.params.id;
    const sql=`DELETE FROM myMovie WHERE id=${id};`
    // const values=[id]
    client.query(sql).then(()=>{
        res.status(200).send("MOVIE HAS DELETED");
    }).catch((error)=>{
 
    errorHandler(error,req,res)
    })

}

function  handlerGetMovieID(req,res){
    const id =req.params.id;
    let sql =`SELECT * FROM myMovie WHERE id=${id};`;
    client.query(sql).then(data=>{
        res.status(200).json(data.rows)
    }
        ).catch(error=>{
            errorHandler(err,req,res)
        })
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


client.connect().then(()=>{
server.listen(PORT,()=>{
console.log(`listining to ${PORT}`)
 })
}) 
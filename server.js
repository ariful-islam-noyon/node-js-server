import http from 'http';
import { readFileSync,writeFileSync } from 'fs';
import dotenv from "dotenv";
import { lastId } from './utility/function.js';

// app configuration 
dotenv.config();
const PORT = process.env.SERVER_PORT;

// data manage
const students_json = readFileSync('./data/db.json')
const students_obj = JSON.parse(students_json)

// Server
http.createServer((req, res) => {

    // Routing
    if(req.url == "/api/students" && req.method == "GET"){

        res.writeHead(200, {'Content-Type' : 'application/json'})
        res.end(students_json);

    }else if(req.url.match(/\/api\/students\/[0-9]{1,}/) && req.method == "GET"){
        
        let id = req.url.split('/')[3];
        if(students_obj.find( stu => stu.id == id)){

            res.writeHead(200, {'Content-Type' : 'application/json'})
            res.end(JSON.stringify(students_obj.find( stu => stu.id == id)));

        }else{
            res.writeHead(200, {'Content-Type' : 'application/json'})
            res.end(JSON.stringify({
               Message : "Data Not Found"
           }));
        }
        
    }else if(req.url == "/api/students" && req.method == "POST"){

        // req data
        let data = '';
        req.on('data', (chunk) => {
            data += chunk.toString();
        });

        req.on('end', () =>{
           let {name, age, skill, location} = JSON.parse(data)

           students_obj.push({
               id :lastId(students_obj),
               name : name,
               age : age,
               skill: skill,
               location:location
           })
           writeFileSync('./data/db.json', JSON.stringify(students_obj))
        })

        res.writeHead(200, {'Content-Type' : 'application/json'})
        res.end(JSON.stringify({
           Message : "Students Update Successfull"
       }));

    }else if(req.url.match(/\/api\/students\/[0-9]{1,}/) && req.method == "DELETE"){

        let id = req.url.split('/')[3];

        let deletedData = students_obj.filter( (data) => data.id !=id)
        writeFileSync('./data/db.json', JSON.stringify(deletedData))

        res.writeHead(200, {'Content-Type' : 'application/json'})
        res.end(JSON.stringify({
           Message : "Students Data Delete Successfull"
       }));

    }else if(req.url.match(/\/api\/students\/[0-9]{1,}/) && req.method == "PUT" || req.url.match(/\/api\/students\/[0-9]{1,}/) && req.method == "PATCH"){

        let id = req.url.split('/')[3];
         
        if(students_obj.some( stu => stu.id == id)){
            
        let data = '';

        req.on('data', (chunk) => {
            data += chunk.toString();
        })
        req.on('end', () => {
            let updated_data= JSON.parse(data)
            students_obj[students_obj.findIndex( stu => stu.id == id)]={...updated_data};
            
            writeFileSync('./data/db.json', JSON.stringify(students_obj))
        })

          res.writeHead(200, {'Content-Type' : 'application/json'})
            res.end(JSON.stringify({
               Message : "Students Data Edit Successfull"
           }));
           

        }else{
            res.writeHead(200, {'Content-Type' : 'application/json'})
            res.end(JSON.stringify({
               Message : "Students Data Not Found"
           }));
        }
        

    } else{
        res.writeHead(200, {'Content-Type' : 'application/json'})
        res.end(JSON.stringify({
            Error : "Invailid Data"
        }));
    }

}).listen(5050, () => {
    console.log(`Server is ready now. Server Port is ${PORT}`);
   
})
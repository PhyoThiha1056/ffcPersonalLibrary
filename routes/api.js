/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const { type } = require('express/lib/response');
let mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(()=>{
  console.log('connected')
}).catch((err)=>{
  console.log(err)
});

let bookSchema = new mongoose.Schema({
  title: {type: String, required: true},
  comments: [String]
})

let Book = mongoose.model('Book', bookSchema);

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      let bookArray = [];
      Book.find({}).then((book)=>{
        book.forEach((book)=>{
          let jsonBook = book.toJSON()
          jsonBook['commentcount'] = book.comments.length
          bookArray.push(jsonBook);
        })
        return res.json(bookArray);
      }).catch((err)=>{
        console.log(err)
      })
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
    .post(function (req, res){
      let title = req.body.title;

      if(!title) {
        return res.json('missing required field title')
      }

      let newBook = new Book({
        title: title,
        comments: []
      })

      newBook.save().then((book)=>{
        return res.json(book)
      }).catch((err)=>{
        console.log(err)
      })
      //response will contain new book object including atleast _id and title
    })
    
    .delete(function(req, res){
      Book.deleteMany({}).then(()=>{
        return res.json('complete delete successful')
      }).catch((err)=>{
        console.log(err)
      })
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;

      Book.findById(bookid).then((book)=>{
        if (!book) {
          return res.json('no book exists')
        }
        return res.json(book)
      }).catch((err)=>{
        console.log(err)
        res.status(200).json('no book exists');
      })
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;

      if (!comment) {
        return res.json('missing required field comment')
      }

      Book.findByIdAndUpdate(bookid,{$push: {comments: comment}},{new: true}).then((book)=>{
        if(!book) {
          return res.json('no book exists')
        }
        return res.json(book)
      }).catch((err)=> {
        console.log(err)
      })

      //json res format same as .get
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;

      Book.findByIdAndDelete(bookid).then((book)=>{
        if (!book) {
          return res.json('no book exists')
        }
        return res.json('delete successful')
      }).catch((err)=>{
        return res.json('no book exists')
      })
      //if successful response will be 'delete successful'
    });
  
};

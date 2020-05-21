
//jshint esversion:6

const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");//require mongoose
const app=express();
app.set('view engine','ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));



//connect to mongoose database
mongoose.connect("mongodb+srv://admin-niteshkumar:Test1234@cluster0-zjgtx.mongodb.net/todolistDB",{useNewUrlParser:true});

// mongoose schema
const itemsSchema={
  name:String
};
//mongoose model based on schema
const Item=mongoose.model("Item",itemsSchema);
//creating new documents using mongoose i,e, creating default items
const item1=new Item({
  name:"Welcome to your ToDoList"
});
const item2=new Item({
  name:"Click + to expand"
});
const item3=new Item({
  name:"Checkmark the box to delete"
});
//creating default items array
const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  item:[itemsSchema]
};

const List=mongoose.model("List",listSchema);


app.get("/", function(req, res){

//find function using mongoose
Item.find({},function(err,foundItems){

  if(foundItems.length===0){
    Item.insertMany(defaultItems,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Successfully logged default items");
      }
    });
    res.redirect("/");
  }else{
    res.render("list",{listTitle:"Today",newListItems:foundItems});
  }
});

});

app.get("/:customListName",function(req,res){
  const customListName=req.params.customListName;
  List.findOne({name:customListName},function(err,foundList){

  if(!err){
    if(!foundList){
      //new list is created
      const list=new List({
        name:customListName,
        items:defaultItems
      });
      list.save();
      res.redirect("/"+ customListName);
    }else{
      //Show list
      res.render("list",{listTitle:foundList.name,newListItems:foundList.item});
    }
  }
});


});

app.post("/",function(req,res){

    const itemName=req.body.newItem;
    const listName=req.body.list;

    const item=new Item({
      name:itemName
    });
    if(listName==="Today"){
      item.save();
      res.redirect("/");
    }else{
      List.findOne({name:listName},function(err,foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
      });
    }

});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }


});

app.get("/about",function(req,res){
  res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,function(){
  console.log("Server has started Successfully");
});

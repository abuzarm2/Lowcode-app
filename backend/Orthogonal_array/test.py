import pymongo

from pymongo import MongoClient

import certifi



#client connection

cluster = MongoClient("mongodb+srv://newuser1:Abuzarm2@cluster0.qqe5xei.mongodb.net/?retryWrites=true&w=majority",tlsCAFile=certifi.where())



#database name

db = cluster["test"]



#collection name

collection=db["test"]



#fetch the data

result = collection.find_one( {"_id":"2^3"} )


for d in result["tab"].split():

  print(d)
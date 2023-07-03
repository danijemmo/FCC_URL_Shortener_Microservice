require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const dns = require("dns");
const urlparser = require("url");
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(`${process.cwd()}/public`));

mongoose
  .connect(
    "mongodb+srv://danieljemmo:uza2DHIBzOVyOKVS@database.t6hhdgp.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => console.log("mongodb is connected ..."))
  .catch((err) => console.error(err));

const urlSchema = new mongoose.Schema({
  url: String,
  short_url: Number
});

const Url = mongoose.model("url", urlSchema);

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.post("/api/shorturl", async (req, res) => {
  const url = req.body.url;
  const dnsLookup = dns.lookup(
    urlparser.parse(url).hostname,
    async (err, address) => {
      if (!address) return res.json({ error: "Invalid URL" });
      const urls = await Url.countDocuments({});
      let urlDoc = new Url({
        url: req.body.url,
        short_url: urls,
      });
       await urlDoc.save();
      res.json({ original_url: url, short_url:urls });
    }
  );
});
app.get('/api/shorturl/:short_url',async(req,res)=>{
  
  const shortedUrl = await Url.findOne({short_url: req.params.short_url})
  res.redirect(shortedUrl.url)
})
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

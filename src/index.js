const { router, text } = require('bottender/router');
const { PythonShell } = require('python-shell')
const mysql = require('mysql');

async function SayHi(context) {
  await context.sendText('Hi!');
}

async function GetUserID(event) {
  await event.source.userId;
}

async function ParseUrl(context) {
  let query = context.event.text;
  context.setState({
    url: query.includes(':') ? query.split(':')[1] : query.split('：')[1],
    onSave: true,
  });
  await context.sendText(`你想要存的網址是：${context.state.url}？ 請回答「是」或「否」`);
}

async function ConfirmUrl(context) {
  if (context.state.onSave && context.event.text === '是') await SaveUrl(context);
  else {
    context.setState({
      onSave: false,
    });
    await context.sendText(`請重新輸入指令`);
  }
}

async function SearchUrl(context){
  let query = context.event.text;
  context.setState({
    url: query.includes(':') ? query.split(':')[1] : query.split('：')[1],
    onRead: true,
  }) ;
  await SearchUrlinDB(context);
}

async function SearchUrlinDB(context){
  let con = mysql.createConnection({
    host: "35.194.253.30",
    user: "root",
    password: "chatbot",
    database: "chatbot_db"
    });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    con.query("SELECT url FROM chatbot_db WHERE tag = '${context.state.keyword}'", function (err, result) {
      if (err) throw err;
      let urlResults = JSON.parse(result);
      let count = 0;
      await context.sendText(`關於 ${context.state.keyword} 的結果如下：`);
      for (url in urlResults){
        await context.sendText(`url + "\n"`);
        count ++;
        }
    });
    })
    context.setState({
      keyword: '',
      onRead: false,
    });
    await context.sendText(`總共找到 ${count} 個結果`);
  };
  


async function SaveUrl(context) {
  await context.sendText('開始儲存網址');

  const options = {
    args:
      [
        context.state.url,
      ],
  }

  const crawlUrlByPython = new Promise(function (resolve, reject) {
    PythonShell.run(__dirname + '/main.py', options, (err, data) => {
      if (err) reject(err);
      const crawlingResults = JSON.parse(data)
      resolve(crawlingResults);
    })
  })

  await crawlUrlByPython
    .then(async function(crawlingResults){
      await context.sendText(crawlingResults.title);
      let keyword = crawlingResults.keywords.split(“,”);

      //[todo] get user information
      let name = GetUserID(context)

      //[todo] save data to database

      let con = mysql.createConnection({
      host: "35.194.253.30",
      user: "root",
      password: "chatbot",
      database: "chatbot_db"
      });

      con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        for (word in keyword){
          let sql = "INSERT INTO chatbot_db (userId, url, tag) VALUES (name, context.state.url, word)";
          con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("1 record inserted");
          }
        });
      });
      

  context.setState({
    url: '',
    onSave: false,
  });
  await context.sendText('儲存網址完畢');

  })

  .catch(async function(err){
    await context.sendText(err);
  })
}

module.exports = async function App() {

  return router([
    text(/hi|hello/, SayHi),
    text(/(存|save|Save)(:|：).*/, ParseUrl),
    text(/(是|否)/, ConfirmUrl),
    text(/(查|找｜查詢)(:|：),*/, SearchUrl),
  ]);
};

module.exports.initialState = {
  url: '',
  keyword: ''
  onSave: false,
};
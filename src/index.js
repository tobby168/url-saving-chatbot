const { router, text } = require('bottender/router');
const { PythonShell } = require('python-shell')

async function SayHi(context) {
  await context.sendText('Hi!');
}

async function ParseUrl(context) {
  const query = context.event.text;
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
    await context.sendText('請重新輸入指令');
  }
}

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
      //[todo] get user information


      //[todo] save data to database


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
  ]);
};

module.exports.initialState = {
  url: '',
  onSave: false,
};
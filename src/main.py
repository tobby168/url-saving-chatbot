import sys 
import json'
import time
import requests
import validators
from urllib.request import Request, urlopen
import urllib
from bs4 import BeautifulSoup
import jieba
import jieba.analyse

url = sys.argv[1]

#finish the code here


tags_dic = set()
tags_need = ""

with open('tags.txt', 'r') as tags:
    for tag in tags.readlines():
        tags_dic.add(tag)

tags = open('tags.txt', 'a')


requests.adapters.DEFAULT_RETRIES = 5 # 增加重连次数
s = requests.session()
s.keep_alive = False # 关闭多余连接
s.get(url)
re = requests.get(url)
re.encoding = 'utf-8' #需要新增這一行，告知html檔案解碼方式
soup = BeautifulSoup(re.text, 'html.parser')
url_txt = soup.text
tag = jieba.analyse.extract_tags(url_txt, topK=20)
for i in tag:
    if i not in tags_dic:
        tags_need += i + ","
print(url +"已加入")

tags.close()


#expected results
result = {
  'title': 'title of ' + url,
  'keywords': tags_need
}

json = json.dumps(result)

print(str(json))
sys.stdout.flush()



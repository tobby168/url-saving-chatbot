import sys 
import json

url = sys.argv[1]

#finish the code here



#expected results
result = {
  'title': 'title of ' + url,
  'keywords': ''
}

json = json.dumps(result)

print(str(json))
sys.stdout.flush()
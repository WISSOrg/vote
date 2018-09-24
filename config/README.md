
Add config.json in the following format:
```
{
  "confName": "WISS 2017",
  "admins": [100, 108],
  "paperEnabled": false,
  "demoEnabled": true,
  "host": "www.wiss.org",
  "rootDir": "/wiss2017",
  "cookieKeys": ["wiss2017", "vote2017"],
  "mongoConnectionString": "mongodb://localhost:27017/vote2017"
}
```

Add users.json in the following format:
```
[
  {
		"id" : 1111,
		"email" : "i@junkato.jp",
		"name1" : "加藤",
		"name2" : "淳"
	},
  {
		"id" : 9999,
		"email" : "jun.kato@aist.go.jp",
		"name1" : "加藤",
		"name2" : "淳",
		"isCommittee" : true
	}
]
```

Add papers.csv in the following format:
```
paperId,title,authors
01,ほげのふが手法,著者 著者（ほげ大），著者 著者（ふが大）
02,ふがのふが手法,著者 著者（ほげ大），著者 著者（ふが大）
```

And demos.csv:
```
demoId,title,authors
1-A01,ほげのふが手法,著者 著者（ほげ大），著者 著者（ふが大）
1-A02,ふがのふが手法,著者 著者（ほげ大），著者 著者（ふが大）
```

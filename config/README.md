
Add config.json in the following format:
```
{
  "confName": "WISS 2017",
  "host": "www.wiss.org",
  "admins": [100, 108],
  "rootDir": "/wiss2017",
  "cookieKeys": ["wiss2017", "vote2017"],
  "mongoConnectionString": "mongodb://localhost:27017/vote2017"
}
```

Add users.csv in the following format:
```
id,familyName,givenName,familyYomi,givenYomi,mail,isCommittee
100,Hoge,Fuga,ほげ,ふが,mail@example.com,1
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

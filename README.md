# Eyevinn MediaFunction::Scenes

A serverless media function to detect scene changes and provide scene thumbnails.

## Develop

```
$ docker build -t function-scene:dev .
$ docker run --rm -it -p 3000:3000 -v $PWD:/appdev function-scene:dev /bin/bash
root@811b2120dc75:/app# cd /appdev/
root@811b2120dc75:/appdev# DEBUG=* node index.js 
  function-scenes restify listening at http://[::]:3000 +0ms
```

## About Eyevinn Technology

Eyevinn Technology is an independent consultant firm specialized in video and streaming. Independent in a way that we are not commercially tied to any platform or technology vendor.

At Eyevinn, every software developer consultant has a dedicated budget reserved for open source development and contribution to the open source community. This give us room for innovation, team building and personal competence development. And also gives us as a company a way to contribute back to the open source community.

Want to know more about Eyevinn and how it is to work here. Contact us at work@eyevinn.se!

## LICENSE

Copyright 2019 Eyevinn Technology

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.


'use strict';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "index.html": "cdf2c5ebc82d40fc486cb9a22012d818",
"main.dart.js": "465f9a45403e3f4ccca463109c9551b7",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "e160b2b5c8d82959e396eba695106a3e",
"assets/LICENSE": "c178e20c66ae118a8ee07605850aba40",
"assets/AssetManifest.json": "e56c4f2bb874e6b90d8f0b0576046c0a",
"assets/FontManifest.json": "f7161631e25fbd47f3180eae84053a51",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "115e937bb829a890521f72d2e664b632",
"assets/fonts/MaterialIcons-Regular.ttf": "56d3ffdef7a25659eab6a68a3fbfaf16",
"assets/assets/image/bg_second_floor.png": "95e982da0c61379c7fa0afb03a21e2c4",
"assets/assets/image/head_knoyo.jpg": "bcc8857d06fc0ea3fbddf22d4f9153d0",
"assets/assets/image/weixin.png": "f1942abd06e453808810f8b087c684bc",
"assets/assets/image/nodata.png": "c9776e3e96f085c8a565265c2e2ba090",
"assets/assets/image/head.jpg": "d1d323df450bdfa9ec40b6222d3053d3",
"assets/assets/image/QQ.png": "fe466dad5ed62fc2cb0d3165da4022d9",
"assets/assets/image/alipay.png": "f52910f7a5e6d5fa39c3b9102bb74d41",
"assets/assets/image/paypal.png": "3526e230f4d93b61e08efac41b862320",
"assets/assets/flare/Bob(Minion).flr": "17c0844c6a515b892665fde3e9578e44",
"assets/assets/flare/SpaceDemo.flr": "5403c701d61b4da9df509b8dc29d49c4"
};

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheName) {
      return caches.delete(cacheName);
    }).then(function (_) {
      return caches.open(CACHE_NAME);
    }).then(function (cache) {
      return cache.addAll(Object.keys(RESOURCES));
    })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"assets/AssetManifest.bin": "8a19cdd491d966bdb1d0ae510c18ed36",
"assets/AssetManifest.bin.json": "ff7790eaf3086801a725b8dc5a6643a0",
"assets/AssetManifest.json": "e032ec306b88462b5c7cd1079984fff6",
"assets/assets/image/cryptocurrency/bitcoin.svg": "496938377803aef8a290c86979191881",
"assets/assets/image/cryptocurrency/bnb.svg": "cfec0f24a72a01b3ce3ae67506936c51",
"assets/assets/image/cryptocurrency/dogecoin.svg": "605642c71463ca8ec99903719c98dcb0",
"assets/assets/image/cryptocurrency/ethereum.svg": "c62c64cbd1ba9e5598b09219141bd659",
"assets/assets/image/cryptocurrency/matic.svg": "de18f150135e1dbd88597c1a24555a50",
"assets/assets/image/cryptocurrency/more.svg": "0c752e82c5f305f8cf3658e8812dacbe",
"assets/assets/image/cryptocurrency/trx.svg": "628da0985dd7233d1a23f9af461b5695",
"assets/assets/image/cryptocurrency/usdc.svg": "e77df2b1cda0fc7333b5c13ee78b9dce",
"assets/assets/image/cryptocurrency/usdt.svg": "eac1f7bb15967c89034b440b095ad74c",
"assets/assets/image/pay_alipay.jpg": "5bcc3afc8daed3511430c3d2b87be549",
"assets/assets/image/pay_wechat.jpg": "6a504cff8f708f97bc3f042abdeee362",
"assets/assets/image/user_head.jpg": "bcc8857d06fc0ea3fbddf22d4f9153d0",
"assets/assets/rive/raster_graphics.riv": "7eb3c9bd4848b5b9a4cd90b6ba5eedd3",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "971abdbb04e074480522c3144905db24",
"assets/NOTICES": "1ca838addb98bb1e0d1ff24b1eca3adb",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "20163ff8b1d491d9ef66bda83888618d",
"assets/packages/easy_refresh_bubbles/assets/bubbles.riv": "e67c6b4dbbcf26fe320cbcf4af0e3e46",
"assets/packages/easy_refresh_halloween/assets/halloween.riv": "2d48634ea9b4494196b609270df1ef6d",
"assets/packages/easy_refresh_skating/assets/skating.riv": "5aadb7304ac2501ce5eb8e506a384702",
"assets/packages/easy_refresh_space/assets/space_reload.riv": "bfb1e3be267fdda9456a00f2729fcc21",
"assets/packages/easy_refresh_squats/assets/lumberjack_squats.riv": "1feacf1409223b579af90731766bff82",
"assets/shaders/ink_sparkle.frag": "4096b5150bac93c41cbc9b45276bd90f",
"canvaskit/canvaskit.js": "eb8797020acdbdf96a12fb0405582c1b",
"canvaskit/canvaskit.wasm": "73584c1a3367e3eaf757647a8f5c5989",
"canvaskit/chromium/canvaskit.js": "0ae8bbcc58155679458a0f7a00f66873",
"canvaskit/chromium/canvaskit.wasm": "143af6ff368f9cd21c863bfa4274c406",
"canvaskit/profiling/canvaskit.js": "c21852696bc1cc82e8894d851c01921a",
"canvaskit/profiling/canvaskit.wasm": "371bc4e204443b0d5e774d64a046eb99",
"canvaskit/skwasm.js": "87063acf45c5e1ab9565dcf06b0c18b8",
"canvaskit/skwasm.wasm": "2fc47c0a0c3c7af8542b601634fe9674",
"canvaskit/skwasm.worker.js": "bfb704a6c714a75da9ef320991e88b03",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"flutter.js": "59a12ab9d00ae8f8096fffc417b6e84f",
"index.html": "7b3a702c64ed9d4cf759a63bc9d0715a",
"/": "7b3a702c64ed9d4cf759a63bc9d0715a",
"main.dart.js": "b48eceaf9cbec802cbdf07f03032ad50",
"manifest.json": "cf329e2f1e0413138e769ca3995f1fa7",
"version.json": "6f2fc1bc9df16d30801de9442864e739"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}

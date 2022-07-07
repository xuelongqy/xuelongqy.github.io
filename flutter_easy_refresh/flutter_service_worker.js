'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "202c58d12324c88f174d14070968c014",
"index.html": "53b68c82fc2bd444a5d88de78490c6dd",
"/": "53b68c82fc2bd444a5d88de78490c6dd",
"main.dart.js": "c196515ac41a2dcd24512a5b2219385a",
"flutter.js": "eb2682e33f25cd8f1fc59011497c35f8",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"manifest.json": "e160b2b5c8d82959e396eba695106a3e",
"assets/AssetManifest.json": "215f9069d901c1259894c37b8a43b118",
"assets/NOTICES": "e577a7b244a61561f7740e652e469a4e",
"assets/FontManifest.json": "7b2a36307916a9721811788013e65289",
"assets/packages/easy_refresh_halloween/assets/halloween.riv": "2d48634ea9b4494196b609270df1ef6d",
"assets/packages/easy_refresh_skating/assets/skating.riv": "5aadb7304ac2501ce5eb8e506a384702",
"assets/packages/easy_refresh_space/assets/SpaceDemo.flr": "5403c701d61b4da9df509b8dc29d49c4",
"assets/packages/easy_refresh_squats/assets/lumberjack_squats.riv": "1feacf1409223b579af90731766bff82",
"assets/fonts/MaterialIcons-Regular.otf": "95db9098c58fd6db106f1116bae85a0b",
"assets/assets/rive/raster_graphics.riv": "7eb3c9bd4848b5b9a4cd90b6ba5eedd3",
"assets/assets/image/pay_alipay.jpg": "5bcc3afc8daed3511430c3d2b87be549",
"assets/assets/image/user_head.jpg": "bcc8857d06fc0ea3fbddf22d4f9153d0",
"assets/assets/image/pay_wechat.jpg": "6a504cff8f708f97bc3f042abdeee362",
"assets/assets/image/cryptocurrency/usdc.svg": "3b5972c16a9795dcf6e2e2d7e3125d21",
"assets/assets/image/cryptocurrency/usdt.svg": "eac1f7bb15967c89034b440b095ad74c",
"assets/assets/image/cryptocurrency/ethereum.svg": "6e912e092584adcabd222ce3486750b3",
"assets/assets/image/cryptocurrency/dogecoin.svg": "605642c71463ca8ec99903719c98dcb0",
"assets/assets/image/cryptocurrency/bnb.svg": "cfec0f24a72a01b3ce3ae67506936c51",
"assets/assets/image/cryptocurrency/matic.svg": "561bc3f544a9969a74ebb250756667fe",
"assets/assets/image/cryptocurrency/bitcoin.svg": "f92890de8d6512e2597d378f00254e71",
"assets/assets/image/cryptocurrency/more.svg": "0c752e82c5f305f8cf3658e8812dacbe",
"assets/assets/image/cryptocurrency/trx.svg": "628da0985dd7233d1a23f9af461b5695",
"canvaskit/canvaskit.js": "c2b4e5f3d7a3d82aed024e7249a78487",
"canvaskit/profiling/canvaskit.js": "ae2949af4efc61d28a4a80fffa1db900",
"canvaskit/profiling/canvaskit.wasm": "95e736ab31147d1b2c7b25f11d4c32cd",
"canvaskit/canvaskit.wasm": "4b83d89d9fecbea8ca46f2f760c5a9ba",
".idea/workspace.xml": "9b893f0cda408a0b5d658c445c72751e",
".idea/modules.xml": "1eb3b065c55895e347308e50cd717dee",
".idea/web.iml": "d727c2a632366bca02af30b0f290fd69"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/NOTICES",
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
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
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

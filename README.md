# Google Cloud Storage `RemoteAuth` store for WhatsApp-Web.js

Built to enable usage of [Whatsapp-Web.js](https://wwebjs.dev/) with session data stored on Google Cloud Storage.

Check out the repository and source code for Whatsapp-Web.js [here](https://github.com/pedroslopez/whatsapp-web.js) and the Whatsapp-Web.js guide [here]().

### Installation and Usage

```bash
npm i wwebjs-google-cloud-storage-remoteauth-store
```

Use it in your project:

```js
const { Client: WhatsAppWebClient, RemoteAuth } = require('whatsapp-web.js');
const { Storage } = require('@google-cloud/storage');
const { GCSStore } = require('wwebjs-google-cloud-storage-remoteauth-store');
// Or const GCSStore = require('wwebjs-google-cloud-storage-remoteauth-store');
// Or import GCSStore from 'wwebjs-google-cloud-storage-remoteauth-store'
// Or import { GCSStore } from 'wwebjs-google-cloud-storage-remoteauth-store'

const cloudStorageClient = new Storage();

const gcsStore = new GCSStore({
    // Mandatory Parameters
    client: cloudStorageClient,
    bucketName: 'whatsapp-web-sessions',

    // Optional Parameters
    basePathInBucket: 'active-sessions/',
    localBaseDirectory: '', // <-- Useful when using os.tmpdir or a custom data path,
    bucketClientOptions: { ... }
});

const whatsappWebClient = new WhatsAppWebClient({
    authStrategy: new RemoteAuth({
        clientId: 'yourSessionName',
        dataPath: 'yourFolderName',
        store: gcsStore,
        backupSyncIntervalMs: 120 * 1000    // Backup session data every 2 minutes to cloud storage
    })
});
```

### Tests

The library makes use of Node.js's internal test runner + A mock library named [mock-gcs](https://github.com/aldipermanaetikaputra/mock-gcs) to mock Google Cloud Storage APIs and functionality.

Run the tests using:

```bash
npm run test
```

### Contributions

Contributions to this basic project are welcome.

To make changes or contributions to this repository, simply fork [the project](https://github.com/deve-sh/wwebjs-google-cloud-storage-store), make the necessary changes and raise a pull request.
